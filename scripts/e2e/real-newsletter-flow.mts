/* eslint-disable @typescript-eslint/no-explicit-any -- test driver: loose JSON handling is deliberate here */
/* The test script for the controlled Newsletter integration test. Run it only through
   run-real-newsletter-test.mts, which sets up the safety gate (real-test-preload.cjs) around it.

   It uses the website's own endpoints (sign-up, confirmation page, admin pages, CSV export, admin actions).
   It never creates a session itself, never edits a subscriber directly, and never marks anyone active:
   the subscriber becomes active only when the confirmation link in the e-mail is opened and its button pressed. */
import { generateAdminOtp } from "../dev-admin-otp.mts";

const APP = process.env.RT_APP_URL ?? "";
const MODE = process.env.RT_MODE ?? "";
const PHASE = process.env.RT_PHASE ?? "";
const EMAIL = (process.env.RT_APPROVED_EMAIL ?? "").trim().toLowerCase();
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
const WAIT_MINUTES = Number(process.env.RT_WAIT_MINUTES ?? "15");
const MOCK = process.env.E2E_MOCK_URL ?? "";
if (!APP || !EMAIL || !SUPABASE_URL || !SERVICE_KEY || !["dry", "live"].includes(MODE)) throw new Error("Test driver is not configured; run it through run-real-newsletter-test.mts.");

const results: Array<[string, boolean, string]> = [];
const check = (name: string, ok: boolean, detail = "") => {
    results.push([name, ok, detail]);
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + detail}`);
};
class Stop extends Error {}
const must = (name: string, ok: boolean, detail = "") => {
    check(name, ok, detail);
    if (!ok) throw new Stop(`Stopped at: ${name}`);
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

async function app(path: string, init: RequestInit & { jar?: Jar } = {}) {
    const headers: Record<string, string> = {};
    if (init.jar?.header()) headers.cookie = init.jar.header();
    if (init.method && init.method !== "GET") headers.origin = APP;
    if (init.body) headers["content-type"] = "application/json";
    headers["x-forwarded-for"] = "203.0.113.200";
    const res = await fetch(`${APP}${path}`, { ...init, headers, redirect: "manual" });
    init.jar?.apply(res);
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await res.arrayBuffer()).replace(/<!-- -->/g, "");
    return { res, text, status: res.status, json: () => { try { return JSON.parse(text); } catch { return {}; } } };
}
const post = (path: string, body: unknown, jar?: Jar) => app(path, { method: "POST", body: JSON.stringify(body), jar });

function dbHeaders(): Record<string, string> {
    return { apikey: SERVICE_KEY, ...(SERVICE_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}) };
}
/** A read-only look at the one test row, independent of the website. */
async function dbRow(email = EMAIL): Promise<any | undefined> {
    const url = `${SUPABASE_URL}/rest/v1/newsletter_subscribers?email_normalised=eq.${encodeURIComponent(email)}&select=id,status,source,consent_text_version,consent_given_at,confirmed_at,unsubscribed_at&limit=2`;
    const res = await fetch(url, { headers: dbHeaders() });
    if (!res.ok) throw new Stop(`Could not read the subscriber table (HTTP ${res.status}).`);
    const rows = (await res.json()) as any[];
    return rows[0];
}
const matchCount = (text: string) => (/(\d+) subscribers? match/.exec(text)?.[1] !== undefined ? Number(/(\d+) subscribers? match/.exec(text)![1]) : /No subscribers found/.test(text) ? 0 : -1);

async function signIn(): Promise<Jar> {
    // A real one-time code from Supabase Auth's admin API (nothing is e-mailed), then the normal verify route.
    const { otp } = await generateAdminOtp({ email: EMAIL });
    const jar = new Jar();
    const r = await post("/api/admin/auth/verify", { email: EMAIL, code: otp }, jar);
    must("administrator signs in through the normal verify route", r.status === 200 && Object.keys(jar.cookies).length === 2, `${r.status}`);
    return jar;
}

async function signupFlow() {
    console.log(`\n=== Signup → pending → confirmation → active → search/filter → CSV → unsubscribe (${MODE === "dry" ? "DRY RUN: local mock database and mock mailbox" : "LIVE: real Supabase and real Resend"}) ===`);
    // SAFEGUARD 1: before anything is written (even a sign-in event), look for an existing record with a read-only query.
    const existing = await dbRow();
    must("SAFEGUARD: no record for the test address exists yet (a read-only look; an existing record would stop the test untouched)", existing === undefined, "a record for the test address ALREADY EXISTS: stopping, nothing was changed");
    const jar = await signIn();
    let page = await app("/admin/newsletter", { jar });
    must("dashboard loads", page.status === 200, `${page.status}`);
    const baseline = matchCount(page.text);
    must("baseline total is readable", baseline >= 0, String(baseline));
    console.log(`INFO  baseline subscriber count: ${baseline}`);
    const s = await post("/api/newsletter/subscribe", { email: EMAIL, consent: true, consentVersion: "v1-2026-11", source: "footer", sourcePath: "/", hp: "", t: Date.now() - 10_000, turnstileToken: "t".repeat(24) });
    must("sign-up is accepted and the confirmation e-mail was handed to the provider (neutral 'check your email')", s.status === 202 && s.json().code === "check_email", `${s.status} ${s.text.slice(0, 120)} (the confirmation e-mail could not be sent; stopped safely, NO cleanup was done)`);

    let row = await dbRow();
    must("exactly one PENDING row exists with consent recorded", !!row && row.status === "pending" && row.consent_text_version === "v1-2026-11" && !!row.consent_given_at && row.source === "footer" && !row.confirmed_at, JSON.stringify(row));
    page = await app(`/admin/newsletter?q=${encodeURIComponent(EMAIL.toUpperCase())}`, { jar });
    check("admin search finds it (case-insensitive) as 1 result", matchCount(page.text) === 1, String(matchCount(page.text)));
    page = await app(`/admin/newsletter?q=${encodeURIComponent(EMAIL)}&status=pending&source=footer`, { jar });
    check("admin filter status=pending + source=footer shows it", matchCount(page.text) === 1, String(matchCount(page.text)));
    page = await app(`/admin/newsletter?q=${encodeURIComponent(EMAIL)}&status=active`, { jar });
    check("admin filter status=active does not show it yet", matchCount(page.text) === 0, String(matchCount(page.text)));

    if (MODE === "dry" && !process.env.RT_FORCE_WAIT) {
        // Mock only: read the captured mock mail and press the confirm button the way the person would.
        const state = (await (await fetch(`${MOCK}/__state`)).json()) as any;
        const mail = state.mails.at(-1);
        const token = decodeURIComponent(/token=([^\s"&]+)/.exec(mail?.text ?? "")?.[1] ?? "");
        must("a confirmation mail (mock) went to the approved address only", state.mails.length === 1 && mail.to.length === 1 && mail.to[0].toLowerCase() === EMAIL && !!token, `${state.mails.length}`);
        const view = await app(`/newsletter/confirm?token=${encodeURIComponent(token)}`);
        check("opening the link alone changes nothing", view.status === 200 && (await dbRow()).status === "pending");
        const ok = await post("/api/newsletter/confirm", { token });
        check("pressing the confirm button (simulated, mock only) succeeds", ok.status === 200, `${ok.status}`);
    } else {
        console.log("");
        console.log(">>> ACTION NEEDED (you): open the inbox of the approved address, open the 'confirm your subscription' e-mail,");
        console.log(">>> click the link (it opens this temporary local site in your browser) and press the Confirm button.");
        console.log(`>>> Waiting up to ${WAIT_MINUTES} minutes. Nothing else will be changed until then.`);
        const end = Date.now() + WAIT_MINUTES * 60_000;
        let lastNote = 0;
        while (Date.now() < end) {
            row = await dbRow();
            if (row?.status === "active") break;
            if (Date.now() - lastNote > 60_000) {
                console.log(`INFO  still waiting for the confirmation click (${Math.round((end - Date.now()) / 60_000)} min left)`);
                lastNote = Date.now();
            }
            await new Promise((r) => setTimeout(r, 4000));
        }
        must("the person confirmed (status became active through the real confirm endpoint)", row?.status === "active", "TIMED OUT waiting for the confirmation click. Stopped safely: the row stays pending, nothing else was changed, and NO cleanup was done");
    }

    row = await dbRow();
    must("the row is ACTIVE with a confirmation time", row?.status === "active" && !!row.confirmed_at, JSON.stringify(row));
    page = await app(`/admin/newsletter?q=${encodeURIComponent(EMAIL)}&status=active&source=footer`, { jar });
    check("admin filter status=active + source=footer shows it", matchCount(page.text) === 1, String(matchCount(page.text)));
    page = await app(`/admin/newsletter?q=${encodeURIComponent(EMAIL)}&status=pending`, { jar });
    check("admin filter status=pending no longer shows it", matchCount(page.text) === 0, String(matchCount(page.text)));

    const csv = await app(`/api/admin/newsletter/export?q=${encodeURIComponent(EMAIL)}&status=active`, { jar });
    const lines = csv.text.replace(/^﻿/, "").split("\r\n").filter(Boolean);
    check("CSV export: header + exactly the one test row", csv.status === 200 && lines.length === 2 && lines[1].toLowerCase().includes(EMAIL), `${csv.status} ${lines.length}`);
    check("CSV export: BOM, attachment, no-store, no tokens or ids", csv.text.startsWith("﻿") && /attachment/.test(String(csv.res.headers.get("content-disposition"))) && /no-store/.test(String(csv.res.headers.get("cache-control"))) && !/token|"id"/i.test(lines[0]));

    const un = await post(`/api/admin/newsletter/subscribers/${row.id}`, { action: "unsubscribe" }, jar);
    row = await dbRow();
    check("admin 'unsubscribe' marks the row unsubscribed with a time", un.status === 200 && row?.status === "unsubscribed" && !!row.unsubscribed_at, `${un.status} ${JSON.stringify(row)}`);
    page = await app(`/admin/newsletter?q=${encodeURIComponent(EMAIL)}&status=unsubscribed`, { jar });
    check("admin filter status=unsubscribed shows it", matchCount(page.text) === 1, String(matchCount(page.text)));

    const saved = { ...jar.cookies };
    const out = await post("/api/admin/auth/logout", {}, jar);
    check("sign-out ends the session at Supabase (revoked: true)", out.json().revoked === true, out.text);
    const stale = new Jar();
    stale.cookies = saved;
    check("the old session cookies no longer work", (await app("/api/admin/newsletter/export", { jar: stale })).status === 401);
    console.log("\nINFO  the test row remains (status: unsubscribed). Remove it only through the separate, approved cleanup step.");
}

/** Dry run only: proves the gate refuses everything it should. Uses the local mock; never run live. */
async function negatives() {
    if (MODE !== "dry") throw new Stop("The negative checks only run in the dry run.");
    console.log("\n=== Gate checks (dry run, local mock): what must be REFUSED ===");
    const jar = await signIn();
    const mailsBefore = ((await (await fetch(`${MOCK}/__state`)).json()) as any).mails.length;
    const stranger = "someone.else@example.test";
    const s = await post("/api/newsletter/subscribe", { email: stranger, consent: true, consentVersion: "v1-2026-11", source: "footer", sourcePath: "/", hp: "", t: Date.now() - 10_000, turnstileToken: "t".repeat(24) });
    check("sign-up for any other address is refused", s.status !== 202, `${s.status}`);
    check("...and nothing was stored for it", (await dbRow(stranger)) === undefined);
    check("...and no mail was sent for it", ((await (await fetch(`${MOCK}/__state`)).json()) as any).mails.length === mailsBefore);
    const row = await dbRow();
    const del = await post(`/api/admin/newsletter/subscribers/${row.id}`, { action: "delete" }, jar);
    check("deletion is refused while the cleanup switch is off", del.status !== 200 && (await dbRow()) !== undefined, `${del.status}`);
    // The row is unsubscribed; asking again would need a THIRD mail, beyond the limit of two.
    const again = await post("/api/newsletter/subscribe", { email: EMAIL, consent: true, consentVersion: "v1-2026-11", source: "footer", sourcePath: "/", hp: "", t: Date.now() - 10_000, turnstileToken: "t".repeat(24) });
    check("a third e-mail is refused by the e-mail limit", ((await (await fetch(`${MOCK}/__state`)).json()) as any).mails.length === mailsBefore, `${again.status}`);
    await post("/api/admin/auth/logout", {}, jar);
}

async function cleanup() {
    console.log(`\n=== Cleanup: delete ONLY the test row through the admin 'delete' action (${MODE}) ===`);
    const jar = await signIn();
    const row = await dbRow();
    must("the test row exists", !!row, "nothing to delete");
    // Verify the exact record before deleting: the test row as the live flow left it, and only one match.
    must("the record is exactly the test subscriber left by the test (unsubscribed, footer source, current consent version, confirmed earlier)", (MODE === "dry" || (row.status === "unsubscribed" && !!row.confirmed_at && !!row.unsubscribed_at)) && row.source === "footer" && row.consent_text_version === "v1-2026-11", JSON.stringify({ status: row.status, source: row.source }));
    console.log(`INFO  about to delete record ${row.id} (${EMAIL}, status ${row.status}, source ${row.source}, consent ${row.consent_text_version})`);
    const before = matchCount((await app("/admin/newsletter", { jar })).text);
    const del = await post(`/api/admin/newsletter/subscribers/${row.id}`, { action: "delete" }, jar);
    check("admin 'delete' succeeds", del.status === 200, `${del.status}`);
    check("the test row is gone", (await dbRow()) === undefined);
    const after = matchCount((await app("/admin/newsletter", { jar })).text);
    check("the total dropped by exactly one", after === before - 1, `${before} -> ${after}`);
    console.log(`INFO  final subscriber count: ${after} (before deletion: ${before})`);
    await post("/api/admin/auth/logout", {}, jar);
}

async function main() {
    try {
        if (PHASE === "cleanup") await cleanup();
        else if (PHASE === "negatives") await negatives();
        else if (PHASE === "signup-flow") await signupFlow();
        else throw new Stop(`Unknown phase: ${PHASE}`);
    } catch (error) {
        console.log(`STOP  ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 3;
        try {
            const left = await dbRow();
            console.log(left ? `STATE the test row still exists (status: ${left.status}). It was not changed further and was NOT cleaned up; cleanup needs separate approval.` : "STATE no record for the test address exists.");
        } catch {
            console.log("STATE could not read the row afterwards.");
        }
    }
    const failed = results.filter(([, ok]) => !ok);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length) process.exitCode = process.exitCode || 1;
}
void main();
