/* Collect-only newsletter sign-up: stores an UNVERIFIED request and sends nothing. Everything here is local: no network, no real mail. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getNewsletterDeliveryMode } from "../src/lib/features";
import type { MailSender } from "../src/lib/mail";
import { CONSENT_TEXT, CONSENT_TEXT_VERSION } from "../src/lib/newsletter/consent";
import { buildExport, subscribersToCsv, verificationOf } from "../src/lib/newsletter/csv";
import { confirm, subscribe, type NewsletterDeps } from "../src/lib/newsletter/service";
import { MemoryNewsletterStore, type Subscriber } from "../src/lib/newsletter/store";
import { MemoryRateLimiter } from "../src/lib/security/rate-limit";
import { createToken } from "../src/lib/security/tokens";

let clock = 1_800_000_000_000;
let ipCounter = 0;

function setup(mode: NewsletterDeps["mode"] = "collect_only") {
    const store = new MemoryNewsletterStore(() => new Date(clock).toISOString());
    const sent: unknown[] = [];
    const sender: MailSender = {
        async send(message) {
            sent.push(message);
            return { ok: true, id: "m1" };
        },
    };
    const deps: NewsletterDeps = {
        store,
        mode,
        mail: { sender, from: "News <no-reply@example.test>" },
        tokenSecret: "collect-test-secret-collect-test-secret",
        baseUrl: "https://site.example.test",
        limiter: new MemoryRateLimiter(() => clock),
        rateSalt: "salt",
        nowMs: () => clock,
    };
    return { deps, store, sent };
}
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
const req = (extra: Record<string, unknown> = {}, ip = `198.51.100.${++ipCounter}`) => ({ body: body(extra), ip });
const rows = (store: MemoryNewsletterStore) => [...store.rows.values()];

/** Any use of the network or the mail provider would show up here. */
async function withBlockedNetwork<T>(run: () => Promise<T>): Promise<{ result: T; calls: string[] }> {
    const real = globalThis.fetch;
    const calls: string[] = [];
    globalThis.fetch = (async (input: unknown) => {
        calls.push(String(typeof input === "object" && input !== null && "url" in input ? (input as { url: string }).url : input));
        throw new Error("network is blocked in this test");
    }) as typeof fetch;
    try {
        return { result: await run(), calls };
    } finally {
        globalThis.fetch = real;
    }
}

test("delivery mode: collect_only is the default; only the exact word double_opt_in selects the email workflow", () => {
    for (const value of [undefined, "", " ", "collect_only", "COLLECT_ONLY", "double-opt-in", "double_opt_in_", "true", "1", "email", "doubleoptin"])
        assert.equal(getNewsletterDeliveryMode({ NEWSLETTER_DELIVERY_MODE: value }), "collect_only", String(value));
    assert.equal(getNewsletterDeliveryMode({}), "collect_only");
    for (const value of ["double_opt_in", "DOUBLE_OPT_IN", "  double_opt_in  "])
        assert.equal(getNewsletterDeliveryMode({ NEWSLETTER_DELIVERY_MODE: value }), "double_opt_in", value);
});

test("a valid sign-up creates exactly one unverified pending record with its consent details", async () => {
    const { deps, store } = setup();
    const result = await subscribe(deps, req());
    assert.equal(result.status, 202);
    assert.equal(result.body.code, "request_received");
    assert.equal(rows(store).length, 1);
    const [row] = rows(store);
    assert.equal(row.status, "pending");
    assert.ok(!row.confirmedAt);
    assert.ok(!row.lastConfirmationSentAt);
    assert.equal(row.email, "Person@Example.com");
    assert.equal(row.source, "footer");
    assert.equal(row.sourcePath, "/about");
    assert.equal(row.consentTextVersion, CONSENT_TEXT_VERSION);
    assert.equal(row.consentGivenAt, new Date(clock).toISOString());
    assert.equal(verificationOf(row), "unverified");
});

test("no email and no provider call: nothing is sent and nothing touches the network in collect-only mode", async () => {
    const { deps, store, sent } = setup();
    const { result, calls } = await withBlockedNetwork(() => subscribe(deps, req()));
    assert.equal(result.status, 202);
    assert.equal(sent.length, 0);
    assert.deepEqual(calls, []);
    assert.equal(rows(store).length, 1);
});

test("collect-only needs only the database: no mail settings, token secret or site address", async () => {
    const { deps, store, sent } = setup();
    const minimal: NewsletterDeps = { store: deps.store, mode: "collect_only", limiter: deps.limiter, rateSalt: "salt", nowMs: deps.nowMs };
    assert.equal((await subscribe(minimal, req())).status, 202);
    assert.equal(rows(store).length, 1);
    assert.equal(sent.length, 0);
    const noStore = await subscribe({ ...minimal, store: undefined }, req());
    assert.equal(noStore.status, 503);
    assert.equal(noStore.body.code, "not_configured");
});

test("a deps object without a mode never sends mail", async () => {
    const { deps, sent } = setup();
    const withoutMode: NewsletterDeps = { ...deps, mode: undefined };
    assert.equal((await subscribe(withoutMode, req())).body.code, "request_received");
    assert.equal(sent.length, 0);
});

test("duplicates never create a second record, whatever the capitalisation or status", async () => {
    const { deps, store, sent } = setup();
    await subscribe(deps, req());
    await subscribe(deps, req({ email: "person@example.com" }));
    await subscribe(deps, req({ email: "  PERSON@EXAMPLE.COM " }));
    assert.equal(rows(store).length, 1);
    assert.equal(rows(store)[0].status, "pending");
    // An address that is already verified stays exactly as it is.
    const [row] = rows(store);
    await store.update(row.id, { status: "active", confirmedAt: new Date(clock).toISOString() });
    const again = await subscribe(deps, req());
    assert.equal(again.body.code, "request_received");
    assert.equal(rows(store).length, 1);
    assert.equal(rows(store)[0].status, "active");
    assert.equal(sent.length, 0);
});

test("someone who unsubscribed and asks again becomes a fresh UNVERIFIED request, never active", async () => {
    const { deps, store } = setup();
    await subscribe(deps, req());
    const [row] = rows(store);
    await store.update(row.id, { status: "unsubscribed", unsubscribedAt: new Date(clock).toISOString() });
    clock += 60_000;
    await subscribe(deps, req({ t: clock - 10_000 }));
    const [after] = rows(store);
    assert.equal(rows(store).length, 1);
    assert.equal(after.status, "pending");
    assert.ok(!after.confirmedAt && !after.unsubscribedAt);
    assert.equal(after.consentGivenAt, new Date(clock).toISOString());
});

test("invalid and bot-like requests are refused and store nothing", async () => {
    const { deps, store, sent } = setup();
    const cases: Array<[string, Record<string, unknown>, number]> = [
        ["no @", { email: "nope" }, 400],
        ["empty email", { email: "" }, 400],
        ["header injection", { email: "a@b.test\nBcc:x@y.z" }, 400],
        ["no consent", { consent: false }, 400],
        ["consent as a string", { consent: "true" }, 400],
        ["old consent version", { consentVersion: "v0" }, 400],
        ["bot field filled", { hp: "x" }, 403],
        ["submitted too fast", { t: clock }, 403],
        ["form far too old", { t: clock - 3 * 86_400_000 }, 400],
    ];
    for (const [label, extra, status] of cases) {
        const result = await subscribe(deps, req(extra));
        assert.equal(result.status, status, label);
    }
    assert.equal((await subscribe(deps, { body: [] as unknown, ip: "198.51.100.200" })).status, 400);
    assert.equal(rows(store).length, 0);
    assert.equal(sent.length, 0);
});

test("the Turnstile check still applies, and a failed check stores nothing", async () => {
    const { deps, store } = setup();
    const guarded: NewsletterDeps = { ...deps, requireTurnstile: true, turnstile: { secret: "s", verify: async () => ({ ok: false, reason: "failed" }) } };
    assert.equal((await subscribe(guarded, req({ turnstileToken: "x" }))).status, 403);
    assert.equal(rows(store).length, 0);
    const missing: NewsletterDeps = { ...deps, requireTurnstile: true, turnstile: undefined };
    assert.equal((await subscribe(missing, req())).body.code, "not_configured");
    assert.equal(rows(store).length, 0);
});

test("rate limiting still works: a fourth valid request in ten minutes from one address is refused", async () => {
    const { deps, store } = setup();
    const ip = "203.0.113.77";
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await subscribe(deps, { body: body({ email: `flood${i}@example.test` }), ip })).status);
    assert.deepEqual(codes.slice(0, 3), [202, 202, 202]);
    assert.equal(codes[3], 429);
    assert.equal(rows(store).length, 3);
});

test("an unverified record cannot be made active by any public route: collect-only never issues a confirmation link", async () => {
    const { deps, store, sent } = setup();
    await subscribe(deps, req());
    assert.equal(sent.length, 0); // so nobody was ever given a link
    const [row] = rows(store);
    assert.equal(row.status, "pending");
    const bad = await confirm(deps, { token: "not-a-token", ip: "198.51.100.150" });
    assert.equal(bad.status, 400);
    assert.equal(rows(store)[0].status, "pending");
    const forged = createToken("a-different-secret-a-different-secret-1", "confirm", row.id, Math.floor(clock / 1000) + 86_400);
    assert.equal((await confirm(deps, { token: forged, ip: "198.51.100.151" })).status, 400);
    assert.equal(rows(store)[0].status, "pending");
});

test("the email workflow is still there and works when explicitly switched on", async () => {
    const { deps, store, sent } = setup("double_opt_in");
    const result = await subscribe(deps, req());
    assert.equal(result.body.code, "check_email");
    assert.equal(sent.length, 1);
    assert.equal(rows(store)[0].status, "pending");
    const token = decodeURIComponent(/token=([^\s"&]+)/.exec((sent[0] as { text: string }).text)![1]);
    assert.equal((await confirm(deps, { token, ip: "198.51.100.160" })).status, 200);
    assert.equal(rows(store)[0].status, "active");
    assert.ok(rows(store)[0].confirmedAt);
    assert.equal(sent.length, 2); // the welcome email
});

test("the collect-only code path contains no mail call at all", () => {
    const source = readFileSync("src/lib/newsletter/service.ts", "utf8");
    const start = source.indexOf("async function collectRequest");
    const end = source.indexOf("/** Confirms a pending subscription.");
    assert.ok(start > 0 && end > start);
    const body = source.slice(start, end);
    assert.doesNotMatch(body, /\.mail\b|sender|send\(|fetch\(|createToken|tokenSecret/i);
});

test("the sign-up form and its consent wording never claim verification or a confirmed subscription", () => {
    assert.doesNotMatch(CONSENT_TEXT, /confirmed|verified|you are subscribed/i);
    const form = readFileSync("src/components/ui/NewsletterSignupForm.tsx", "utf8");
    const at = form.indexOf('doneCode === "request_received"');
    assert.ok(at > 0);
    assert.match(form.slice(at, at + 260), /not verified your address/);
    assert.doesNotMatch(form.slice(at, at + 260), /you are subscribed|subscription is confirmed/i);
});

// ---- Admin: search, filters, labels and the two exports ------------------------------------------------------

async function seed(store: MemoryNewsletterStore) {
    const make = async (email: string, extra: { source?: string; status?: Subscriber["status"]; confirmed?: boolean } = {}) => {
        const created = await store.create({ email, source: extra.source ?? "footer", consentTextVersion: CONSENT_TEXT_VERSION, consentGivenAt: new Date(clock).toISOString() });
        if (extra.status)
            await store.update(created.id, {
                status: extra.status,
                confirmedAt: extra.confirmed ? new Date(clock).toISOString() : null,
                unsubscribedAt: extra.status === "unsubscribed" ? new Date(clock).toISOString() : null,
            });
    };
    await make("unverified.one@example.test");
    await make("unverified.two@example.test", { source: "home" });
    await make("verified.one@example.test", { status: "active", confirmed: true });
    await make("gone.one@example.test", { status: "unsubscribed" });
    await make("odd.active@example.test", { status: "active" }); // active but with no confirmation time: not proof of ownership
}

test("admin search and filters find unverified records, and filters combine", async () => {
    const { store } = setup();
    await seed(store);
    assert.equal((await store.list({ q: "UNVERIFIED", limit: 25, offset: 0 })).total, 2);
    assert.equal((await store.list({ status: "pending", limit: 25, offset: 0 })).total, 2);
    assert.equal((await store.list({ status: "active", limit: 25, offset: 0 })).total, 2);
    assert.equal((await store.list({ status: "pending", source: "home", limit: 25, offset: 0 })).total, 1);
    assert.equal((await store.list({ q: "verified.one", status: "active", limit: 25, offset: 0 })).total, 1);
});

test("every record says whether it is verified, and an active row without a confirmation time counts as unverified", async () => {
    const { store } = setup();
    await seed(store);
    const labels = Object.fromEntries(rows(store).map((r) => [r.email, verificationOf(r)]));
    assert.deepEqual(labels, {
        "unverified.one@example.test": "unverified",
        "unverified.two@example.test": "unverified",
        "verified.one@example.test": "verified",
        "gone.one@example.test": "unsubscribed",
        "odd.active@example.test": "unverified",
    });
});

test("the verified export can never contain an unverified, unsubscribed or unproven record", async () => {
    const { store } = setup();
    await seed(store);
    const { csv, filename } = buildExport("verified", rows(store), "2026-11-17");
    assert.match(filename, /verified-recipients/);
    assert.ok(csv.includes("verified.one@example.test"));
    for (const other of ["unverified.one", "unverified.two", "gone.one", "odd.active"]) assert.ok(!csv.includes(other), other);
    const lines = csv.replace(/^﻿/, "").split("\r\n").filter(Boolean);
    assert.equal(lines.length, 2);
    assert.ok(lines[1].includes("ok_to_mail"));
});

test("the all-requests export includes unverified records but marks every row and the file name", async () => {
    const { store } = setup();
    await seed(store);
    const { csv, filename } = buildExport("all", rows(store), "2026-11-17");
    assert.match(filename, /all-requests-INCLUDING-UNVERIFIED/);
    const lines = csv.replace(/^﻿/, "").split("\r\n").filter(Boolean);
    assert.equal(lines.length, 6);
    assert.match(lines[0], /^email,verification,marketing_use,status,/);
    for (const line of lines.slice(1)) assert.match(line, /ok_to_mail|DO_NOT_MAIL_unverified|DO_NOT_MAIL_unsubscribed/);
    assert.equal(lines.filter((l) => l.includes("DO_NOT_MAIL_unverified")).length, 3);
    assert.equal(lines.filter((l) => l.includes("ok_to_mail")).length, 1);
    // The plain converter also marks every row, so no export path can omit the label.
    assert.ok(subscribersToCsv(rows(store)).includes("DO_NOT_MAIL_unverified"));
});

test("the export route defaults to verified recipients only and the admin page offers two clearly named exports", () => {
    const route = readFileSync("src/app/api/admin/newsletter/export/route.ts", "utf8");
    assert.match(route, /params\.get\("audience"\) === "all" \? "all" : "verified"/);
    assert.match(route, /audience === "verified" \? \("active" as const\)/);
    const page = readFileSync("src/app/admin/newsletter/page.tsx", "utf8");
    assert.match(page, /Export verified recipients/);
    assert.match(page, /Export all requests, including unverified/);
    assert.match(page, /Unverified \(pending\)/);
});

test("the admin can only mark unsubscribed or delete: there is no action that makes anyone verified or active", () => {
    const route = readFileSync("src/app/api/admin/newsletter/subscribers/[id]/route.ts", "utf8");
    assert.match(route, /action === "unsubscribe"/);
    assert.match(route, /action === "delete"/);
    assert.doesNotMatch(route, /action === "(activate|confirm|verify|approve)"/);
    assert.doesNotMatch(route, /status: "active"/);
    const actions = readFileSync("src/components/admin/AdminRowActions.tsx", "utf8");
    assert.doesNotMatch(actions, /activate|verify/i);
});

// ---- The contact form is independent ----------------------------------------------------------------------------

test("the contact form does not depend on the newsletter mode and still has its own mail path", () => {
    const contact = readFileSync("src/lib/contact/handle-contact.ts", "utf8");
    assert.doesNotMatch(contact, /newsletter|NEWSLETTER_DELIVERY_MODE|getNewsletterDeliveryMode/i);
    assert.match(contact, /\.send\(/);
    const route = readFileSync("src/app/api/contact/route.ts", "utf8");
    assert.doesNotMatch(route, /newsletter/i);
});
