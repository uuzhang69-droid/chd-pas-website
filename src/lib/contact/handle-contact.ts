import type { FormField } from "../../content/types";
import type { MailConfig } from "../mail";
import type { RateLimiter } from "../security/rate-limit";
import { hashKey, checkFormTiming } from "../security/request";
import type { TurnstileResult } from "../security/turnstile";
import { cleanText, escapeHtml, normaliseEmail } from "../security/validation";
import { validateContact } from "./validate";

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
    /** Short reference shown to the visitor and written to the server log. */
    newRef?: () => string;
};

export type ContactRequest = { body: unknown; ip: string };

export type ApiResponse = {
    status: number;
    body: Record<string, unknown>;
    retryAfterSeconds?: number;
};

function defaultRef(): string {
    return globalThis.crypto.randomUUID().slice(0, 8).toUpperCase();
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

/**
 * Limits, in the order they are applied:
 * 1. a wide guard on every request from one address (protects the security check and the server);
 * 2. stricter limits on actual sending, counted only for a request that passed validation and the
 *    security check, so mistakes in the form never use them up.
 */
const GUARD = { limit: 15, windowSeconds: 600 };
const SEND_RULES = [
    { suffix: "ip10", limit: 4, windowSeconds: 600 },
    { suffix: "ip1h", limit: 10, windowSeconds: 3600 },
];
const SEND_PER_EMAIL = { limit: 3, windowSeconds: 3600 };

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
    const ref = (deps.newRef ?? defaultRef)();

    // Spam traps: a filled hidden field, or a form submitted faster than a person can type.
    if (typeof input.hp === "string" && input.hp.trim() !== "")
        return { status: 403, body: { ok: false, code: "bot" } };
    const timing = checkFormTiming(input.t, deps.nowMs());
    if (timing === "too_fast")
        return { status: 403, body: { ok: false, code: "bot" } };
    if (timing === "expired")
        return { status: 400, body: { ok: false, code: "form_expired" } };

    const ipKey = hashKey(deps.rateSalt, request.ip);
    const rateLimited = (retryAfter: number): ApiResponse => ({
        status: 429,
        body: { ok: false, code: "rate_limited", retryAfter },
        retryAfterSeconds: retryAfter,
    });

    const guard = await deps.limiter.hit({
        key: `contact:guard:${ipKey}`,
        ...GUARD,
    });
    if (!guard.allowed) return rateLimited(guard.retryAfterSeconds);

    const { values, errors } = validateContact(deps.fields, input);
    if (Object.keys(errors).length > 0)
        return { status: 400, body: { ok: false, code: "validation", errors } };

    if (deps.turnstile) {
        const check = await deps.turnstile.verify(
            deps.turnstile.secret,
            input.turnstileToken,
            request.ip,
        );
        if (!check.ok) {
            // Cloudflare's error codes name the problem (for example a hostname that is not allowed). No secrets.
            console.error("contact_turnstile_failed", {
                ref,
                reason: check.reason,
                codes: check.codes,
            });
            return check.reason === "unavailable"
                ? {
                      status: 502,
                      body: { ok: false, code: "verification_unavailable", ref },
                  }
                : { status: 403, body: { ok: false, code: "bot" } };
        }
    }

    for (const rule of SEND_RULES) {
        const hit = await deps.limiter.hit({
            key: `contact:${rule.suffix}:${ipKey}`,
            limit: rule.limit,
            windowSeconds: rule.windowSeconds,
        });
        if (!hit.allowed) return rateLimited(hit.retryAfterSeconds);
    }
    const emailKey = hashKey(deps.rateSalt, normaliseEmail(values.email ?? ""));
    const perEmail = await deps.limiter.hit({
        key: `contact:email:${emailKey}`,
        ...SEND_PER_EMAIL,
    });
    if (!perEmail.allowed) return rateLimited(perEmail.retryAfterSeconds);

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
    // Never log the enquirer's details, only the outcome. `detail` is the provider's own explanation.
    console.error("contact_mail_failed", {
        ref,
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
            ref,
        },
    };
}
