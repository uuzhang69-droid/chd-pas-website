import {
    getAdminEmails,
    getAuthConfig,
    lookupAdmin,
    revokeAdminSession,
} from "@/lib/admin/auth";
import {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    clearedCookies,
    parseCookies,
} from "@/lib/admin/session";
import { getNewsletterStore } from "@/lib/newsletter/deps";
import { isSameOrigin } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Signs out. The browser cookies are always cleared, even when Supabase cannot be reached. The session is
 * also ended at Supabase, so the refresh token cannot bring it back, and the answer says truthfully
 * whether Supabase confirmed that (`revoked`). Tokens are never sent to the browser.
 */
export async function POST(request: Request) {
    if (!isSameOrigin(request.headers))
        return Response.json(
            { ok: false, code: "bad_origin" },
            { status: 403, headers: { "Cache-Control": "no-store" } },
        );

    const cookies = parseCookies(request.headers.get("cookie"));
    const accessToken = cookies[ACCESS_COOKIE];
    const refreshToken = cookies[REFRESH_COOKIE];
    const config = getAuthConfig();

    let revoked = false;
    let reason: string | undefined;
    let actor: string | undefined;
    if (!config) {
        reason = "not_configured";
    } else {
        // Who is signing out, for the audit trail. Best effort: a failure here never blocks signing out.
        const who = await lookupAdmin(config, accessToken, getAdminEmails());
        if (who.kind === "admin") actor = who.email;
        const result = await revokeAdminSession(config, accessToken, refreshToken);
        revoked = result.revoked;
        if (!result.revoked) reason = result.reason;
        if (!result.revoked && result.reason !== "no_session")
            console.error("admin_logout_not_revoked", { reason: result.reason });
    }
    if (actor)
        await getNewsletterStore()
            ?.logEvent(null, "admin_logout", actor)
            .catch(() => undefined);

    const headers = new Headers({ "Cache-Control": "no-store" });
    for (const value of clearedCookies()) headers.append("Set-Cookie", value);
    return Response.json(
        { ok: true, revoked, ...(reason ? { reason } : {}) },
        { headers },
    );
}
