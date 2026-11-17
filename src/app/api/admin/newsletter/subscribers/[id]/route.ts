import { checkAdmin } from "@/lib/admin/session";
import { getNewsletterStore } from "@/lib/newsletter/deps";
import { adminDelete, adminUnsubscribe } from "@/lib/newsletter/service";
import { isSameOrigin, readJsonBody } from "@/lib/security/request";
import { json } from "@/lib/security/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Administrator actions on one subscriber: mark unsubscribed, or delete (for an erasure request). */
export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    if (!isSameOrigin(request.headers))
        return json(403, { ok: false, code: "bad_origin" });
    const admin = await checkAdmin(request.headers.get("cookie"));
    if (!admin.ok)
        return json(admin.reason === "not_configured" || admin.reason === "unavailable" ? 503 : 401, {
            ok: false,
            code: admin.reason,
        });
    const store = getNewsletterStore();
    if (!store) return json(503, { ok: false, code: "not_configured" });

    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id))
        return json(400, { ok: false, code: "invalid_id" });
    const parsed = await readJsonBody(request, 1_000);
    if (!parsed.ok)
        return json(parsed.status, { ok: false, code: parsed.code });
    const action = (parsed.body as { action?: unknown } | null)?.action;

    if (action === "unsubscribe") {
        const done = await adminUnsubscribe(store, id, admin.email, Date.now());
        return done
            ? json(200, { ok: true })
            : json(404, { ok: false, code: "not_found" });
    }
    if (action === "delete") {
        const done = await adminDelete(store, id, admin.email);
        return done
            ? json(200, { ok: true })
            : json(404, { ok: false, code: "not_found" });
    }
    return json(400, { ok: false, code: "invalid_action" });
}
