import type { ApiResponse } from "../contact/handle-contact";
import type { NewsletterDeliveryMode } from "../features";
import { isLegalPagePublished } from "../legal-pages";
import type { MailConfig, MailMessage, MailResult } from "../mail";
import type { RateLimiter } from "../security/rate-limit";
import { checkFormTiming, hashKey } from "../security/request";
import { createToken, verifyToken } from "../security/tokens";
import type { TurnstileResult } from "../security/turnstile";
import {
    cleanText,
    isValidEmail,
    normaliseEmail,
} from "../security/validation";
import { CONSENT_TEXT_VERSION, NEWSLETTER_SOURCES } from "./consent";
import {
    DuplicateSubscriberError,
    type NewsletterStore,
    type Subscriber,
    type SubscriberQuery,
} from "./store";

/** See src/lib/features.ts. Left out, it means "collect_only": no email is ever sent. */
export type NewsletterDeps = {
    store?: NewsletterStore;
    mode?: NewsletterDeliveryMode;
    mail?: MailConfig;
    tokenSecret?: string;
    /** Absolute site address used in email links, for example https://www.example.com */
    baseUrl?: string;
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
    /** When true (production), sign-up refuses to run unless the Turnstile check is configured. */
    requireTurnstile?: boolean;
    nowMs: () => number;
};

const CONFIRM_TOKEN_DAYS = 7;
const RESEND_COOLDOWN_MS = 10 * 60 * 1000;
const NOT_CONFIGURED: ApiResponse = {
    status: 503,
    body: { ok: false, code: "not_configured" },
};

function ready(deps: NewsletterDeps) {
    if (!deps.store || !deps.mail || !deps.tokenSecret || !deps.baseUrl)
        return undefined;
    return {
        store: deps.store,
        mail: deps.mail,
        tokenSecret: deps.tokenSecret,
        baseUrl: deps.baseUrl.replace(/\/+$/, ""),
    };
}

/** Sign-up needs only the database in collect-only mode; the email workflow also needs mail, the token secret and the site address. */
function readyForSubscribe(deps: NewsletterDeps) {
    const mode: NewsletterDeliveryMode = deps.mode ?? "collect_only";
    if (mode === "collect_only") {
        if (!deps.store) return undefined;
        return { mode, store: deps.store } as const;
    }
    const full = ready(deps);
    return full ? ({ mode, ...full } as const) : undefined;
}

function rateLimited(retryAfter: number): ApiResponse {
    return {
        status: 429,
        body: { ok: false, code: "rate_limited", retryAfter },
        retryAfterSeconds: retryAfter,
    };
}

async function logEvent(
    store: NewsletterStore,
    id: string | null,
    event: string,
    actor = "visitor",
) {
    try {
        await store.logEvent(id, event, actor);
    } catch {
        // The audit trail must never block the visitor's request.
    }
}

export function confirmationEmail(
    to: string,
    from: string,
    baseUrl: string,
    token: string,
): MailMessage {
    const link = `${baseUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`;
    // Only link to the privacy policy once it has been approved and published.
    const privacy = isLegalPagePublished("/privacy");
    const text =`Please confirm your subscription to County Hall Dance Centre news.

Confirm here: ${link}

You will not receive any news from us until you confirm. If you did not ask for this, ignore this email and nothing will happen.
This link works for ${CONFIRM_TOKEN_DAYS} days.${privacy ? ` How we use your email: ${baseUrl}/privacy` : ""}`;
    const html = `<p>Please confirm your subscription to County Hall Dance Centre news.</p><p><a href="${link}">Confirm my subscription</a></p><p style="color:#555">You will not receive any news from us until you confirm. If you did not ask for this, ignore this email and nothing will happen.<br>This link works for ${CONFIRM_TOKEN_DAYS} days.${privacy ? ` <a href="${baseUrl}/privacy">How we use your email</a>.` : ""}</p>`;
    return {
        to,
        from,
        subject: "Please confirm your subscription",
        text,
        html,
    };
}

export function welcomeEmail(
    to: string,
    from: string,
    baseUrl: string,
    unsubscribeToken: string,
): MailMessage {
    const link = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    return {
        to,
        from,
        subject: "You are subscribed",
        text: `Thank you, your subscription to County Hall Dance Centre news is confirmed.\n\nYou can unsubscribe at any time: ${link}`,
        html: `<p>Thank you, your subscription to County Hall Dance Centre news is confirmed.</p><p>You can <a href="${link}">unsubscribe at any time</a>.</p>`,
    };
}

function mailFailure(result: Extract<MailResult, { ok: false }>): ApiResponse {
    console.error("newsletter_mail_failed", {
        reason: result.reason,
        status: result.status,
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

const ACCEPTED: ApiResponse = {
    status: 202,
    body: { ok: true, code: "check_email" },
};

/** Collect-only answer: the request was received. It says nothing about the address having been verified or about a subscription. */
const RECEIVED: ApiResponse = {
    status: 202,
    body: { ok: true, code: "request_received" },
};

/**
 * Double opt-in sign-up. A row is never "active" here: the only way to become active is the
 * confirmation link. Every valid request gets the same answer, so the form cannot be used to
 * discover who is already on the list.
 */
export async function subscribe(
    deps: NewsletterDeps,
    request: { body: unknown; ip: string },
): Promise<ApiResponse> {
    const config = readyForSubscribe(deps);
    if (!config || (deps.requireTurnstile && !deps.turnstile))
        return NOT_CONFIGURED;

    if (
        !request.body ||
        typeof request.body !== "object" ||
        Array.isArray(request.body)
    )
        return { status: 400, body: { ok: false, code: "invalid_json" } };
    const input = request.body as Record<string, unknown>;

    if (typeof input.hp === "string" && input.hp.trim() !== "")
        return { status: 403, body: { ok: false, code: "bot" } };
    const timing = checkFormTiming(input.t, deps.nowMs());
    if (timing === "too_fast")
        return { status: 403, body: { ok: false, code: "bot" } };
    if (timing === "expired")
        return { status: 400, body: { ok: false, code: "form_expired" } };

    // Limits, in order: a wide guard on every request from one address; then the strict limits, counted only
    // for a request that passed validation and the security check (so form mistakes never use them up); then
    // a limit on confirmation emails per address, counted only when an email is actually about to be sent.
    const ipKey = hashKey(deps.rateSalt, request.ip);
    const guard = await deps.limiter.hit({
        key: `newsletter:guard:${ipKey}`,
        limit: 20,
        windowSeconds: 600,
    });
    if (!guard.allowed) return rateLimited(guard.retryAfterSeconds);

    const email = cleanText(input.email, 254);
    const errors: Record<string, string> = {};
    if (!email) errors.email = "Please enter your email address.";
    else if (!isValidEmail(email))
        errors.email = "Please enter a valid email address.";
    if (input.consent !== true)
        errors.consent = "Please tick the box to agree before subscribing.";
    if (Object.keys(errors).length > 0)
        return { status: 400, body: { ok: false, code: "validation", errors } };
    if (input.consentVersion !== CONSENT_TEXT_VERSION)
        return { status: 400, body: { ok: false, code: "form_outdated" } };
    const source = (NEWSLETTER_SOURCES as readonly string[]).includes(
        String(input.source),
    )
        ? String(input.source)
        : "footer";
    const sourcePath =
        typeof input.sourcePath === "string" &&
        /^\/[\w\-./]{0,199}$/.test(input.sourcePath)
            ? input.sourcePath
            : undefined;

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

    for (const rule of [
        { key: `newsletter:ip10:${ipKey}`, limit: 3, windowSeconds: 600 },
        { key: `newsletter:ip1h:${ipKey}`, limit: 8, windowSeconds: 3600 },
    ]) {
        const hit = await deps.limiter.hit(rule);
        if (!hit.allowed) return rateLimited(hit.retryAfterSeconds);
    }

    const normalised = normaliseEmail(email);
    const nowIso = new Date(deps.nowMs()).toISOString();
    if (config.mode === "collect_only")
        return collectRequest(config.store, deps, { email, normalised, source, sourcePath, nowIso, ipKey });
    let subscriber: Subscriber | undefined;
    try {
        subscriber = await config.store.findByEmail(normalised);
        // Nothing new to send: already confirmed, or a confirmation went out a moment ago. Same neutral answer,
        // and these do not count against the per-address email limit.
        if (subscriber?.status === "active") return ACCEPTED;
        if (
            subscriber?.status === "pending" &&
            subscriber.lastConfirmationSentAt &&
            deps.nowMs() - Date.parse(subscriber.lastConfirmationSentAt) <
                RESEND_COOLDOWN_MS
        )
            return ACCEPTED;
        // A confirmation email will be sent from here: at most three an hour to one address.
        const perEmail = await deps.limiter.hit({
            key: `newsletter:email:${hashKey(deps.rateSalt, normalised)}`,
            limit: 3,
            windowSeconds: 3600,
        });
        if (!perEmail.allowed) return rateLimited(perEmail.retryAfterSeconds);

        if (!subscriber) {
            try {
                subscriber = await config.store.create({
                    email,
                    source,
                    sourcePath,
                    consentTextVersion: CONSENT_TEXT_VERSION,
                    consentGivenAt: nowIso,
                });
            } catch (error) {
                if (!(error instanceof DuplicateSubscriberError)) throw error;
                subscriber = await config.store.findByEmail(normalised);
            }
            if (!subscriber) throw new Error("subscriber missing after create");
            await logEvent(config.store, subscriber.id, "subscribe_requested");
        } else {
            // Pending again, or an unsubscribed person asking again: fresh consent, fresh confirmation.
            subscriber =
                (await config.store.update(subscriber.id, {
                    status: "pending",
                    consentTextVersion: CONSENT_TEXT_VERSION,
                    consentGivenAt: nowIso,
                    confirmedAt: null,
                    unsubscribedAt: null,
                })) ?? subscriber;
            await logEvent(config.store, subscriber.id, "subscribe_requested");
        }

        const token = createToken(
            config.tokenSecret,
            "confirm",
            subscriber.id,
            Math.floor(deps.nowMs() / 1000) + CONFIRM_TOKEN_DAYS * 86400,
        );
        const result = await config.mail.sender.send(
            confirmationEmail(
                subscriber.email,
                config.mail.from,
                config.baseUrl,
                token,
            ),
        );
        if (!result.ok) return mailFailure(result);
        await config.store.update(subscriber.id, {
            lastConfirmationSentAt: nowIso,
        });
        await logEvent(config.store, subscriber.id, "confirmation_sent");
        return ACCEPTED;
    } catch (error) {
        console.error(
            "newsletter_subscribe_failed",
            error instanceof Error ? error.message : "unknown",
        );
        return { status: 503, body: { ok: false, code: "unavailable" } };
    }
}

/**
 * Collect-only sign-up. Stores the request as an UNVERIFIED "pending" record with the consent version, time and source,
 * and sends nothing: no confirmation email, no welcome email, no call to the mail provider. Nobody becomes "active" here.
 * Duplicates never create a second record, and every valid request gets the same answer.
 */
async function collectRequest(
    store: NewsletterStore,
    deps: NewsletterDeps,
    request: { email: string; normalised: string; source: string; sourcePath?: string; nowIso: string; ipKey: string },
): Promise<ApiResponse> {
    try {
        const existing = await store.findByEmail(request.normalised);
        // Already on the list (unverified or verified): nothing to add, nothing to change, the same neutral answer.
        if (existing && existing.status !== "unsubscribed") return RECEIVED;
        const perEmail = await deps.limiter.hit({
            key: `newsletter:email:${hashKey(deps.rateSalt, request.normalised)}`,
            limit: 3,
            windowSeconds: 3600,
        });
        if (!perEmail.allowed) return rateLimited(perEmail.retryAfterSeconds);

        let subscriber: Subscriber | undefined = existing;
        if (!existing) {
            try {
                subscriber = await store.create({
                    email: request.email,
                    source: request.source,
                    sourcePath: request.sourcePath,
                    consentTextVersion: CONSENT_TEXT_VERSION,
                    consentGivenAt: request.nowIso,
                });
            } catch (error) {
                if (!(error instanceof DuplicateSubscriberError)) throw error;
                return RECEIVED; // a simultaneous request created it first
            }
        } else {
            // Someone who had unsubscribed asks again: a fresh, still UNVERIFIED request with fresh consent details.
            subscriber =
                (await store.update(existing.id, {
                    status: "pending",
                    consentTextVersion: CONSENT_TEXT_VERSION,
                    consentGivenAt: request.nowIso,
                    confirmedAt: null,
                    unsubscribedAt: null,
                })) ?? existing;
        }
        await logEvent(store, subscriber.id, "subscribe_requested");
        return RECEIVED;
    } catch (error) {
        console.error("newsletter_collect_failed", error instanceof Error ? error.message : "unknown");
        return { status: 503, body: { ok: false, code: "unavailable" } };
    }
}

/** Confirms a pending subscription. Only a valid, unexpired confirm token can make anyone active. */
export async function confirm(
    deps: NewsletterDeps,
    request: { token: unknown; ip: string },
): Promise<ApiResponse> {
    const config = ready(deps);
    if (!config) return NOT_CONFIGURED;
    const hit = await deps.limiter.hit({
        key: `newsletter:token:${hashKey(deps.rateSalt, request.ip)}`,
        limit: 20,
        windowSeconds: 600,
    });
    if (!hit.allowed) return rateLimited(hit.retryAfterSeconds);

    const verified = verifyToken(
        config.tokenSecret,
        "confirm",
        String(request.token ?? ""),
        Math.floor(deps.nowMs() / 1000),
    );
    if (!verified.ok)
        return { status: 400, body: { ok: false, code: verified.reason } };
    try {
        const subscriber = await config.store.findById(verified.subscriberId);
        // An unsubscribed or deleted person cannot be re-activated by an old link.
        if (!subscriber || subscriber.status === "unsubscribed")
            return { status: 400, body: { ok: false, code: "invalid" } };
        const unsubscribeToken = createToken(
            config.tokenSecret,
            "unsubscribe",
            subscriber.id,
        );
        if (subscriber.status === "pending") {
            await config.store.update(subscriber.id, {
                status: "active",
                confirmedAt: new Date(deps.nowMs()).toISOString(),
            });
            await logEvent(config.store, subscriber.id, "confirmed");
            // Best effort: the confirmation already succeeded even if this email cannot be sent.
            await config.mail.sender
                .send(
                    welcomeEmail(
                        subscriber.email,
                        config.mail.from,
                        config.baseUrl,
                        unsubscribeToken,
                    ),
                )
                .catch(() => undefined);
        }
        return {
            status: 200,
            body: {
                ok: true,
                unsubscribeUrl: `${config.baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
            },
        };
    } catch (error) {
        console.error(
            "newsletter_confirm_failed",
            error instanceof Error ? error.message : "unknown",
        );
        return { status: 503, body: { ok: false, code: "unavailable" } };
    }
}

/** Unsubscribes from a signed link. Works for pending and active subscribers and never reveals more than success. */
export async function unsubscribe(
    deps: NewsletterDeps,
    request: { token: unknown; ip: string },
): Promise<ApiResponse> {
    const config = ready(deps);
    if (!config) return NOT_CONFIGURED;
    const hit = await deps.limiter.hit({
        key: `newsletter:token:${hashKey(deps.rateSalt, request.ip)}`,
        limit: 20,
        windowSeconds: 600,
    });
    if (!hit.allowed) return rateLimited(hit.retryAfterSeconds);

    const verified = verifyToken(
        config.tokenSecret,
        "unsubscribe",
        String(request.token ?? ""),
        Math.floor(deps.nowMs() / 1000),
    );
    if (!verified.ok)
        return { status: 400, body: { ok: false, code: verified.reason } };
    try {
        const subscriber = await config.store.findById(verified.subscriberId);
        if (subscriber && subscriber.status !== "unsubscribed") {
            await config.store.update(subscriber.id, {
                status: "unsubscribed",
                unsubscribedAt: new Date(deps.nowMs()).toISOString(),
            });
            await logEvent(config.store, subscriber.id, "unsubscribed");
        }
        return { status: 200, body: { ok: true } };
    } catch (error) {
        console.error(
            "newsletter_unsubscribe_failed",
            error instanceof Error ? error.message : "unknown",
        );
        return { status: 503, body: { ok: false, code: "unavailable" } };
    }
}

/** Admin actions. The caller has already proved the visitor is an allow-listed administrator. */
export async function adminList(
    store: NewsletterStore,
    query: SubscriberQuery,
) {
    return store.list(query);
}

export async function adminUnsubscribe(
    store: NewsletterStore,
    id: string,
    actor: string,
    nowMs: number,
) {
    const subscriber = await store.findById(id);
    if (!subscriber) return false;
    await store.update(id, {
        status: "unsubscribed",
        unsubscribedAt: new Date(nowMs).toISOString(),
    });
    await logEvent(store, id, "unsubscribed_by_admin", actor);
    return true;
}

export async function adminDelete(
    store: NewsletterStore,
    id: string,
    actor: string,
) {
    const removed = await store.delete(id);
    if (removed) await logEvent(store, null, "deleted_by_admin", actor);
    return removed;
}
