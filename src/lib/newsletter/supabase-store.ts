import {
    DuplicateSubscriberError,
    type NewSubscriber,
    type NewsletterStore,
    type Subscriber,
    type SubscriberPatch,
    type SubscriberQuery,
} from "./store";
import {
    expectOk,
    filterValue,
    supabaseRest,
    type SupabaseConfig,
} from "../supabase/rest";

type Row = {
    id: string;
    email: string;
    email_normalised: string;
    status: Subscriber["status"];
    source: string;
    source_path: string | null;
    consent_text_version: string;
    consent_given_at: string;
    confirmed_at: string | null;
    unsubscribed_at: string | null;
    created_at: string;
    updated_at: string;
    last_confirmation_sent_at: string | null;
};

const TABLE = "newsletter_subscribers";

function fromRow(row: Row): Subscriber {
    return {
        id: row.id,
        email: row.email,
        emailNormalised: row.email_normalised,
        status: row.status,
        source: row.source,
        sourcePath: row.source_path ?? undefined,
        consentTextVersion: row.consent_text_version,
        consentGivenAt: row.consent_given_at,
        confirmedAt: row.confirmed_at ?? undefined,
        unsubscribedAt: row.unsubscribed_at ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastConfirmationSentAt: row.last_confirmation_sent_at ?? undefined,
    };
}

function toRowPatch(patch: SubscriberPatch): Record<string, unknown> {
    const map: Record<string, string> = {
        status: "status",
        source: "source",
        sourcePath: "source_path",
        consentTextVersion: "consent_text_version",
        consentGivenAt: "consent_given_at",
        confirmedAt: "confirmed_at",
        unsubscribedAt: "unsubscribed_at",
        lastConfirmationSentAt: "last_confirmation_sent_at",
    };
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch))
        if (map[key]) out[map[key]] = value ?? null;
    return out;
}

const enc = encodeURIComponent;

/** PostgREST implementation. Every call runs on the server with the service key. */
export class SupabaseNewsletterStore implements NewsletterStore {
    constructor(
        private config: SupabaseConfig,
        private fetchImpl: typeof fetch = fetch,
    ) {}

    private rest(path: string, init: Parameters<typeof supabaseRest>[2] = {}) {
        return supabaseRest(this.config, path, init, this.fetchImpl);
    }

    async findByEmail(emailNormalised: string) {
        const response = await expectOk(
            await this.rest(
                `${TABLE}?email_normalised=eq.${enc(emailNormalised)}&select=*&limit=1`,
            ),
            "find subscriber",
        );
        const rows = (await response.json()) as Row[];
        return rows[0] ? fromRow(rows[0]) : undefined;
    }

    async findById(id: string) {
        const response = await expectOk(
            await this.rest(`${TABLE}?id=eq.${enc(id)}&select=*&limit=1`),
            "find subscriber",
        );
        const rows = (await response.json()) as Row[];
        return rows[0] ? fromRow(rows[0]) : undefined;
    }

    async create(input: NewSubscriber) {
        const response = await this.rest(TABLE, {
            method: "POST",
            prefer: "return=representation",
            body: JSON.stringify({
                email: input.email.trim(),
                status: "pending",
                source: input.source,
                source_path: input.sourcePath ?? null,
                consent_text_version: input.consentTextVersion,
                consent_given_at: input.consentGivenAt,
            }),
        });
        if (response.status === 409) throw new DuplicateSubscriberError();
        await expectOk(response, "create subscriber");
        const rows = (await response.json()) as Row[];
        return fromRow(rows[0]);
    }

    async update(id: string, patch: SubscriberPatch) {
        const response = await expectOk(
            await this.rest(`${TABLE}?id=eq.${enc(id)}`, {
                method: "PATCH",
                prefer: "return=representation",
                body: JSON.stringify(toRowPatch(patch)),
            }),
            "update subscriber",
        );
        const rows = (await response.json()) as Row[];
        return rows[0] ? fromRow(rows[0]) : undefined;
    }

    async delete(id: string) {
        const response = await expectOk(
            await this.rest(`${TABLE}?id=eq.${enc(id)}`, {
                method: "DELETE",
                prefer: "return=representation",
            }),
            "delete subscriber",
        );
        return ((await response.json()) as Row[]).length > 0;
    }

    async list(query: SubscriberQuery) {
        const params: string[] = [
            "select=*",
            "order=created_at.desc",
            `limit=${query.limit}`,
            `offset=${query.offset}`,
        ];
        const q = query.q ? filterValue(query.q) : "";
        if (q)
            params.push(
                `email_normalised=ilike.${enc(`*${q.toLowerCase()}*`)}`,
            );
        if (query.status) params.push(`status=eq.${enc(query.status)}`);
        if (query.source) params.push(`source=eq.${enc(query.source)}`);
        const response = await expectOk(
            await this.rest(`${TABLE}?${params.join("&")}`, {
                prefer: "count=exact",
            }),
            "list subscribers",
        );
        const rows = (await response.json()) as Row[];
        const range = response.headers.get("content-range") ?? "";
        const total = Number(range.split("/")[1]);
        return {
            rows: rows.map(fromRow),
            total: Number.isFinite(total) ? total : rows.length,
        };
    }

    async logEvent(subscriberId: string | null, event: string, actor: string) {
        const response = await this.rest("newsletter_events", {
            method: "POST",
            body: JSON.stringify({ subscriber_id: subscriberId, event, actor }),
        });
        await expectOk(response, "log event");
    }
}
