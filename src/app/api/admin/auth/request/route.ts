import {
    getAdminEmails,
    getAuthConfig,
    requestAdminCode,
} from "@/lib/admin/auth";
import { getRateLimiter } from "@/lib/security/rate-limit";
import {
    getClientIp,
    hashKey,
    isSameOrigin,
    readJsonBody,
} from "@/lib/security/request";
import { json } from "@/lib/security/respond";
import {
    cleanText,
    isValidEmail,
    normaliseEmail,
} from "@/lib/security/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Asks for a one-time sign-in code. The answer is the same whether or not the address is an
 * administrator, and whether or not sending worked, so this cannot be used to find out who the
 * administrators are. (Supabase only lets one code be requested per address about every minute.)
 */
export async function POST(request: Request) {
    if (!isSameOrigin(request.headers))
        return json(403, { ok: false, code: "bad_origin" });
    const parsed = await readJsonBody(request, 2_000);
    if (!parsed.ok)
        return json(parsed.status, { ok: false, code: parsed.code });

    const config = getAuthConfig();
    const allowed = getAdminEmails();
    if (!config || allowed.length === 0)
        return json(503, { ok: false, code: "not_configured" });

    const email = normaliseEmail(
        cleanText((parsed.body as { email?: unknown } | null)?.email, 254),
    );
    if (!isValidEmail(email))
        return json(400, { ok: false, code: "validation" });

    const salt = process.env.RATE_LIMIT_SALT || "chdc-rate-limit";
    const limiter = getRateLimiter();
    for (const rule of [
        {
            key: `admin-code:ip:${hashKey(salt, getClientIp(request.headers))}`,
            limit: 5,
            windowSeconds: 600,
        },
        {
            key: `admin-code:email:${hashKey(salt, email)}`,
            limit: 5,
            windowSeconds: 3600,
        },
    ]) {
        const hit = await limiter.hit(rule);
        if (!hit.allowed)
            return json(
                429,
                {
                    ok: false,
                    code: "rate_limited",
                    retryAfter: hit.retryAfterSeconds,
                },
                hit.retryAfterSeconds,
            );
    }

    // The answer is the same for every valid-looking address and for an outage, so it cannot reveal who is an
    // administrator. A failure is written to the server log (without the address) instead.
    const result = await requestAdminCode(config, email, allowed);
    if (!result.serviceOk) console.error("admin_code_request_failed");
    return json(200, { ok: true });
}
