import { getNewsletterDeps } from "@/lib/newsletter/deps";
import { unsubscribe } from "@/lib/newsletter/service";
import {
    getClientIp,
    isSameOrigin,
    readJsonBody,
} from "@/lib/security/request";
import { json } from "@/lib/security/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Two ways in:
 * 1. The unsubscribe page's button posts JSON { token } from our own site.
 * 2. A mail app's one-click unsubscribe (RFC 8058) posts "List-Unsubscribe=One-Click" with the signed
 *    token in the query string. The token itself is the proof, so no browser origin is required.
 */
export async function POST(request: Request) {
    const url = new URL(request.url);
    const type = request.headers.get("content-type") ?? "";
    let token: unknown;

    if (type.toLowerCase().startsWith("application/x-www-form-urlencoded")) {
        const form = new URLSearchParams(await request.text());
        if (form.get("List-Unsubscribe") !== "One-Click")
            return json(400, { ok: false, code: "invalid" });
        token = url.searchParams.get("token");
    } else {
        if (!isSameOrigin(request.headers))
            return json(403, { ok: false, code: "bad_origin" });
        const parsed = await readJsonBody(request, 4_000);
        if (!parsed.ok)
            return json(parsed.status, { ok: false, code: parsed.code });
        token = (parsed.body as { token?: unknown } | null)?.token;
    }

    const result = await unsubscribe(getNewsletterDeps(url.origin), {
        token,
        ip: getClientIp(request.headers),
    });
    return json(result.status, result.body, result.retryAfterSeconds);
}
