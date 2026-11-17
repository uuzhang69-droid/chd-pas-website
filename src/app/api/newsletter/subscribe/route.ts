import { getNewsletterDeps } from "@/lib/newsletter/deps";
import { subscribe } from "@/lib/newsletter/service";
import {
    getClientIp,
    isSameOrigin,
    readJsonBody,
} from "@/lib/security/request";
import { json } from "@/lib/security/respond";
import { isNewsletterSignupLive } from "@/lib/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    // Public sign-up stays closed on the server too, whatever the page shows, until the switch is turned on.
    if (!isNewsletterSignupLive())
        return json(404, { ok: false, code: "not_available" });
    if (!isSameOrigin(request.headers))
        return json(403, { ok: false, code: "bad_origin" });
    const parsed = await readJsonBody(request);
    if (!parsed.ok)
        return json(parsed.status, { ok: false, code: parsed.code });

    const result = await subscribe(
        getNewsletterDeps(new URL(request.url).origin),
        {
            body: parsed.body,
            ip: getClientIp(request.headers),
        },
    );
    return json(result.status, result.body, result.retryAfterSeconds);
}
