import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed links for newsletter confirm and unsubscribe.
 * Format: base64url(subscriberId) "." base64url(expiryUnixSeconds, 0 = never) "." base64url(HMAC_SHA256(secret, purpose ":" id ":" expiry))
 * Plain HMAC so any language (PHP, for example) can issue and verify the same tokens.
 */
export type TokenPurpose = "confirm" | "unsubscribe";

export type TokenResult =
    | { ok: true; subscriberId: string }
    | { ok: false; reason: "invalid" | "expired" };

const encode = (value: string | Buffer) =>
    Buffer.from(value).toString("base64url");

function sign(
    secret: string,
    purpose: TokenPurpose,
    subscriberId: string,
    expiry: number,
): Buffer {
    return createHmac("sha256", secret)
        .update(`${purpose}:${subscriberId}:${expiry}`)
        .digest();
}

export function createToken(
    secret: string,
    purpose: TokenPurpose,
    subscriberId: string,
    expiresAtSeconds = 0,
): string {
    const mac = sign(secret, purpose, subscriberId, expiresAtSeconds);
    return [
        encode(subscriberId),
        encode(String(expiresAtSeconds)),
        encode(mac),
    ].join(".");
}

export function verifyToken(
    secret: string,
    purpose: TokenPurpose,
    token: string,
    nowSeconds: number,
): TokenResult {
    const parts = token.split(".");
    if (parts.length !== 3) return { ok: false, reason: "invalid" };
    try {
        const subscriberId = Buffer.from(parts[0], "base64url").toString(
            "utf8",
        );
        const expiry = Number(
            Buffer.from(parts[1], "base64url").toString("utf8"),
        );
        const mac = Buffer.from(parts[2], "base64url");
        if (!subscriberId || !Number.isInteger(expiry) || expiry < 0)
            return { ok: false, reason: "invalid" };
        const expected = sign(secret, purpose, subscriberId, expiry);
        if (mac.length !== expected.length || !timingSafeEqual(mac, expected))
            return { ok: false, reason: "invalid" };
        if (expiry !== 0 && nowSeconds > expiry)
            return { ok: false, reason: "expired" };
        return { ok: true, subscriberId };
    } catch {
        return { ok: false, reason: "invalid" };
    }
}
