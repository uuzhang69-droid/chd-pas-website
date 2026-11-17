/* eslint-disable @typescript-eslint/no-explicit-any -- test driver: loose JSON handling is deliberate here */
/* End-to-end checks of the real built website in COLLECT-ONLY mode (the safe default): a sign-up is stored as an UNVERIFIED
   record and no email is sent. Runs against the LOCAL MOCK Supabase and the mock mailbox; nothing here is a real service. */
import { CONSENT_TEXT_VERSION } from "../../src/lib/newsletter/consent.ts";
import { E2E } from "./config.mts";

const APP = E2E.appUrl;
const MOCK = E2E.mockUrl;
const results: Array<[string, boolean, string]> = [];
const check = (name: string, ok: boolean, detail = "") => {
    results.push([name, ok, detail]);
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + detail}`);
};

class Jar {
    cookies: Record<string, string> = {};
    apply(res: Response) {
        for (const line of res.headers.getSetCookie()) {
            const [pair, ...attrs] = line.split("; ");
            const [name, ...rest] = pair.split("=");
            const value = decodeURIComponent(rest.join("="));
            if (attrs.some((a) => /^Max-Age=0$/i.test(a)) || value === "") delete this.cookies[name];
            else this.cookies[name] = value;
        }
    }
    header() {
        return Object.entries(this.cookies).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; ");
    }
}

async function app(path: string, init: RequestInit & { jar?: Jar; ip?: string } = {}) {
    const headers: Record<string, string> = {};
    if (init.jar?.header()) headers.cookie = init.jar.header();
    if (init.method && init.method !== "GET") headers.origin = APP;
    if (init.body) headers["content-type"] = "application/json";
    headers["x-forwarded-for"] = init.ip ?? "203.0.113.1";
    const res = await fetch(`${APP}${path}`, { ...init, headers, redirect: "manual" });
    init.jar?.apply(res);
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await res.arrayBuffer()).replace(/<!-- -->/g, "");
    return { res, text, status: res.status, json: () => { try { return JSON.parse(text); } catch { return {}; } } };
}
const mock = async (path: string, init?: RequestInit) => (await fetch(`${MOCK}${path}`, init)).json() as Promise<any>;
const state = () => mock("/__state");
const post = (path: string, body: unknown, extra: any = {}) => app(path, { method: "POST", body: JSON.stringify(body), ...extra });
const csvLines = (t: string) => t.replace(/^﻿/, "").split("\r\n").filter(Boolean);

const signup = (email: string, extra: Record<string, unknown> = {}, ip = "198.51.100.10") =>
    post("/api/newsletter/subscribe", { email, consent: true, consentVersion: CONSENT_TEXT_VERSION, source: "footer", sourcePath: "/about", hp: "", t: Date.now() - 10_000, turnstileToken: "x".repeat(20), ...extra }, { ip });

async function main() {
    await mock("/__reset");
    console.log("\n=== Collect-only sign-up: stored UNVERIFIED, no email (mock database, mock mailbox) ===");

    const home = await app("/");
    check("the footer still shows the newsletter form", /Subscribe to our newsletter/.test(home.text));

    let r = await signup("New.Person@Example.test", {}, "198.51.100.11");
    check("a valid sign-up is accepted with the 'request received' answer", r.status === 202 && r.json().code === "request_received", r.text);
    let snap = await state();
    const row = snap.subscribers[0];
    check("exactly one record exists and it is PENDING (unverified), never active", snap.subscribers.length === 1 && row.status === "pending" && !row.confirmed_at);
    check("consent version, time and source are stored", row.consent_text_version === CONSENT_TEXT_VERSION && !!row.consent_given_at && row.source === "footer" && row.source_path === "/about");
    check("no confirmation email and no welcome email were sent (the mock mailbox is empty)", snap.mails.length === 0, String(snap.mails.length));
    check("the answer never claims a verified or active subscription", !/confirm|verified|subscribed/i.test(r.text.replace("request_received", "")));

    r = await signup("new.person@example.test", {}, "198.51.100.12");
    r = await signup("  NEW.PERSON@EXAMPLE.TEST ", {}, "198.51.100.13");
    snap = await state();
    check("duplicates (any capitalisation) create no second record and send nothing", snap.subscribers.length === 1 && snap.mails.length === 0);

    const bad: Array<[string, Record<string, unknown>, number]> = [
        ["no @", { email: "nope" }, 400], ["header injection", { email: "a@b.test\nBcc:x@y.z" }, 400], ["no consent", { consent: false }, 400],
        ["old consent version", { consentVersion: "v0" }, 400], ["bot field filled", { hp: "x" }, 403], ["too fast", { t: Date.now() }, 403],
    ];
    for (const [label, extra, code] of bad) {
        const res = await signup(`valid${Math.random().toString(36).slice(2, 6)}@example.test`, extra, "198.51.100.20");
        check(`rejected: ${label}`, res.status === code, `${res.status} ${res.text}`);
    }
    check("rejected requests stored nothing and sent nothing", (await state()).subscribers.length === 1 && (await state()).mails.length === 0);

    const flood: number[] = [];
    for (let i = 0; i < 5; i++) flood.push((await signup(`flood${i}@example.test`, {}, "198.51.100.99")).status);
    check("rate limiting still works: the 4th valid sign-up in ten minutes is refused (429)", flood.slice(0, 3).every((c) => c === 202) && flood[3] === 429, flood.join(","));

    const fake = await post("/api/newsletter/confirm", { token: "not-a-token" }, { ip: "198.51.100.31" });
    check("there is no way to confirm: a made-up token is refused and the record stays pending", fake.status === 400 && (await state()).subscribers[0].status === "pending");

    console.log("\n=== Admin: unverified records are clearly marked; exports keep them apart ===");
    const admin = new Jar();
    await post("/api/admin/auth/request", { email: "owner@example.test" }, { ip: "203.0.113.50" });
    const otp = (await mock("/__otp?email=owner@example.test")).otp;
    const login = await post("/api/admin/auth/verify", { email: "owner@example.test", code: otp }, { jar: admin, ip: "203.0.113.50" });
    check("administrator signs in", login.status === 200);
    const total = (await state()).subscribers.length;
    let page = await app("/admin/newsletter", { jar: admin });
    check("the dashboard lists the record as Unverified, with the explanation", /Unverified \(pending\)/.test(page.text) && /have not been checked/.test(page.text) && !/Verified \(active\)<\/span>/.test(page.text));
    page = await app("/admin/newsletter?q=NEW.PERSON", { jar: admin });
    check("search finds it (case-insensitive)", /1 subscriber matches/.test(page.text));
    page = await app("/admin/newsletter?status=pending", { jar: admin });
    check("filter Unverified (pending) shows the records", new RegExp(`${total} subscribers match`).test(page.text), page.text.match(/\d+ subscribers? match/)?.[0] ?? "");
    page = await app("/admin/newsletter?status=active", { jar: admin });
    check("filter Verified (active) shows nothing: nobody was ever verified", /No subscribers found/.test(page.text));

    const verified = await app("/api/admin/newsletter/export", { jar: admin });
    check("export of verified recipients (the default) contains NO unverified address", verified.status === 200 && csvLines(verified.text).length === 1 && !verified.text.includes("new.person"), `${csvLines(verified.text).length}`);
    check("...and its file name says verified recipients", /verified-recipients/.test(String(verified.res.headers.get("content-disposition"))));
    const verifiedPending = await app("/api/admin/newsletter/export?status=pending", { jar: admin });
    check("asking the verified export for pending rows still returns none", csvLines(verifiedPending.text).length === 1);
    const all = await app("/api/admin/newsletter/export?audience=all", { jar: admin });
    const lines = csvLines(all.text);
    check("the all-requests export includes the unverified records, every row marked DO_NOT_MAIL_unverified", lines.length === total + 1 && lines.slice(1).every((l) => l.includes("DO_NOT_MAIL_unverified") && l.includes(",unverified,")), `${lines.length}`);
    check("...and its file name says it includes unverified records", /all-requests-INCLUDING-UNVERIFIED/.test(String(all.res.headers.get("content-disposition"))));

    const id = (await state()).subscribers[0].id;
    const un = await post(`/api/admin/newsletter/subscribers/${id}`, { action: "unsubscribe" }, { jar: admin });
    check("admin can mark a record unsubscribed", un.status === 200 && (await state()).subscribers[0].status === "unsubscribed");
    check("there is no admin action that verifies or activates a record", (await post(`/api/admin/newsletter/subscribers/${id}`, { action: "activate" }, { jar: admin })).status === 400 && (await state()).subscribers[0].status === "unsubscribed");
    const del = await post(`/api/admin/newsletter/subscribers/${id}`, { action: "delete" }, { jar: admin });
    check("admin can delete a record", del.status === 200 && !(await state()).subscribers.some((s: any) => s.id === id));
    const ev = (await state()).events.map((e: any) => e.event);
    check("audit events were recorded (sign-up request, exports, unsubscribe, delete)", ["subscribe_requested", "admin_export", "admin_export_all", "unsubscribed_by_admin", "deleted_by_admin"].every((name) => ev.includes(name)), ev.join(","));
    check("at the very end: still no email of any kind", (await state()).mails.length === 0);

    const failed = results.filter(([, ok]) => !ok);
    console.log(`\n${results.length - failed.length}/${results.length} passed`);
    if (failed.length) { console.log("FAILED:"); for (const [name, , detail] of failed) console.log(" -", name, detail); process.exitCode = 1; }
}
main().catch((error) => { console.error(error); process.exitCode = 2; });
