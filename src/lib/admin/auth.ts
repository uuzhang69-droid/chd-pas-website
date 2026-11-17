/**
 * Administrator sign-in through Supabase Auth (GoTrue) over plain HTTPS.
 * - Only addresses in NEWSLETTER_ADMIN_EMAILS can ever get in, checked before a code is requested
 *   and again after the code is verified.
 * - Codes are requested with create_user=false, so this can never create an account even if public
 *   sign-ups were switched on by mistake. (Switch public sign-ups off in Supabase as well.)
 * - Passwords are never handled here: Supabase issues a one-time code by email.
 */
type Fetch = typeof fetch;

export type AuthConfig = { url: string; anonKey: string };

export type Tokens = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
};

export function getAuthConfig(): AuthConfig | undefined {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Legacy "anon" key, the newer publishable key, and the names the Vercel integration uses.
    const anonKey =
        process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anonKey) return undefined;
    return { url: url.replace(/\/+$/, ""), anonKey };
}

export function getAdminEmails(): string[] {
    return (process.env.NEWSLETTER_ADMIN_EMAILS ?? "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
}

export function isAdminEmail(
    email: string | undefined,
    allowed: string[] = getAdminEmails(),
): boolean {
    return !!email && allowed.includes(email.trim().toLowerCase());
}

async function gotrue(
    config: AuthConfig,
    path: string,
    init: RequestInit,
    fetchImpl: Fetch,
) {
    return fetchImpl(`${config.url}/auth/v1/${path}`, {
        ...init,
        headers: {
            apikey: config.anonKey,
            "Content-Type": "application/json",
            ...(init.headers as Record<string, string> | undefined),
        },
        signal: AbortSignal.timeout(10_000),
    });
}

/** Asks Supabase to email a one-time code. Returns false only when the service itself failed. */
export async function requestAdminCode(
    config: AuthConfig,
    email: string,
    allowed: string[],
    fetchImpl: Fetch = fetch,
): Promise<{ requested: boolean; serviceOk: boolean }> {
    if (!isAdminEmail(email, allowed))
        return { requested: false, serviceOk: true };
    try {
        const response = await gotrue(
            config,
            "otp",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    create_user: false,
                }),
            },
            fetchImpl,
        );
        return {
            requested: response.ok,
            serviceOk: response.ok || response.status < 500,
        };
    } catch {
        return { requested: false, serviceOk: false };
    }
}

function toTokens(data: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
}): Tokens | undefined {
    if (!data.access_token || !data.refresh_token) return undefined;
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in ?? 3600,
    };
}

/** Exchanges the emailed code for a session, then re-checks the allow-list on the verified address. */
export async function verifyAdminCode(
    config: AuthConfig,
    email: string,
    code: string,
    allowed: string[],
    fetchImpl: Fetch = fetch,
): Promise<Tokens | undefined> {
    if (!isAdminEmail(email, allowed) || !/^\d{6,10}$/.test(code))
        return undefined;
    try {
        const response = await gotrue(
            config,
            "verify",
            {
                method: "POST",
                body: JSON.stringify({
                    type: "email",
                    email: email.trim().toLowerCase(),
                    token: code,
                }),
            },
            fetchImpl,
        );
        if (!response.ok) return undefined;
        const data = (await response.json()) as {
            access_token?: string;
            refresh_token?: string;
            expires_in?: number;
            user?: { email?: string };
        };
        if (!isAdminEmail(data.user?.email, allowed)) return undefined;
        return toTokens(data);
    } catch {
        return undefined;
    }
}

export type AdminLookup =
    | { kind: "admin"; email: string }
    /** Supabase answered and the token is not a valid, confirmed, allow-listed session. */
    | { kind: "invalid" }
    /** Supabase could not be reached or failed: nothing is known, so access is refused but the session is kept. */
    | { kind: "unavailable" };

/**
 * Asks Supabase who a session belongs to. Every request goes through this: Supabase checks that the
 * session still exists, so a session that was signed out or revoked stops working on this site at once.
 */
export async function lookupAdmin(
    config: AuthConfig,
    accessToken: string | undefined,
    allowed: string[],
    fetchImpl: Fetch = fetch,
): Promise<AdminLookup> {
    if (!accessToken) return { kind: "invalid" };
    try {
        const response = await gotrue(
            config,
            "user",
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            },
            fetchImpl,
        );
        if (response.status >= 500 || response.status === 429)
            return { kind: "unavailable" };
        if (!response.ok) return { kind: "invalid" };
        const user = (await response.json()) as {
            email?: string;
            email_confirmed_at?: string | null;
        };
        if (!user.email_confirmed_at) return { kind: "invalid" };
        return isAdminEmail(user.email, allowed)
            ? { kind: "admin", email: user.email!.toLowerCase() }
            : { kind: "invalid" };
    } catch {
        return { kind: "unavailable" };
    }
}

/** The signed-in administrator's email, or undefined if the session is invalid or not allow-listed. */
export async function getAdminFromAccessToken(
    config: AuthConfig,
    accessToken: string | undefined,
    allowed: string[],
    fetchImpl: Fetch = fetch,
): Promise<string | undefined> {
    const found = await lookupAdmin(config, accessToken, allowed, fetchImpl);
    return found.kind === "admin" ? found.email : undefined;
}

export type RefreshResult =
    | { kind: "ok"; tokens: Tokens }
    | { kind: "invalid" }
    | { kind: "unavailable" };

/**
 * Trades a refresh token for a new session. Supabase rotates refresh tokens: each one works once, and the
 * answer carries the next one, which the caller must store. An old, used or revoked token is refused
 * ("invalid"); an outage is reported separately so a temporary failure does not sign the administrator out.
 */
export async function refreshSession(
    config: AuthConfig,
    refreshToken: string | undefined,
    allowed: string[],
    fetchImpl: Fetch = fetch,
): Promise<RefreshResult> {
    if (!refreshToken) return { kind: "invalid" };
    try {
        const response = await gotrue(
            config,
            "token?grant_type=refresh_token",
            {
                method: "POST",
                body: JSON.stringify({ refresh_token: refreshToken }),
            },
            fetchImpl,
        );
        if (response.status >= 500 || response.status === 429)
            return { kind: "unavailable" };
        if (!response.ok) return { kind: "invalid" };
        const data = (await response.json()) as {
            access_token?: string;
            refresh_token?: string;
            expires_in?: number;
            user?: { email?: string };
        };
        if (!isAdminEmail(data.user?.email, allowed)) return { kind: "invalid" };
        const tokens = toTokens(data);
        return tokens ? { kind: "ok", tokens } : { kind: "invalid" };
    } catch {
        return { kind: "unavailable" };
    }
}

export async function refreshAdminSession(
    config: AuthConfig,
    refreshToken: string | undefined,
    allowed: string[],
    fetchImpl: Fetch = fetch,
): Promise<Tokens | undefined> {
    const result = await refreshSession(config, refreshToken, allowed, fetchImpl);
    return result.kind === "ok" ? result.tokens : undefined;
}

export type Revocation =
    /** Supabase closed the session ("signed_out"), or the session was already finished ("already_invalid"). */
    | { revoked: true; how: "signed_out" | "already_invalid" }
    | { revoked: false; reason: "no_session" | "unavailable" | "rejected" };

async function logoutWith(
    config: AuthConfig,
    accessToken: string,
    fetchImpl: Fetch,
): Promise<"done" | "expired" | "unavailable" | "rejected"> {
    try {
        // scope=local ends this session only, not the administrator's other devices.
        const response = await gotrue(
            config,
            "logout?scope=local",
            {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
            },
            fetchImpl,
        );
        if (response.ok) return "done";
        if (response.status >= 500 || response.status === 429) return "unavailable";
        return response.status === 401 || response.status === 403
            ? "expired"
            : "rejected";
    } catch {
        return "unavailable";
    }
}

/**
 * Ends the administrator's session at Supabase, so the refresh token stops working too. Supabase's logout needs
 * a valid access token; these expire after about an hour, so when it is refused the refresh token is used to get
 * a fresh one first. The result says truthfully whether Supabase confirmed it.
 * Access tokens are signed and stateless: another service that checks them without asking Supabase could accept
 * one until it expires. This site asks Supabase on every request, so it stops accepting it immediately.
 */
export async function revokeAdminSession(
    config: AuthConfig,
    accessToken: string | undefined,
    refreshToken: string | undefined,
    fetchImpl: Fetch = fetch,
): Promise<Revocation> {
    if (!accessToken && !refreshToken)
        return { revoked: false, reason: "no_session" };

    if (accessToken) {
        const first = await logoutWith(config, accessToken, fetchImpl);
        if (first === "done") return { revoked: true, how: "signed_out" };
        if (first === "unavailable") return { revoked: false, reason: "unavailable" };
        if (first === "rejected") return { revoked: false, reason: "rejected" };
    }
    if (!refreshToken) return { revoked: true, how: "already_invalid" };

    // The access token has expired or its session is gone. A refresh answers which one it is.
    try {
        const response = await gotrue(
            config,
            "token?grant_type=refresh_token",
            { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) },
            fetchImpl,
        );
        if (response.status >= 500 || response.status === 429)
            return { revoked: false, reason: "unavailable" };
        // Refused: the refresh token was already used, revoked or expired, so the session cannot be restored.
        if (!response.ok) return { revoked: true, how: "already_invalid" };
        const fresh = (await response.json()) as { access_token?: string };
        if (!fresh.access_token) return { revoked: false, reason: "rejected" };
        const second = await logoutWith(config, fresh.access_token, fetchImpl);
        if (second === "done") return { revoked: true, how: "signed_out" };
        if (second === "unavailable") return { revoked: false, reason: "unavailable" };
        return { revoked: false, reason: "rejected" };
    } catch {
        return { revoked: false, reason: "unavailable" };
    }
}
