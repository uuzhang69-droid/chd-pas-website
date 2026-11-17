export type SubscriberStatus = "pending" | "active" | "unsubscribed";

export type Subscriber = {
    id: string;
    email: string;
    emailNormalised: string;
    status: SubscriberStatus;
    source: string;
    sourcePath?: string;
    consentTextVersion: string;
    consentGivenAt: string;
    confirmedAt?: string;
    unsubscribedAt?: string;
    createdAt: string;
    updatedAt: string;
    lastConfirmationSentAt?: string;
};

export type NewSubscriber = {
    email: string;
    source: string;
    sourcePath?: string;
    consentTextVersion: string;
    consentGivenAt: string;
};

export type SubscriberPatch = {
    status?: SubscriberStatus;
    source?: string;
    sourcePath?: string | null;
    consentTextVersion?: string;
    consentGivenAt?: string;
    /** null clears the value. */
    confirmedAt?: string | null;
    unsubscribedAt?: string | null;
    lastConfirmationSentAt?: string | null;
};

export type SubscriberQuery = {
    q?: string;
    status?: SubscriberStatus;
    source?: string;
    limit: number;
    offset: number;
};

export class DuplicateSubscriberError extends Error {}

/** Storage behind the newsletter. Supabase in production, memory in tests. */
export interface NewsletterStore {
    findByEmail(emailNormalised: string): Promise<Subscriber | undefined>;
    findById(id: string): Promise<Subscriber | undefined>;
    create(input: NewSubscriber): Promise<Subscriber>;
    update(id: string, patch: SubscriberPatch): Promise<Subscriber | undefined>;
    delete(id: string): Promise<boolean>;
    list(
        query: SubscriberQuery,
    ): Promise<{ rows: Subscriber[]; total: number }>;
    logEvent(
        subscriberId: string | null,
        event: string,
        actor: string,
    ): Promise<void>;
}

export class MemoryNewsletterStore implements NewsletterStore {
    rows = new Map<string, Subscriber>();
    events: { subscriberId: string | null; event: string; actor: string }[] =
        [];
    private counter = 0;
    constructor(private now: () => string = () => new Date().toISOString()) {}

    async findByEmail(emailNormalised: string) {
        return [...this.rows.values()].find(
            (row) => row.emailNormalised === emailNormalised,
        );
    }
    async findById(id: string) {
        return this.rows.get(id);
    }
    async create(input: NewSubscriber) {
        const emailNormalised = input.email.trim().toLowerCase();
        if (await this.findByEmail(emailNormalised))
            throw new DuplicateSubscriberError();
        const stamp = this.now();
        const row: Subscriber = {
            id: `sub-${++this.counter}`,
            email: input.email.trim(),
            emailNormalised,
            status: "pending",
            source: input.source,
            sourcePath: input.sourcePath,
            consentTextVersion: input.consentTextVersion,
            consentGivenAt: input.consentGivenAt,
            createdAt: stamp,
            updatedAt: stamp,
        };
        this.rows.set(row.id, row);
        return row;
    }
    async update(id: string, patch: SubscriberPatch) {
        const row = this.rows.get(id);
        if (!row) return undefined;
        const next = { ...row, updatedAt: this.now() } as Record<
            string,
            unknown
        >;
        for (const [key, value] of Object.entries(patch))
            next[key] = value === null ? undefined : value;
        this.rows.set(id, next as Subscriber);
        return next as Subscriber;
    }
    async delete(id: string) {
        for (const event of this.events)
            if (event.subscriberId === id) event.subscriberId = null;
        return this.rows.delete(id);
    }
    async list(query: SubscriberQuery) {
        const q = query.q?.trim().toLowerCase();
        const all = [...this.rows.values()]
            .filter(
                (row) =>
                    (!q || row.emailNormalised.includes(q)) &&
                    (!query.status || row.status === query.status) &&
                    (!query.source || row.source === query.source),
            )
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return {
            rows: all.slice(query.offset, query.offset + query.limit),
            total: all.length,
        };
    }
    async logEvent(subscriberId: string | null, event: string, actor: string) {
        this.events.push({ subscriberId, event, actor });
    }
}
