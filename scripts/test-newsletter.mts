import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { MailMessage, MailResult, MailSender } from "../src/lib/mail";
import {
    CONSENT_TEXT,
    CONSENT_TEXT_VERSION,
} from "../src/lib/newsletter/consent";
import {
    adminDelete,
    adminUnsubscribe,
    confirm,
    subscribe,
    unsubscribe,
    type NewsletterDeps,
} from "../src/lib/newsletter/service";
import {
    DuplicateSubscriberError,
    MemoryNewsletterStore,
} from "../src/lib/newsletter/store";
import { SupabaseNewsletterStore } from "../src/lib/newsletter/supabase-store";
import {
    MemoryRateLimiter,
    SupabaseRateLimiter,
} from "../src/lib/security/rate-limit";
import { createToken } from "../src/lib/security/tokens";
import { filterValue } from "../src/lib/supabase/rest";

const SECRET = "newsletter-test-secret-newsletter-test";
let clock = 1_800_000_000_000;

function setup(result: MailResult = { ok: true, id: "m1" }) {
    const store = new MemoryNewsletterStore(() =>
        new Date(clock).toISOString(),
    );
    const sent: MailMessage[] = [];
    const state = { result };
    const sender: MailSender = {
        async send(message) {
            sent.push(message);
            return state.result;
        },
    };
    const deps: NewsletterDeps = {
        store,
        // These tests cover the email workflow, so it is switched on explicitly (the default is collect-only).
        mode: "double_opt_in",
        mail: { sender, from: "News <no-reply@example.test>" },
        tokenSecret: SECRET,
        baseUrl: "https://site.example.test",
        limiter: new MemoryRateLimiter(() => clock),
        rateSalt: "salt",
        nowMs: () => clock,
    };
    return { deps, store, sent, state };
}

let ipCounter = 0;
const body = (extra: Record<string, unknown> = {}) => ({
    email: "Person@Example.com",
    consent: true,
    consentVersion: CONSENT_TEXT_VERSION,
    source: "footer",
    sourcePath: "/about",
    hp: "",
    t: clock - 10_000,
    ...extra,
});
const request = (extra: Record<string, unknown> = {}) => ({
    body: body(extra),
    ip: `192.0.2.${++ipCounter}`,
});
const tokenIn = (mail: MailMessage) =>
    decodeURIComponent(/token=([^\s"&]+)/.exec(mail.text)![1]);

test("not configured: no row is created and the answer is 503, never success", async () => {
    for (const missing of [
        "store",
        "mail",
        "tokenSecret",
        "baseUrl",
    ] as const) {
        const { deps, store } = setup();
        const broken = { ...deps, [missing]: undefined } as NewsletterDeps;
        const result = await subscribe(broken, request());
        assert.equal(result.status, 503, missing);
        assert.equal(result.body.code, "not_configured");
        assert.equal(store.rows.size, 0);
    }
});

test("subscribe creates a pending row, records consent, and sends a confirmation link", async () => {
    const { deps, store, sent } = setup();
    const result = await subscribe(deps, request());
    assert.equal(result.status, 202);
    const [row] = [...store.rows.values()];
    assert.equal(row.status, "pending");
    assert.equal(row.email, "Person@Example.com");
    assert.equal(row.source, "footer");
    assert.equal(row.sourcePath, "/about");
    assert.equal(row.consentTextVersion, CONSENT_TEXT_VERSION);
    assert.equal(row.consentGivenAt, new Date(clock).toISOString());
    assert.equal(row.confirmedAt, undefined);
    assert.equal(sent.length, 1);
    assert.match(sent[0].text, /^Please confirm your subscription/);
    assert.match(
        sent[0].text,
        /https:\/\/site\.example\.test\/newsletter\/confirm\?token=/,
    );
    assert.equal(sent[0].to, "Person@Example.com");
});

test("a person is never active until the confirmation link is used; old or bad links change nothing", async () => {
    const { deps, store, sent } = setup();
    await subscribe(deps, request());
    const id = [...store.rows.keys()][0];
    assert.equal(store.rows.get(id)?.status, "pending");

    const wrongPurpose = createToken(SECRET, "unsubscribe", id);
    assert.equal(
        (await confirm(deps, { token: wrongPurpose, ip: "1" })).status,
        400,
    );
    assert.equal(
        (await confirm(deps, { token: "nonsense", ip: "1" })).status,
        400,
    );
    const expired = createToken(
        SECRET,
        "confirm",
        id,
        Math.floor(clock / 1000) - 5,
    );
    const late = await confirm(deps, { token: expired, ip: "1" });
    assert.equal(late.body.code, "expired");
    assert.equal(store.rows.get(id)?.status, "pending");

    const result = await confirm(deps, { token: tokenIn(sent[0]), ip: "1" });
    assert.equal(result.status, 200);
    assert.match(
        String(result.body.unsubscribeUrl),
        /\/newsletter\/unsubscribe\?token=/,
    );
    assert.equal(store.rows.get(id)?.status, "active");
    assert.equal(
        store.rows.get(id)?.confirmedAt,
        new Date(clock).toISOString(),
    );
    assert.equal(sent.length, 2); // welcome email with an unsubscribe link
    assert.match(sent[1].text, /unsubscribe/i);
    // Using the link again is harmless.
    assert.equal(
        (await confirm(deps, { token: tokenIn(sent[0]), ip: "1" })).status,
        200,
    );
    assert.equal(sent.length, 2);
});

test("addresses are de-duplicated without regard to case or spaces", async () => {
    const { deps, store } = setup();
    await subscribe(deps, request({ email: "Person@Example.com" }));
    clock += 11 * 60_000;
    await subscribe(deps, request({ email: "  person@EXAMPLE.COM " }));
    assert.equal(store.rows.size, 1);
});

test("an active address gets the same answer and no extra email, so the list cannot be probed", async () => {
    const { deps, store, sent } = setup();
    const first = await subscribe(deps, request());
    await confirm(deps, { token: tokenIn(sent[0]), ip: "9" });
    const before = sent.length;
    const again = await subscribe(deps, request());
    assert.deepEqual(again.body, first.body);
    assert.equal(again.status, first.status);
    assert.equal(sent.length, before);
    assert.equal([...store.rows.values()][0].status, "active");
});

test("pending addresses can ask again, but not more often than every ten minutes", async () => {
    const { deps, sent } = setup();
    clock += 3_600_000;
    await subscribe(deps, request());
    await subscribe(deps, request());
    assert.equal(sent.length, 1);
    clock += 11 * 60_000;
    await subscribe(deps, request());
    assert.equal(sent.length, 2);
});

test("if the confirmation email cannot be sent the person stays pending and is told it failed", async () => {
    const { deps, store, state } = setup({ ok: false, reason: "unavailable" });
    clock += 3_600_000;
    const failed = await subscribe(deps, request());
    assert.equal(failed.status, 502);
    assert.equal(failed.body.ok, false);
    assert.equal([...store.rows.values()][0].status, "pending");
    assert.equal([...store.rows.values()][0].lastConfirmationSentAt, undefined);
    state.result = { ok: true, id: "m2" };
    const retried = await subscribe(deps, request());
    assert.equal(retried.status, 202);
});

test("consent is required, versioned and checked on the server", async () => {
    const { deps, store, sent } = setup();
    clock += 3_600_000;
    for (const extra of [
        { consent: false },
        { consent: "true" },
        { consent: undefined },
    ]) {
        const result = await subscribe(deps, request(extra));
        assert.equal(result.status, 400);
        assert.ok((result.body.errors as Record<string, string>).consent);
    }
    const outdated = await subscribe(deps, request({ consentVersion: "v0" }));
    assert.equal(outdated.body.code, "form_outdated");
    assert.equal(store.rows.size, 0);
    assert.equal(sent.length, 0);
});

test("validation, honeypot, timing, rate limits and Turnstile protect sign-up", async () => {
    const { deps, store } = setup();
    clock += 7_200_000;
    assert.equal(
        (await subscribe(deps, request({ email: "nope" }))).status,
        400,
    );
    assert.equal((await subscribe(deps, request({ hp: "x" }))).status, 403);
    assert.equal(
        (await subscribe(deps, request({ t: clock - 200 }))).status,
        403,
    );
    assert.equal(
        (await subscribe(deps, request({ t: clock - 4 * 3_600_000 }))).body
            .code,
        "form_expired",
    );
    assert.equal(store.rows.size, 0);

    const limited = setup();
    clock += 7_200_000;
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++)
        statuses.push(
            (
                await subscribe(limited.deps, {
                    body: body({ email: `u${i}@example.com` }),
                    ip: "198.51.100.77",
                })
            ).status,
        );
    assert.deepEqual(statuses.slice(0, 3), [202, 202, 202]);
    assert.equal(statuses[3], 429);

    const blocked = setup();
    blocked.deps.turnstile = {
        secret: "s",
        verify: async () => ({ ok: false, reason: "failed" }),
    };
    clock += 7_200_000;
    assert.equal((await subscribe(blocked.deps, request())).status, 403);
    assert.equal(blocked.store.rows.size, 0);
});

test("unsubscribe works from the signed link, is repeatable, and an old confirm link cannot undo it", async () => {
    const { deps, store, sent } = setup();
    clock += 7_200_000;
    await subscribe(deps, request());
    const id = [...store.rows.keys()][0];
    const confirmToken = tokenIn(sent[0]);
    await confirm(deps, { token: confirmToken, ip: "5" });
    const unsubToken = createToken(SECRET, "unsubscribe", id);

    assert.equal(
        (
            await unsubscribe(deps, {
                token: createToken(SECRET, "confirm", id, 0),
                ip: "5",
            })
        ).status,
        400,
    );
    assert.equal(
        (await unsubscribe(deps, { token: unsubToken, ip: "5" })).status,
        200,
    );
    assert.equal(store.rows.get(id)?.status, "unsubscribed");
    assert.equal(
        store.rows.get(id)?.unsubscribedAt,
        new Date(clock).toISOString(),
    );
    assert.equal(
        (await unsubscribe(deps, { token: unsubToken, ip: "5" })).status,
        200,
    );
    // The earlier confirm link must not put them back on the list.
    assert.equal(
        (await confirm(deps, { token: confirmToken, ip: "5" })).status,
        400,
    );
    assert.equal(store.rows.get(id)?.status, "unsubscribed");
});

test("signing up again after unsubscribing needs fresh consent and a new confirmation", async () => {
    const { deps, store, sent } = setup();
    clock += 7_200_000;
    await subscribe(deps, request());
    const id = [...store.rows.keys()][0];
    await confirm(deps, { token: tokenIn(sent[0]), ip: "6" });
    await unsubscribe(deps, {
        token: createToken(SECRET, "unsubscribe", id),
        ip: "6",
    });
    clock += 60_000;
    const again = await subscribe(deps, request());
    assert.equal(again.status, 202);
    const row = store.rows.get(id)!;
    assert.equal(row.status, "pending");
    assert.equal(row.confirmedAt, undefined);
    assert.equal(row.unsubscribedAt, undefined);
    assert.equal(row.consentGivenAt, new Date(clock).toISOString());
    assert.equal(
        (await subscribe(deps, { body: body({ consent: false }), ip: "7" }))
            .status,
        400,
    );
});

test("a deleted subscriber's unsubscribe link still reports success without exposing anything", async () => {
    const { deps, store } = setup();
    const result = await unsubscribe(deps, {
        token: createToken(SECRET, "unsubscribe", "gone-id"),
        ip: "8",
    });
    assert.equal(result.status, 200);
    assert.equal(store.rows.size, 0);
});

test("admin actions: mark unsubscribed, delete on request, and keep an audit trail", async () => {
    const { store } = setup();
    const row = await store.create({
        email: "x@example.com",
        source: "home",
        consentTextVersion: CONSENT_TEXT_VERSION,
        consentGivenAt: new Date(clock).toISOString(),
    });
    await store.update(row.id, { status: "active" });
    assert.equal(
        await adminUnsubscribe(store, row.id, "admin@example.test", clock),
        true,
    );
    assert.equal(store.rows.get(row.id)?.status, "unsubscribed");
    assert.equal(
        await adminUnsubscribe(store, "missing", "admin@example.test", clock),
        false,
    );
    assert.equal(await adminDelete(store, row.id, "admin@example.test"), true);
    assert.equal(store.rows.size, 0);
    assert.deepEqual(
        store.events.map((event) => event.event),
        ["unsubscribed_by_admin", "deleted_by_admin"],
    );
});

test("memory store search and filters (used by the admin list)", async () => {
    const { store } = setup();
    const make = (email: string, source: string) =>
        store.create({
            email,
            source,
            consentTextVersion: CONSENT_TEXT_VERSION,
            consentGivenAt: "2026-11-01T00:00:00Z",
        });
    const a = await make("anna@example.com", "footer");
    await make("ben@example.com", "home");
    await store.update(a.id, { status: "active" });
    assert.equal(
        (await store.list({ q: "ANNA", limit: 10, offset: 0 })).total,
        1,
    );
    assert.equal(
        (await store.list({ status: "active", limit: 10, offset: 0 })).total,
        1,
    );
    assert.equal(
        (await store.list({ source: "home", limit: 10, offset: 0 })).rows[0]
            .email,
        "ben@example.com",
    );
    await assert.rejects(
        make("ANNA@example.com", "footer"),
        DuplicateSubscriberError,
    );
});

test("the Supabase store sends the right requests with the service key only in headers", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const row = {
        id: "11111111-1111-1111-1111-111111111111",
        email: "a@example.com",
        email_normalised: "a@example.com",
        status: "pending",
        source: "footer",
        source_path: "/about",
        consent_text_version: CONSENT_TEXT_VERSION,
        consent_given_at: "2026-11-01T00:00:00Z",
        confirmed_at: null,
        unsubscribed_at: null,
        created_at: "2026-11-01T00:00:00Z",
        updated_at: "2026-11-01T00:00:00Z",
        last_confirmation_sent_at: null,
    };
    let nextStatus = 200;
    const fetchMock = (async (url: string, init: RequestInit) => {
        calls.push({ url: String(url), init });
        const status = nextStatus;
        const headers = { "content-range": "0-0/42" };
        if (status === 409) return new Response("{}", { status });
        return new Response(JSON.stringify([row]), { status, headers });
    }) as unknown as typeof fetch;
    const store = new SupabaseNewsletterStore(
        {
            url: "https://project.example.test",
            serviceKey: "SERVICE-KEY-VALUE",
        },
        fetchMock,
    );

    const found = await store.findByEmail("a@example.com");
    assert.equal(found?.status, "pending");
    assert.match(
        calls[0].url,
        /^https:\/\/project\.example\.test\/rest\/v1\/newsletter_subscribers\?email_normalised=eq\.a%40example\.com/,
    );
    assert.equal(
        (calls[0].init.headers as Record<string, string>).apikey,
        "SERVICE-KEY-VALUE",
    );

    await store.create({
        email: " a@example.com ",
        source: "footer",
        sourcePath: "/about",
        consentTextVersion: CONSENT_TEXT_VERSION,
        consentGivenAt: "2026-11-01T00:00:00Z",
    });
    const created = JSON.parse(String(calls[1].init.body));
    assert.equal(created.email, "a@example.com");
    assert.equal(created.status, "pending");
    assert.equal(JSON.stringify(created).includes("SERVICE-KEY-VALUE"), false);

    const listed = await store.list({
        q: "an%d,(x)*",
        status: "active",
        source: "home",
        limit: 25,
        offset: 50,
    });
    assert.equal(listed.total, 42);
    const listUrl = calls[2].url;
    assert.match(listUrl, /limit=25&offset=50/);
    assert.match(listUrl, /status=eq\.active/);
    assert.equal(
        /ilike\.[^&]*[%2C(),]/.test(
            decodeURIComponent(
                listUrl.split("ilike.")[1].split("&")[0],
            ).replace(/^\*|\*$/g, ""),
        ),
        false,
    );

    nextStatus = 409;
    await assert.rejects(
        store.create({
            email: "a@example.com",
            source: "footer",
            consentTextVersion: CONSENT_TEXT_VERSION,
            consentGivenAt: "2026-11-01T00:00:00Z",
        }),
        DuplicateSubscriberError,
    );
    nextStatus = 500;
    await assert.rejects(store.findById("x"), /find subscriber failed \(500\)/);
    assert.equal(filterValue("a*b,(c)\\%_"), "a b c");
});

test("the database rate limiter calls the rate_limit_hit function", async () => {
    let seen: { url: string; body: string } | undefined;
    const fetchMock = (async (url: string, init: RequestInit) => {
        seen = { url: String(url), body: String(init.body) };
        return new Response(
            JSON.stringify({ allowed: false, retry_after: 120 }),
            { status: 200 },
        );
    }) as unknown as typeof fetch;
    const limiter = new SupabaseRateLimiter(
        { url: "https://p.example.test", serviceKey: "k" },
        fetchMock,
    );
    const result = await limiter.hit({
        key: "k1",
        limit: 2,
        windowSeconds: 600,
    });
    assert.deepEqual(result, { allowed: false, retryAfterSeconds: 120 });
    assert.match(seen!.url, /\/rest\/v1\/rpc\/rate_limit_hit$/);
    assert.deepEqual(JSON.parse(seen!.body), {
        p_key: "k1",
        p_window_seconds: 600,
        p_limit: 2,
    });
});

test("the SQL migration matches the code: consent text, statuses, unique email, RLS on every table", () => {
    const sql = readFileSync("supabase/migrations/0001_newsletter.sql", "utf8");
    assert.ok(
        sql.includes(CONSENT_TEXT.replace(/'/g, "''")),
        "consent wording must match",
    );
    assert.ok(sql.includes(`'${CONSENT_TEXT_VERSION}'`));
    assert.match(
        sql,
        /check \(status in \('pending', 'active', 'unsubscribed'\)\)/,
    );
    assert.match(
        sql,
        /unique index if not exists newsletter_subscribers_email_uq\s+on public\.newsletter_subscribers \(email_normalised\)/,
    );
    for (const table of [
        "newsletter_consent_texts",
        "newsletter_subscribers",
        "newsletter_events",
    ])
        assert.match(
            sql,
            new RegExp(`alter table public\\.${table}\\s+enable row level security`),
        );
    assert.match(
        readFileSync("supabase/migrations/0000_rate_limit.sql", "utf8"),
        /alter table public\.rate_limits enable row level security/,
    );
    assert.doesNotMatch(sql, /create policy/i);
});

test("the Privacy Policy is clearly a draft, kept out of search, and the example env file holds no values", () => {
    const page = readFileSync("src/app/privacy/page.tsx", "utf8").replace(
        /\s+/g,
        " ",
    );
    assert.match(page, />\s*Draft\s*</);
    assert.match(page, /robots: \{ index: false/);
    assert.match(page, /has not been approved as a legal document/);
    assert.match(page, /To be confirmed by the organisation/);
    const env = readFileSync(".env.example", "utf8");
    for (const name of [
        "CONTACT_RECIPIENT_EMAIL",
        "MAIL_API_KEY",
        "MAIL_FROM",
        "TURNSTILE_SECRET_KEY",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_ANON_KEY",
        "NEWSLETTER_ADMIN_EMAILS",
        "NEWSLETTER_TOKEN_SECRET",
        "RATE_LIMIT_SALT",
        "APP_BASE_URL",
    ])
        assert.match(
            env,
            new RegExp(`^${name}=$`, "m"),
            `${name} should be listed with no value`,
        );
});

test("production refuses to take sign-ups when Turnstile is not configured", async () => {
    const { deps, store, sent } = setup();
    const refused = await subscribe(
        { ...deps, requireTurnstile: true },
        request(),
    );
    assert.equal(refused.status, 503);
    assert.equal(refused.body.code, "not_configured");
    assert.equal(store.rows.size, 0);
    assert.equal(sent.length, 0);
});

test("the confirmation email does not link to a privacy page that is not published", async () => {
    const { deps, sent } = setup();
    await subscribe(deps, request());
    assert.ok(!/\/privacy/.test(sent[0].text));
    assert.ok(!/\/privacy/.test(sent[0].html ?? ""));
    assert.match(sent[0].text, /newsletter\/confirm\?token=/);
});

test("Supabase settings: Marketplace names work, the service key stays server-side, new secret keys are not sent as a bearer token", async () => {
    const { getSupabaseConfig, supabaseRest } = await import(
        "../src/lib/supabase/rest"
    );
    const saved = { ...process.env };
    const seen: Array<Record<string, string>> = [];
    const fakeFetch = (async (_url: unknown, init?: RequestInit) => {
        seen.push(init?.headers as Record<string, string>);
        return new Response("[]");
    }) as typeof fetch;
    try {
        for (const key of [
            "SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_URL",
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_SECRET_KEY",
        ])
            delete process.env[key];
        assert.equal(getSupabaseConfig(), undefined);

        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.test/";
        process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJ.legacy.jwt";
        const legacy = getSupabaseConfig()!;
        assert.equal(legacy.url, "https://x.supabase.test");
        await supabaseRest(legacy, "t", {}, fakeFetch);
        assert.equal(seen[0].Authorization, "Bearer eyJ.legacy.jwt");

        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        process.env.SUPABASE_SECRET_KEY = "sb_secret_example";
        const modern = getSupabaseConfig()!;
        await supabaseRest(modern, "t", {}, fakeFetch);
        assert.equal(seen[1].apikey, "sb_secret_example");
        assert.equal(seen[1].Authorization, undefined);
    } finally {
        process.env = saved;
    }
});

test("the website contact form never touches the newsletter, and public sign-up is closed on the server until it is switched on", () => {
    for (const file of [
        "src/lib/contact/handle-contact.ts",
        "src/lib/contact/validate.ts",
        "src/app/api/contact/route.ts",
        "src/components/ui/ContactForm.tsx",
    ])
        {
            const code = readFileSync(file, "utf8")
                .split("\n")
                .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
                .join("\n");
            assert.ok(!/newsletter/i.test(code.replace(/marketing mailing list/g, "")), `${file} must not use the newsletter`);
        }
    const route = readFileSync("src/app/api/newsletter/subscribe/route.ts", "utf8");
    assert.ok(route.indexOf("if (!isNewsletterSignupLive())") > 0);
    assert.ok(route.indexOf("if (!isNewsletterSignupLive())") < route.indexOf("await readJsonBody"));
});

test("migrations: safe to repeat, nothing dropped or deleted, names that cannot collide with existing objects", () => {
    for (const file of ["supabase/migrations/0000_rate_limit.sql", "supabase/migrations/0001_newsletter.sql"]) {
        const sql = readFileSync(file, "utf8").toLowerCase();
        assert.ok(!/drop\s+(table|schema|column|function|policy|extension)/.test(sql), `${file} drops something`);
        assert.ok(!/(truncate|delete\s+from)\s/.test(sql.replace(/--.*$/gm, "").replace(/\$\$[\s\S]*?\$\$/g, "")), `${file} deletes data outside a function`);
        for (const line of sql.split("\n").filter((entry) => /^create (table|index|unique index)/.test(entry)))
            assert.ok(line.includes("if not exists"), `${file}: ${line}`);
        for (const line of sql.split("\n").filter((entry) => /^create function/.test(entry)))
            assert.fail(`${file}: use create or replace: ${line}`);
    }
    const newsletter = readFileSync("supabase/migrations/0001_newsletter.sql", "utf8");
    assert.ok(!/function set_updated_at/.test(newsletter), "generic function name");
    assert.ok(/newsletter_set_updated_at/.test(newsletter));
});

test("migrations: every function is schema-safe and locked down, no public role is granted anything", () => {
    const files = ["supabase/migrations/0000_rate_limit.sql", "supabase/migrations/0001_newsletter.sql"];
    for (const file of files) {
        const sql = readFileSync(file, "utf8");
        const code = sql.replace(/--.*$/gm, "");
        assert.match(code, /^\s*begin;/m, `${file} runs in one transaction`);
        assert.match(code, /^\s*commit;/m);
        assert.doesNotMatch(code, /create policy/i);
        // No grant to a public role, ever.
        assert.doesNotMatch(code, /grant[^;]*\bto\b[^;]*\b(anon|authenticated|public)\b/i, `${file} grants to a public role`);
        // Every function pins its search path and every one is revoked from the public roles.
        const functions = [...code.matchAll(/create or replace function (public\.\w+)\(/g)].map((match) => match[1]);
        assert.ok(functions.length > 0);
        for (const name of functions) {
            const body = code.slice(code.indexOf(`create or replace function ${name}(`));
            const header = body.slice(0, body.indexOf("$$"));
            assert.match(header, /set search_path = ''/, `${name}: search_path`);
            assert.match(code, new RegExp(`revoke all on function ${name.replace(".", "\\.")}\\([^)]*\\) from public, anon, authenticated`), `${name}: revoke`);
        }
        // SECURITY DEFINER functions: only the server's service role may run them.
        for (const match of code.matchAll(/create or replace function (public\.\w+)\([^)]*\)[^$]*?security definer/g))
            assert.match(code, new RegExp(`grant execute on function ${match[1].replace(".", "\\.")}\\([^)]*\\) to service_role;`), `${match[1]}: grant`);
    }
    const newsletter = readFileSync(files[1], "utf8");
    assert.match(newsletter, /newsletter_set_updated_at\(\) from public, anon, authenticated, service_role/);
    assert.match(newsletter, /Run 0000_rate_limit\.sql first/);
    assert.ok(!/create table if not exists public\.rate_limits/.test(newsletter), "0001 must not repeat the shared objects");
});

test("rate_limit_hit rejects every missing or invalid argument explicitly, including NULL", () => {
    const sql = readFileSync("supabase/migrations/0000_rate_limit.sql", "utf8");
    for (const required of [
        "p_key is null",
        "p_window_seconds is null",
        "p_limit is null",
        "p_window_seconds < 1",
        "p_limit < 1",
    ])
        assert.ok(sql.includes(required), required);
});

test("the guards compare column types and the primary key, and use to_regclass so they never fail on a missing table", () => {
    const rate = readFileSync("supabase/migrations/0000_rate_limit.sql", "utf8");
    assert.ok(rate.includes("'timestamp with time zone'"));
    assert.ok(rate.includes("contype = 'p'"));
    assert.ok(!rate.includes("::regclass"), "a ::regclass cast fails when the table does not exist yet");
    const news = readFileSync("supabase/migrations/0001_newsletter.sql", "utf8");
    for (const table of ["newsletter_consent_texts", "newsletter_subscribers", "newsletter_events"])
        assert.ok(news.includes(`('${table}', array[`), `${table} guard`);
    assert.ok(!news.includes("::regclass"));
});

test("verify_security.sql is one read-only SELECT: no statement that could change anything", () => {
    const sql = readFileSync("supabase/verify_security.sql", "utf8");
    const code = sql
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .toLowerCase();
    assert.ok(code.trim().startsWith("with"));
    assert.equal(code.split(";").filter((part) => part.trim() !== "").length, 1, "exactly one statement");
    // Words inside quoted text (check names, privilege names such as 'update') are not statements.
    const outsideQuotes = code
        .split("'")
        .filter((_, index) => index % 2 === 0)
        .join(" ");
    for (const word of ["insert ", "update ", "delete ", "truncate", "create ", "alter ", "drop ", "grant ", "revoke ", "notify", "set role", "execute ", "call ", "copy ", "do $"])
        assert.ok(!outsideQuotes.includes(word), `contains "${word}"`);
    // Reading functions only: nothing here calls the rate limit or cleanup functions.
    assert.ok(!code.includes("rate_limit_hit(") && !code.includes("_cleanup("));
});

test("form mistakes never use up the strict sign-up limits", async () => {
    const { deps } = setup();
    const ip = `203.0.113.${200 + ++ipCounter}`;
    for (let i = 0; i < 10; i++) {
        const mistake = await subscribe(deps, { body: body({ email: "not-an-email" }), ip });
        assert.equal(mistake.status, 400);
    }
    for (let i = 0; i < 3; i++)
        assert.equal((await subscribe(deps, { body: body({ email: `fresh${i}@example.com` }), ip })).status, 202, `valid sign-up ${i + 1}`);
    assert.equal((await subscribe(deps, { body: body({ email: "fresh9@example.com" }), ip })).status, 429, "the fourth valid one is limited");
});

test("a repeat that sends nothing does not count against the per-address email limit; sends are capped at three an hour", async () => {
    const { deps, sent } = setup();
    const email = "cap@example.com";
    assert.equal((await subscribe(deps, request({ email }))).status, 202);
    for (let i = 0; i < 4; i++) {
        // Still pending and the first email was just sent: neutral answer, nothing sent, nothing counted.
        assert.equal((await subscribe(deps, request({ email }))).status, 202);
    }
    assert.equal(sent.length, 1);
    // After the ten-minute pause a new confirmation may go out, up to three in an hour.
    for (let i = 0; i < 2; i++) {
        clock += 11 * 60 * 1000;
        assert.equal((await subscribe(deps, request({ email }))).status, 202);
    }
    assert.equal(sent.length, 3);
    clock += 11 * 60 * 1000;
    const fourth = await subscribe(deps, request({ email }));
    assert.equal(fourth.status, 429);
    assert.equal(sent.length, 3);
    clock += 3600 * 1000;
});

test("admin page: a page past the end goes to the last page; row actions give specific messages", () => {
    const page = readFileSync("src/app/admin/newsletter/page.tsx", "utf8");
    assert.ok(page.includes("page > pages"));
    assert.ok(page.includes("subscriber matches"));
    const actions = readFileSync("src/components/admin/AdminRowActions.tsx", "utf8");
    for (const part of ["response.status === 401", "/admin/login", "response.status === 503", "response.status === 404", "Nothing was changed"])
        assert.ok(actions.includes(part), part);
});
