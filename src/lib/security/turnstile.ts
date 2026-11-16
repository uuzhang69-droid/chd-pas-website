export type TurnstileResult =
    { ok: true } | { ok: false; reason: "failed" | "unavailable" };

type Fetch = typeof fetch;

/** Server-side Cloudflare Turnstile check. A missing token or a failed check is "failed". */
export async function verifyTurnstile(
    secret: string,
    token: unknown,
    ip: string,
    fetchImpl: Fetch = fetch,
): Promise<TurnstileResult> {
    if (typeof token !== "string" || token.length < 10 || token.length > 4096)
        return { ok: false, reason: "failed" };
    try {
        const body = new URLSearchParams({ secret, response: token });
        if (ip !== "unknown") body.set("remoteip", ip);
        const response = await fetchImpl(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            { method: "POST", body, signal: AbortSignal.timeout(8_000) },
        );
        if (!response.ok) return { ok: false, reason: "unavailable" };
        const data = (await response.json()) as { success?: boolean };
        return data.success === true
            ? { ok: true }
            : { ok: false, reason: "failed" };
    } catch {
        return { ok: false, reason: "unavailable" };
    }
}

/** Turnstile is enforced whenever its secret key is configured. */
export function getTurnstileSecret(): string | undefined {
    return process.env.TURNSTILE_SECRET_KEY || undefined;
}
