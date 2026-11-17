import { checkAdmin } from "@/lib/admin/session";
import { buildExport, type ExportAudience } from "@/lib/newsletter/csv";
import { getNewsletterStore } from "@/lib/newsletter/deps";
import { NEWSLETTER_SOURCES } from "@/lib/newsletter/consent";
import type { Subscriber, SubscriberStatus } from "@/lib/newsletter/store";
import { json } from "@/lib/security/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: SubscriberStatus[] = ["pending", "active", "unsubscribed"];
const PAGE = 1000;
const MAX_ROWS = 20_000;

/**
 * CSV of the subscribers matching the current search and filters. Administrators only.
 * ?audience=all  every request, unverified included (clearly marked in the columns and the file name);
 * anything else  ONLY verified recipients (the safe default): the status filter is ignored and pending rows are never included.
 */
export async function GET(request: Request) {
    const admin = await checkAdmin(request.headers.get("cookie"));
    if (!admin.ok)
        return json(admin.reason === "not_configured" || admin.reason === "unavailable" ? 503 : 401, {
            ok: false,
            code: admin.reason,
        });
    const store = getNewsletterStore();
    if (!store) return json(503, { ok: false, code: "not_configured" });

    const params = new URL(request.url).searchParams;
    const audience: ExportAudience = params.get("audience") === "all" ? "all" : "verified";
    const status = audience === "verified" ? ("active" as const) : STATUSES.find((value) => value === params.get("status"));
    const source = (NEWSLETTER_SOURCES as readonly string[]).includes(
        params.get("source") ?? "",
    )
        ? (params.get("source") as string)
        : undefined;
    const q = (params.get("q") ?? "").slice(0, 100);

    const rows: Subscriber[] = [];
    for (let offset = 0; offset < MAX_ROWS; offset += PAGE) {
        const page = await store.list({
            q,
            status,
            source,
            limit: PAGE,
            offset,
        });
        rows.push(...page.rows);
        if (page.rows.length < PAGE) break;
    }
    await store
        .logEvent(null, audience === "all" ? "admin_export_all" : "admin_export", admin.email)
        .catch(() => undefined);

    const day = new Date().toISOString().slice(0, 10);
    const { csv, filename } = buildExport(audience, rows, day);
    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
