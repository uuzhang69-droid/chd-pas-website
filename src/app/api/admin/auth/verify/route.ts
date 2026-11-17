import {
    getAdminEmails,
    getAuthConfig,
    verifyAdminCode,
} from "@/lib/admin/auth";
import { sessionCookies } from "@/lib/admin/session";
import { getNewsletterStore } from "@/lib/newsletter/deps";
import { getRateLimiter } from "@/lib/security/rate-limit";
import {
    getClientIp,
    hashKey,
    isSameOrigin,
    readJsonBody,
} from "@/lib/security/request";
import { cleanText, normaliseEmail } from "@/lib/security/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(
    status: number,
    body: Record<string, unknown>,
    cookies: string[] = [],
    retryAfter?: number,
) {
    const headers = new Headers({
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
    });
    for (const value of cookies) headers.append("Set-Cookie", value);
    if (retryAfter) headers.set("Retry-After", String(retryAfter));
    return new Response(JSON.stringify(body), { status, headers });
}

export async function POST(request: Request) {
    if (!isSameOrigin(request.headers))
        return reply(403, { ok: false, code: "bad_origin" });
    const parsed = await readJsonBody(request, 2_000);
    if (!parsed.ok)
        return reply(parsed.status, { ok: false, code: parsed.code });

    const config = getAuthConfig();
    const allowed = getAdminEmails();
    if (!config || allowed.length === 0)
        return reply(503, { ok: false, code: "not_configured" });

    const input = (parsed.body ?? {}) as { email?: unknown; code?: unknown };
    const email = normaliseEmail(cleanText(input.email, 254));
    const code = cleanText(input.code, 12);

    const salt = process.env.RATE_LIMIT_SALT || "chdc-rate-limit";
    const limiter = getRateLimiter();
    for (const rule of [
        {
            key: `admin-verify:ip:${hashKey(salt, getClientIp(request.headers))}`,
            limit: 10,
            windowSeconds: 600,
        },
        {
            key: `admin-verify:email:${hashKey(salt, email)}`,
            limit: 10,
            windowSeconds: 3600,
        },
    ]) {
        const hit = await limiter.hit(rule);
        if (!hit.allowed)
            return reply(
                429,
                {
                    ok: false,
                    code: "rate_limited",
                    retryAfter: hit.retryAfterSeconds,
                },
                [],
                hit.retryAfterSeconds,
            );
    }

    const tokens = await verifyAdminCode(config, email, code, allowed);
    if (!tokens) return reply(401, { ok: false, code: "invalid" });
    // Audit trail: who signed in (best effort; never blocks the sign-in).
    await getNewsletterStore()
        ?.logEvent(null, "admin_login", email)
        .catch(() => undefined);
    return reply(200, { ok: true }, sessionCookies(tokens));
}
