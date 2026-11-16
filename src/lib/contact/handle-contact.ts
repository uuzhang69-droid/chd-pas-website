import type { FormField } from "../../content/types";
import type { MailConfig } from "../mail";
import type { RateLimiter } from "../security/rate-limit";
import { hashKey, checkFormTiming } from "../security/request";
import type { TurnstileResult } from "../security/turnstile";
import {
    cleanText,
    countLinks,
    escapeHtml,
    isValidEmail,
    normaliseEmail,
} from "../security/validation";

/** Test inbox. It is only used outside production; production must set CONTACT_RECIPIENT_EMAIL itself. */
export const TEST_CONTACT_RECIPIENT = "website.countyhalldance@gmail.com";

export function getContactRecipient(): string | undefined {
    const configured = process.env.CONTACT_RECIPIENT_EMAIL?.trim();
    if (configured) return configured;
    return process.env.NODE_ENV === "production"
        ? undefined
        : TEST_CONTACT_RECIPIENT;
}

export type ContactDeps = {
    fields: FormField[];
    recipient?: string;
    mail?: MailConfig;
    limiter: RateLimiter;
    rateSalt: string;
    turnstile?: {
        secret: string;
        verify: (
            secret: string,
            token: unknown,
            ip: string,
        ) => Promise<TurnstileResult>;
    };
    /** When true (production), a missing Turnstile configuration refuses every submission instead of skipping the check. */
    requireTurnstile?: boolean;
    nowMs: () => number;
};

export type ContactRequest = { body: unknown; ip: string };

export type ApiResponse = {
    status: number;
    body: Record<string, unknown>;
    retryAfterSeconds?: number;
};

const LIMITS = { name: 100, email: 254, phone: 20, message: 5000, other: 200 };

function limitFor(field: FormField): number {
    if (field.name === "message" || field.type === "textarea")
        return LIMITS.message;
    if (field.name === "name") return LIMITS.name;
    if (field.type === "email") return LIMITS.email;
    if (field.type === "tel") return LIMITS.phone;
    return LIMITS.other;
}

type Cleaned = {
    values: Record<string, string>;
    errors: Record<string, string>;
};

function validate(fields: FormField[], body: Record<string, unknown>): Cleaned {
    const values: Record<string, string> = {};
    const errors: Record<string, string> = {};
    for (const field of fields) {
        // A conditional field (for example "Please specify") only counts while its trigger matches.
        // The trigger is checked against the server's own cleaned value, never the browser's say-so.
        if (field.showWhen) {
            const trigger = fields.find((item) => item.name === field.showWhen?.field);
            const triggerValue = trigger
                ? cleanText(body[trigger.name], limitFor(trigger), false)
                : "";
            if (triggerValue !== field.showWhen.value) {
                values[field.name] = "";
                continue;
            }
        }
        const raw = body[field.name];
        const value = cleanText(
            raw,
            limitFor(field),
            field.type === "textarea",
        );
        values[field.name] = value;
        const required = field.required === true || field.type === "email";
        if (!value) {
            if (required) errors[field.name] = `${field.label} is required.`;
            continue;
        }
        if (field.type === "email" && !isValidEmail(value))
            errors[field.name] = "Please enter a valid email address.";
        else if (field.type === "tel" && !/^[+()\-\d\s]{7,20}$/.test(value))
            errors[field.name] = "Please enter a valid phone number.";
        else if (field.type === "select") {
            if (!field.options?.some((option) => option.value === value))
                errors[field.name] = "Please choose one of the options.";
        } else if (field.name === "name" && value.length < 2)
            errors[field.name] = "Please enter your name.";
        else if (field.name === "message") {
            if (value.length < 10)
                errors[field.name] =
                    "Please write a little more (at least 10 characters).";
            else if (countLinks(value) > 3)
                errors[field.name] = "Please remove some of the links.";
        }
    }
    return { values, errors };
}

function subjectLabel(
    fields: FormField[],
    values: Record<string, string>,
): string {
    const field = fields.find(
        (item) => item.name === "subject" || item.name === "about",
    );
    if (!field) return "Website enquiry";
    const label = field.options?.find(
        (option) => option.value === values[field.name],
    )?.label;
    return label ?? "Website enquiry";
}

/** The visitor's own topic, for the "Other enquiry" category. Empty when not given. */
function customTopic(
    fields: FormField[],
    values: Record<string, string>,
): string {
    const field = fields.find((item) => item.showWhen);
    return field ? (values[field.name] ?? "") : "";
}

export async function handleContact(
    deps: ContactDeps,
    request: ContactRequest,
): Promise<ApiResponse> {
    if (
        !deps.mail ||
        !deps.recipient ||
        (deps.requireTurnstile && !deps.turnstile)
    )
        return { status: 503, body: { ok: false, code: "not_configured" } };

    const body = request.body;
    if (!body || typeof body !== "object" || Array.isArray(body))
        return { status: 400, body: { ok: false, code: "invalid_json" } };
    const input = body as Record<string, unknown>;

    // Spam traps: a filled hidden field, or a form submitted faster than a person can type.
    if (typeof input.hp === "string" && input.hp.trim() !== "")
        return { status: 403, body: { ok: false, code: "bot" } };
    const timing = checkFormTiming(input.t, deps.nowMs());
    if (timing === "too_fast")
        return { status: 403, body: { ok: false, code: "bot" } };
    if (timing === "expired")
        return { status: 400, body: { ok: false, code: "form_expired" } };

    const ipKey = hashKey(deps.rateSalt, request.ip);
    for (const rule of [
        { key: `contact:ip10:${ipKey}`, limit: 2, windowSeconds: 600 },
        { key: `contact:ip1h:${ipKey}`, limit: 5, windowSeconds: 3600 },
    ]) {
        const result = await deps.limiter.hit(rule);
        if (!result.allowed)
            return {
                status: 429,
                body: {
                    ok: false,
                    code: "rate_limited",
                    retryAfter: result.retryAfterSeconds,
                },
                retryAfterSeconds: result.retryAfterSeconds,
            };
    }

    const { values, errors } = validate(deps.fields, input);
    if (Object.keys(errors).length > 0)
        return { status: 400, body: { ok: false, code: "validation", errors } };

    if (deps.turnstile) {
        const check = await deps.turnstile.verify(
            deps.turnstile.secret,
            input.turnstileToken,
            request.ip,
        );
        if (!check.ok)
            return check.reason === "unavailable"
                ? {
                      status: 502,
                      body: { ok: false, code: "verification_unavailable" },
                  }
                : { status: 403, body: { ok: false, code: "bot" } };
    }

    const emailKey = hashKey(deps.rateSalt, normaliseEmail(values.email ?? ""));
    const perEmail = await deps.limiter.hit({
        key: `contact:email:${emailKey}`,
        limit: 3,
        windowSeconds: 3600,
    });
    if (!perEmail.allowed)
        return {
            status: 429,
            body: {
                ok: false,
                code: "rate_limited",
                retryAfter: perEmail.retryAfterSeconds,
            },
            retryAfterSeconds: perEmail.retryAfterSeconds,
        };

    const label = subjectLabel(deps.fields, values);
    const topic = customTopic(deps.fields, values);
    const lines = deps.fields
        .map((field) => {
            const value = values[field.name];
            if (!value) return "";
            const shown =
                field.type === "select"
                    ? (field.options?.find((option) => option.value === value)
                          ?.label ?? value)
                    : value;
            // "(optional)" is a hint for the visitor, not part of the field's name.
            return `${field.label.replace(/\s*\(optional\)\s*$/i, "")}: ${shown}`;
        })
        .filter(Boolean);
    const sentAt = new Date(deps.nowMs()).toLocaleString("en-GB", {
        timeZone: "Europe/London",
    });
    const text = `${lines.join("\n\n")}\n\n--\nSent from the website contact form, ${sentAt} (London time).\nReply to this email to answer the enquirer.`;
    const html = `${lines
        .map(
            (line) => `<p style="white-space:pre-wrap">${escapeHtml(line)}</p>`,
        )
        .join(
            "",
        )}<hr><p style="color:#666">Sent from the website contact form, ${escapeHtml(sentAt)} (London time). Reply to this email to answer the enquirer.</p>`;

    const result = await deps.mail.sender.send({
        to: deps.recipient,
        from: deps.mail.from,
        replyTo: values.email,
        subject: cleanText(
            `Website enquiry: ${label}${topic ? ` - ${topic.slice(0, 60)}` : ""}${values.name ? ` from ${values.name}` : ""}`,
            150,
        ),
        text,
        html,
    });

    if (result.ok) return { status: 200, body: { ok: true } };
    // Never log the enquirer's details, only the outcome.
    console.error("contact_mail_failed", {
        reason: result.reason,
        status: result.status,
        detail: "detail" in result ? result.detail : undefined,
    });
    return {
        status: 502,
        body: {
            ok: false,
            code:
                result.reason === "rejected"
                    ? "mail_rejected"
                    : "mail_unavailable",
        },
    };
}
