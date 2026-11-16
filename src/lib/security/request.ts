import { createHash } from "node:crypto";

/** First address in X-Forwarded-For (set by the host's proxy), then X-Real-IP. */
export function getClientIp(headers: Headers): string {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
    return headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Browsers always send Origin on a cross-page POST. Accept only requests whose Origin
 * (or, failing that, Referer) host matches the host the request came to.
 */
export function isSameOrigin(headers: Headers): boolean {
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    const source = headers.get("origin") ?? headers.get("referer");
    if (!host || !source) return false;
    try {
        return new URL(source).host === host;
    } catch {
        return false;
    }
}

/** Keeps raw addresses out of rate-limit storage. */
export function hashKey(salt: string, value: string): string {
    return createHash("sha256")
        .update(`${salt}:${value}`)
        .digest("hex")
        .slice(0, 32);
}

export type JsonBodyResult =
    | { ok: true; body: unknown }
    | { ok: false; status: 400 | 413 | 415; code: string };

/** Reads a small JSON body. Form-encoded or oversized requests are refused. */
export async function readJsonBody(
    request: Request,
    maxBytes = 20_000,
): Promise<JsonBodyResult> {
    const type = request.headers.get("content-type") ?? "";
    if (!type.toLowerCase().startsWith("application/json"))
        return { ok: false, status: 415, code: "json_required" };
    const text = await request.text();
    if (text.length > maxBytes)
        return { ok: false, status: 413, code: "too_large" };
    try {
        return { ok: true, body: JSON.parse(text) };
    } catch {
        return { ok: false, status: 400, code: "invalid_json" };
    }
}

/** Hidden-field spam traps shared by the contact and newsletter forms. */
export function checkFormTiming(
    renderedAtMs: unknown,
    nowMs: number,
): "ok" | "too_fast" | "expired" {
    const rendered = Number(renderedAtMs);
    if (!Number.isFinite(rendered) || rendered <= 0) return "expired";
    const age = nowMs - rendered;
    if (age < 3_000) return "too_fast";
    if (age > 2 * 60 * 60 * 1000) return "expired";
    return "ok";
}
