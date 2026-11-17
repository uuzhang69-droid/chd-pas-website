import {
    getAdminEmails,
    getAuthConfig,
    refreshSession,
} from "@/lib/admin/auth";
import {
    REFRESH_COOKIE,
    clearedCookies,
    parseCookies,
    sessionCookies,
} from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The admin page cannot set cookies itself, so when the short-lived access token has run out it sends the
 * browser here. A valid refresh token gets a new session (and its replacement refresh token, because
 * Supabase uses each one once); otherwise the person goes back to the sign-in page.
 * If Supabase is only temporarily unavailable, the cookies are kept so the person is not signed out by an outage.
 * The destination is fixed, so this cannot be used as an open redirect.
 */
export async function GET(request: Request) {
    const origin = new URL(request.url).origin;
    const config = getAuthConfig();
    const refreshToken = parseCookies(request.headers.get("cookie"))[
        REFRESH_COOKIE
    ];
    const result = config
        ? await refreshSession(config, refreshToken, getAdminEmails())
        : ({ kind: "invalid" } as const);

    const headers = new Headers({ "Cache-Control": "no-store" });
    if (result.kind === "ok") {
        headers.set("Location", `${origin}/admin/newsletter`);
        for (const value of sessionCookies(result.tokens))
            headers.append("Set-Cookie", value);
    } else if (result.kind === "unavailable") {
        headers.set("Location", `${origin}/admin/login?notice=unavailable`);
    } else {
        headers.set("Location", `${origin}/admin/login`);
        for (const value of clearedCookies()) headers.append("Set-Cookie", value);
    }
    return new Response(null, { status: 303, headers });
}
