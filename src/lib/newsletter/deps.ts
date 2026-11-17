import { getNewsletterDeliveryMode } from "../features";
import { getMailConfig } from "../mail";
import { getRateLimiter } from "../security/rate-limit";
import { getTurnstileSecret, verifyTurnstile } from "../security/turnstile";
import { getSupabaseConfig } from "../supabase/rest";
import type { NewsletterDeps } from "./service";
import type { NewsletterStore } from "./store";
import { SupabaseNewsletterStore } from "./supabase-store";

export function getNewsletterStore(): NewsletterStore | undefined {
    const config = getSupabaseConfig();
    return config ? new SupabaseNewsletterStore(config) : undefined;
}

/**
 * Links in emails use APP_BASE_URL. Outside production a local request address is accepted so the
 * flow can be tried on a development machine. Production without APP_BASE_URL is "not configured",
 * because the Host header must not decide where a confirmation link points.
 */
function baseUrl(requestOrigin?: string): string | undefined {
    const configured = process.env.APP_BASE_URL?.trim();
    if (configured) return configured;
    return process.env.NODE_ENV === "production" ? undefined : requestOrigin;
}

export function getNewsletterDeps(requestOrigin?: string): NewsletterDeps {
    const secret = process.env.NEWSLETTER_TOKEN_SECRET;
    const turnstileSecret = getTurnstileSecret();
    // In production both Turnstile keys are required, as for the contact form; the check is never skipped.
    const requireTurnstile = process.env.NODE_ENV === "production";
    const turnstileReady =
        !!turnstileSecret &&
        (!requireTurnstile || !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    return {
        store: getNewsletterStore(),
        mode: getNewsletterDeliveryMode(),
        mail: getMailConfig(),
        // A short secret would make tokens guessable, so it counts as "not configured".
        tokenSecret: secret && secret.length >= 32 ? secret : undefined,
        baseUrl: baseUrl(requestOrigin),
        limiter: getRateLimiter(),
        rateSalt: process.env.RATE_LIMIT_SALT || "chdc-rate-limit",
        requireTurnstile,
        turnstile: turnstileReady
            ? { secret: turnstileSecret!, verify: verifyTurnstile }
            : undefined,
        nowMs: () => Date.now(),
    };
}
