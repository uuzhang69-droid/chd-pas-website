import {
    getAdminEmails,
    getAuthConfig,
    lookupAdmin,
    type Tokens,
} from "./auth";

export const ACCESS_COOKIE = "chdc_admin_at";
export const REFRESH_COOKIE = "chdc_admin_rt";

export function parseCookies(
    header: string | null | undefined,
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const part of (header ?? "").split(";")) {
        const index = part.indexOf("=");
        if (index < 0) continue;
        out[part.slice(0, index).trim()] = decodeURIComponent(
            part.slice(index + 1).trim(),
        );
    }
    return out;
}

function cookie(name: string, value: string, maxAgeSeconds: number): string {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    // Strict: the cookie is never sent on requests started from another site.
    return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

export function sessionCookies(tokens: Tokens): string[] {
    return [
        cookie(
            ACCESS_COOKIE,
            tokens.accessToken,
            Math.max(60, tokens.expiresIn),
        ),
        cookie(REFRESH_COOKIE, tokens.refreshToken, 7 * 24 * 3600),
    ];
}

export function clearedCookies(): string[] {
    return [cookie(ACCESS_COOKIE, "", 0), cookie(REFRESH_COOKIE, "", 0)];
}

export type AdminCheck =
    | { ok: true; email: string }
    | {
          ok: false;
          /** "unavailable": Supabase could not be reached. Access is refused, but the session is not discarded. */
          reason: "not_configured" | "signed_out" | "needs_refresh" | "unavailable";
      };

/**
 * The single gate for every admin page and API. It does not trust the proxy or the page:
 * each handler calls this itself and gets the verified, allow-listed administrator or a refusal.
 */
export async function checkAdmin(
    cookieHeader: string | null | undefined,
    fetchImpl: typeof fetch = fetch,
): Promise<AdminCheck> {
    const config = getAuthConfig();
    const allowed = getAdminEmails();
    if (!config || allowed.length === 0)
        return { ok: false, reason: "not_configured" };
    const cookies = parseCookies(cookieHeader);
    const found = await lookupAdmin(
        config,
        cookies[ACCESS_COOKIE],
        allowed,
        fetchImpl,
    );
    if (found.kind === "admin") return { ok: true, email: found.email };
    if (found.kind === "unavailable")
        return { ok: false, reason: "unavailable" };
    return {
        ok: false,
        reason: cookies[REFRESH_COOKIE] ? "needs_refresh" : "signed_out",
    };
}
