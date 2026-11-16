export type TurnstileResult =
    | { ok: true }
    /** `codes` are Cloudflare's own error codes (for example "invalid-input-response"). They hold no secrets. */
    | { ok: false; reason: "failed" | "unavailable"; codes?: string[] };

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
        if (!response.ok)
            return { ok: false, reason: "unavailable", codes: [`http-${response.status}`] };
        const data = (await response.json()) as {
            success?: boolean;
            "error-codes"?: unknown;
        };
        if (data.success === true) return { ok: true };
        const codes = Array.isArray(data["error-codes"])
            ? data["error-codes"].filter((code): code is string => typeof code === "string").slice(0, 5)
            : undefined;
        return { ok: false, reason: "failed", codes };
    } catch {
        return { ok: false, reason: "unavailable", codes: ["network-error"] };
    }
}

/** Turnstile is enforced whenever its secret key is configured. */
export function getTurnstileSecret(): string | undefined {
    return process.env.TURNSTILE_SECRET_KEY || undefined;
}
