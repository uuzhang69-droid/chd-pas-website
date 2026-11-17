import { getNewsletterDeps } from "@/lib/newsletter/deps";
import { confirm } from "@/lib/newsletter/service";
import {
    getClientIp,
    isSameOrigin,
    readJsonBody,
} from "@/lib/security/request";
import { json } from "@/lib/security/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Called by the confirmation page's button, so that opening the emailed link alone changes nothing. */
export async function POST(request: Request) {
    if (!isSameOrigin(request.headers))
        return json(403, { ok: false, code: "bad_origin" });
    const parsed = await readJsonBody(request, 4_000);
    if (!parsed.ok)
        return json(parsed.status, { ok: false, code: parsed.code });
    const token = (parsed.body as { token?: unknown } | null)?.token;

    const result = await confirm(
        getNewsletterDeps(new URL(request.url).origin),
        {
            token,
            ip: getClientIp(request.headers),
        },
    );
    return json(result.status, result.body, result.retryAfterSeconds);
}
