import { siteContent } from "@/content/site";
import {
    getContactRecipient,
    handleContact,
} from "@/lib/contact/handle-contact";
import { getMailConfig } from "@/lib/mail";
import { getRateLimiter } from "@/lib/security/rate-limit";
import {
    getClientIp,
    isSameOrigin,
    readJsonBody,
} from "@/lib/security/request";
import { getTurnstileSecret, verifyTurnstile } from "@/lib/security/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(
    status: number,
    body: Record<string, unknown>,
    retryAfter?: number,
) {
    return Response.json(body, {
        status,
        headers: {
            "Cache-Control": "no-store",
            ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
        },
    });
}

export async function POST(request: Request) {
    if (!isSameOrigin(request.headers))
        return json(403, { ok: false, code: "bad_origin" });

    const parsed = await readJsonBody(request);
    if (!parsed.ok)
        return json(parsed.status, { ok: false, code: parsed.code });

    // In production both Turnstile keys must be set: without them the form refuses to send, it never skips the check.
    // Outside production the check runs only when a secret is set (local work can use Cloudflare's test keys).
    const turnstileSecret = getTurnstileSecret();
    const requireTurnstile = process.env.NODE_ENV === "production";
    const turnstileReady =
        !!turnstileSecret &&
        (!requireTurnstile || !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    const result = await handleContact(
        {
            fields: siteContent.pages.contact.form.fields,
            recipient: getContactRecipient(),
            mail: getMailConfig(),
            limiter: getRateLimiter(),
            rateSalt: process.env.RATE_LIMIT_SALT || "chdc-rate-limit",
            requireTurnstile,
            turnstile: turnstileReady
                ? { secret: turnstileSecret!, verify: verifyTurnstile }
                : undefined,
            nowMs: () => Date.now(),
        },
        { body: parsed.body, ip: getClientIp(request.headers) },
    );
    return json(result.status, result.body, result.retryAfterSeconds);
}
