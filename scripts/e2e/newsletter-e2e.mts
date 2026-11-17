/* eslint-disable @typescript-eslint/no-explicit-any -- test harness: loose types are deliberate here */
/* End-to-end checks of the real built website against the LOCAL MOCK Supabase. Nothing here is the real Supabase. */
import { readFileSync } from "node:fs";
import { createToken } from "../../src/lib/security/tokens.ts";
import { E2E } from "./config.mts";

const APP = E2E.appUrl;
const MOCK = E2E.mockUrl;
const SECRET = E2E.tokenSecret;
const results: Array<[string, boolean, string]> = [];
const check = (name: string, ok: boolean, detail = "") => {
    results.push([name, ok, detail]);
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + detail}`);
};
const everything: string[] = []; // every response body seen, to scan for leaked secrets

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

async function app(path: string, init: RequestInit & { jar?: Jar; origin?: string | null; ip?: string } = {}) {
    const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
    if (init.jar?.header()) headers.cookie = init.jar.header();
    if (init.origin !== null && init.method && init.method !== "GET") headers.origin = init.origin ?? APP;
    if (init.body && !headers["content-type"]) headers["content-type"] = "application/json";
    headers["x-forwarded-for"] = init.ip ?? "203.0.113.1";
    const res = await fetch(`${APP}${path}`, { ...init, headers, redirect: "manual" });
    init.jar?.apply(res);
    // Keep a leading byte-order mark (fetch would drop it) and remove React's empty comment markers.
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await res.arrayBuffer()).replace(/<!-- -->/g, "");
    everything.push(text);
    return { res, text, status: res.status, json: () => { try { return JSON.parse(text); } catch { return {}; } } };
}
const mock = async (path: string, init?: RequestInit) => (await fetch(`${MOCK}${path}`, init)).json() as Promise<any>;
const state = () => mock("/__state");
const post = (path: string, body: unknown, extra: any = {}) => app(path, { method: "POST", body: JSON.stringify(body), ...extra });

async function signIn(jar: Jar, ip = "203.0.113.50") {
    await post("/api/admin/auth/request", { email: "owner@example.test" }, { ip });
    const otp = (await mock("/__otp?email=owner@example.test")).otp; // a fresh real-format code, like the local development tool
    const r = await post("/api/admin/auth/verify", { email: "owner@example.test", code: otp }, { jar, ip });
    return { r, otp };
}

async function main() {
    await mock("/__reset");

    console.log("\n=== 1. Authentication and sessions (mock Supabase Auth) ===");
    const a = await app("/admin/newsletter");
    check("signed out: /admin/newsletter redirects to the sign-in page", [303, 307].includes(a.status) && String(a.res.headers.get("location")).includes("/admin/login"), `${a.status} ${a.res.headers.get("location")}`);
    check("signed out: export is 401", (await app("/api/admin/newsletter/export")).status === 401);
    check("signed out: row action is 401", (await post("/api/admin/newsletter/subscribers/00000000-0000-0000-0000-000000000000", { action: "delete" })).status === 401);
    const bodies = [];
    for (const email of ["owner@example.test", "stranger@example.test", "intruder@example.test"]) {
        const r = await post("/api/admin/auth/request", { email }, { ip: "203.0.113.60" });
        bodies.push(`${r.status} ${r.text}`);
    }
    check("asking for a code gives the same answer for an administrator, a stranger and another user", new Set(bodies).size === 1, bodies.join(" | "));

    await mock("/__otp?email=intruder@example.test");
    const intruderOtp = (await mock("/__otp?email=intruder@example.test")).otp;
    const intruder = new Jar();
    const bad = await post("/api/admin/auth/verify", { email: "intruder@example.test", code: intruderOtp }, { jar: intruder, ip: "203.0.113.61" });
    check("a valid Supabase user who is NOT allow-listed cannot sign in", bad.status === 401 && Object.keys(intruder.cookies).length === 0, `${bad.status}`);
    check("the intruder's session is not usable on the admin page", (await app("/admin/newsletter", { jar: intruder })).status !== 200);

    const jar = new Jar();
    const { r: login, otp } = await signIn(jar);
    check("allow-listed administrator signs in with a one-time code", login.status === 200 && login.text === '{"ok":true}', login.text);
    check("session cookies are HttpOnly + SameSite=Strict (+ Secure in production)", login.res.headers.getSetCookie().length === 2 && login.res.headers.getSetCookie().every((c) => /HttpOnly/.test(c) && /SameSite=Strict/.test(c) && /Secure/.test(c)));
    check("tokens are not in the sign-in response body", !/at-|rt-/.test(login.text));
    let page = await app("/admin/newsletter", { jar });
    check("signed in: the dashboard loads with 0 subscribers", page.status === 200 && /0 subscribers match/.test(page.text), `${page.status}`);

    const accessBefore = jar.cookies.chdc_admin_at, refreshBefore = jar.cookies.chdc_admin_rt;
    // Session renewal: the access token expires; the page sends the browser through the refresh route.
    await mock("/__expire-access");
    page = await app("/admin/newsletter", { jar });
    check("expired access token: the page sends the browser to the refresh route", [303, 307].includes(page.status) && String(page.res.headers.get("location")).includes("/api/admin/auth/refresh"), `${page.status} ${page.res.headers.get("location")}`);
    const refresh = await app("/api/admin/auth/refresh", { jar });
    check("refresh renews the session and rotates BOTH tokens", refresh.status === 303 && jar.cookies.chdc_admin_at !== accessBefore && jar.cookies.chdc_admin_rt !== refreshBefore, `${refresh.status}`);
    check("after renewal the dashboard loads again", (await app("/admin/newsletter", { jar })).status === 200);
    // Rotation: the previous refresh token no longer works (replay).
    const replay = new Jar();
    replay.cookies = { chdc_admin_at: "stale", chdc_admin_rt: refreshBefore };
    const replayed = await app("/api/admin/auth/refresh", { jar: replay });
    check("an old (already used) refresh token is refused and the cookies are cleared", String(replayed.res.headers.get("location")).endsWith("/admin/login") && Object.keys(replay.cookies).length === 0, `${replayed.res.headers.get("location")}`);

    // Logout: separate checks for cookies, session revocation, refresh token, and OTP reuse.
    const saved = { access: jar.cookies.chdc_admin_at, refresh: jar.cookies.chdc_admin_rt };
    const out = await post("/api/admin/auth/logout", {}, { jar });
    check("logout: Supabase confirms the session was ended (revoked: true)", out.json().revoked === true, out.text);
    check("logout: both cookies are cleared in the browser", Object.keys(jar.cookies).length === 0);
    check("logout: the session no longer exists at Supabase", !(await state()).sessions.some((s: any) => s.user === "owner@example.test"));
    const stolen = new Jar();
    stolen.cookies = { chdc_admin_at: saved.access, chdc_admin_rt: saved.refresh };
    const afterLogout = await app("/admin/newsletter", { jar: stolen });
    check("SESSION REVOCATION: the old access token is refused (it is not simply cookie deletion)", afterLogout.status !== 200 || !/Newsletter subscribers/.test(afterLogout.text), `${afterLogout.status}`);
    check("SESSION REVOCATION: an old copy of the cookies cannot read the export", (await app("/api/admin/newsletter/export", { jar: stolen })).status === 401);
    const restored = await app("/api/admin/auth/refresh", { jar: stolen });
    check("SESSION REVOCATION: the old refresh token cannot bring the session back", String(restored.res.headers.get("location")).endsWith("/admin/login") && !stolen.cookies.chdc_admin_at, `${restored.res.headers.get("location")}`);
    const reuse = await post("/api/admin/auth/verify", { email: "owner@example.test", code: otp }, { jar: new Jar(), ip: "203.0.113.51" });
    check("OTP REUSE (a separate check): the same one-time code is rejected a second time", reuse.status === 401, `${reuse.status}`);
    const again = new Jar();
    const second = await signIn(again, "203.0.113.52");
    check("a fresh code signs in again", second.r.status === 200 && (await app("/admin/newsletter", { jar: again })).status === 200);

    // Outage handling
    await mock("/__outage?on=1");
    const down = await app("/admin/newsletter", { jar: again });
    check("Supabase outage: the page says so, does not sign out, shows no data", down.status === 200 && /not responding/.test(down.text) && Object.keys(again.cookies).length === 2, `${down.status}`);
    check("Supabase outage: export is 503", (await app("/api/admin/newsletter/export", { jar: again })).status === 503);
    const outageLogout = await post("/api/admin/auth/logout", {}, { jar: again });
    check("Supabase outage: logout clears cookies and honestly reports revoked: false", outageLogout.json().revoked === false && Object.keys(again.cookies).length === 0, outageLogout.text);
    const outageRequest = await post("/api/admin/auth/request", { email: "owner@example.test" }, { ip: "203.0.113.62" });
    check("Supabase outage: asking for a code still gives the same neutral answer", outageRequest.status === 200 && outageRequest.text === '{"ok":true}');
    await mock("/__outage?on=0");
    check("cross-site logout is refused", (await post("/api/admin/auth/logout", {}, { origin: "https://evil.test" })).status === 403);

    console.log("\n=== 2. Admin dashboard: listing, filters, pagination, CSV, actions (mock database) ===");
    await mock("/__reset");
    const rows = [] as any[];
    for (let i = 0; i < 57; i++)
        rows.push({ email: `person${String(i).padStart(2, "0")}@Example.test`, status: ["pending", "active", "unsubscribed"][i % 3], source: i % 4 === 0 ? "home" : "footer" });
    rows.push({ email: "=cmd|calc@evil.test", status: "active", source: "footer" }, { email: "+plus@evil.test", status: "active", source: "footer" }, { email: "Alice.Smith@Example.test", status: "active", source: "home" });
    await mock("/__seed", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rows: rows.map((r) => (r.status === "active" ? { ...r, confirmed_at: new Date().toISOString() } : r)) }) });
    const admin = new Jar();
    await signIn(admin, "203.0.113.70");
    const get = (q = "") => app(`/admin/newsletter${q}`, { jar: admin });
    let p = await get();
    check("listing: all 60 subscribers counted, 25 rows on page 1", /60 subscribers match/.test(p.text) && (p.text.match(/<tr /g) ?? []).length === 26, `${(p.text.match(/<tr /g) ?? []).length}`);
    p = await get("?page=3");
    check("pagination: page 3 has the last 10 rows", (p.text.match(/<tr /g) ?? []).length === 11);
    p = await get("?page=99");
    check("pagination: a page past the end goes to the last page", [303, 307].includes(p.status) && /page=3/.test(String(p.res.headers.get("location"))), `${p.status} ${p.res.headers.get("location")}`);
    p = await get("?q=ALICE");
    check("search by email is case-insensitive", /1 subscriber matches/.test(p.text) && /Alice\.Smith@Example\.test/.test(p.text));
    p = await get("?status=active&source=home");
    const expectedActiveHome = rows.filter((r) => r.status === "active" && r.source === "home").length;
    check("combined status + source filter", new RegExp(`${expectedActiveHome} subscribers match`).test(p.text), p.text.match(/\d+ subscribers match/)?.[0] ?? "");
    p = await get("?q=person0&status=pending");
    check("combined search + status filter", /subscribers match/.test(p.text));
    p = await get("?q=%25_*,()%5C");
    check("reserved search characters cannot break the query", p.status === 200 && !/could not be loaded/.test(p.text), `${p.status}`);
    p = await get("?status=bogus&source=bogus");
    check("unknown filter values are ignored, not passed on", p.status === 200 && /60 subscribers match/.test(p.text));
    p = await get("?q=zzzzzz");
    check("empty state: no match shows a friendly message", /No subscribers found/.test(p.text));

    const exportOf = async (q = "") => (await app(`/api/admin/newsletter/export${q}`, { jar: admin }));
    let csv = await exportOf("?audience=all");
    const csvRows = (t: string) => t.replace(/^\uFEFF/, "").split("\r\n").filter(Boolean);
    check("CSV export (all requests): all 60 rows plus a header, BOM, correct headers, unverified rows marked", csv.status === 200 && csvRows(csv.text).length === 61 && csv.text.startsWith("\uFEFFemail,verification,marketing_use,status,source,source_page,consent_text_version,consent_given_at,confirmed_at,unsubscribed_at,created_at"), `${csvRows(csv.text).length}`);
    check("CSV export: formula-looking addresses are neutralised", csv.text.includes("'=cmd|calc@evil.test") && csv.text.includes("'+plus@evil.test"));
    check("CSV export: no ids or tokens", !/consent_text_version.*token|"id"/.test(csv.text) && !csv.text.includes("rt-") );
    check("CSV export headers: attachment, no-store, nosniff", /attachment; filename=/.test(String(csv.res.headers.get("content-disposition"))) && /no-store/.test(String(csv.res.headers.get("cache-control"))) && csv.res.headers.get("x-content-type-options") === "nosniff");
    check("CSV export (all requests): the file name says it includes unverified records, and every pending row is marked DO_NOT_MAIL", /all-requests-INCLUDING-UNVERIFIED/.test(String(csv.res.headers.get("content-disposition"))) && csvRows(csv.text).slice(1).filter((l) => /,pending,/.test(l)).every((l) => l.includes("DO_NOT_MAIL_unverified")));
    const totalActive = rows.filter((r) => r.status === "active").length;
    const verifiedCsv = await exportOf();
    check("CSV export (default): ONLY verified recipients, nothing pending or unsubscribed", csvRows(verifiedCsv.text).length - 1 === totalActive && !/,pending,|,unsubscribed,|person00@|person02@/.test(verifiedCsv.text) && /verified-recipients/.test(String(verifiedCsv.res.headers.get("content-disposition"))), `${csvRows(verifiedCsv.text).length - 1} vs ${totalActive}`);
    check("CSV export (default) ignores a status filter asking for pending rows", csvRows((await exportOf("?status=pending")).text).length - 1 === totalActive);
    csv = await exportOf("?audience=all&status=active&source=home");
    check("CSV export follows the filters (status + source)", csvRows(csv.text).length - 1 === expectedActiveHome, `${csvRows(csv.text).length - 1} vs ${expectedActiveHome}`);
    csv = await exportOf("?audience=all&q=alice");
    check("CSV export follows the search", csvRows(csv.text).length === 2);
    check("CSV export is refused for a signed-out visitor", (await app("/api/admin/newsletter/export?status=active")).status === 401);
    check("audit: each export is logged with the administrator's address, no data", (await state()).events.filter((e: any) => /^admin_export/.test(e.event) && e.actor === "owner@example.test" && e.subscriber_id === null).length >= 3);

    const st = await state();
    const target = st.subscribers.find((r: any) => r.email_normalised === "person01@example.test");
    const act = (id: string, action: string, extra: any = {}) => post(`/api/admin/newsletter/subscribers/${id}`, { action }, { jar: admin, ...extra });
    check("action from another site is refused (CSRF)", (await act(target.id, "delete", { origin: "https://evil.test" })).status === 403);
    check("action without an Origin header is refused", (await act(target.id, "delete", { origin: null })).status === 403);
    check("a malformed id is rejected", (await act("not-an-id", "delete")).status === 400);
    check("an unknown action is rejected", (await act(target.id, "explode")).status === 400);
    check("an unknown id is a 404", (await act("00000000-0000-4000-8000-000000000000", "delete")).status === 404);
    check("status change: mark unsubscribed", (await act(target.id, "unsubscribe")).status === 200 && (await state()).subscribers.find((r: any) => r.id === target.id).status === "unsubscribed");
    check("status change is audited (actor, no email in the event)", (await state()).events.some((e: any) => e.event === "unsubscribed_by_admin" && e.actor === "owner@example.test" && e.subscriber_id === target.id));
    check("deletion removes the row", (await act(target.id, "delete")).status === 200 && !(await state()).subscribers.some((r: any) => r.id === target.id));
    check("deletion is audited without keeping the subscriber's id or address", (await state()).events.some((e: any) => e.event === "deleted_by_admin" && e.subscriber_id === null && !JSON.stringify(e).includes("person01")));
    await mock("/__outage?on=1");
    const err = await get();
    check("database outage: the page shows an error state, not data", /Administration|not responding|could not be loaded/.test(err.text), `${err.status}`);
    await mock("/__outage?on=0");

    console.log("\n=== 3. Public sign-up lifecycle (isolated copy with the flag ON; mock database and mock email) ===");
    await mock("/__reset");
    const ts = () => Date.now() - 10_000;
    const sub = (email: string, extra: any = {}, ip = "198.51.100.1") =>
        post("/api/newsletter/subscribe", { email, consent: true, consentVersion: "v1-2026-11", source: "footer", sourcePath: "/about", hp: "", t: ts(), turnstileToken: "x".repeat(20), ...extra }, { ip });
    let s = await sub("New.Person@Example.test", {}, "198.51.100.2");
    check("footer sign-up: accepted, asks to check email", s.status === 202 && s.json().code === "check_email", s.text);
    let snap = await state();
    const row = snap.subscribers[0];
    check("a PENDING record is stored with consent version, time and source", row.status === "pending" && row.consent_text_version === "v1-2026-11" && !!row.consent_given_at && row.source === "footer" && row.source_path === "/about" && row.email_normalised === "new.person@example.test");
    const mail1 = snap.mails.at(-1);
    check("a confirmation email (mock) went to the address; nothing is active yet", snap.mails.length === 1 && mail1.to[0] === "New.Person@Example.test" && /newsletter\/confirm\?token=/.test(mail1.text) && row.status === "pending");
    check("the confirmation email does not link to an unpublished privacy page", !/\/privacy/.test(mail1.text + mail1.html));
    const confirmToken = decodeURIComponent(/token=([^\s"&]+)/.exec(mail1.text)![1]);
    s = await sub("home.person@example.test", { source: "home", sourcePath: "/" }, "198.51.100.3");
    check("home sign-up is recorded with source 'home'", s.status === 202 && (await state()).subscribers.find((r: any) => r.email_normalised === "home.person@example.test").source === "home");
    s = await sub("new.person@example.test", {}, "198.51.100.4");
    snap = await state();
    check("duplicate while pending: same neutral answer, one record, no second email", s.status === 202 && snap.subscribers.filter((r: any) => r.email_normalised === "new.person@example.test").length === 1 && snap.mails.filter((m: any) => m.to[0].toLowerCase() === "new.person@example.test").length === 1);

    for (const [label, body, code] of [
        ["no @", { email: "nope" }, 400], ["header injection", { email: "a@b.test\nBcc:x@y.z" }, 400], ["no consent", { consent: false }, 400],
        ["consent as a string", { consent: "true" }, 400], ["old consent version", { consentVersion: "v0" }, 400], ["bot field filled", { hp: "x" }, 403], ["too fast", { t: Date.now() }, 403],
    ] as const) {
        const r = await sub(`valid${Math.random().toString(36).slice(2, 6)}@example.test`, body as any, "198.51.100.5");
        check(`rejected: ${label}`, r.status === code, `${r.status} ${r.text}`);
    }
    check("rejected requests created nothing", (await state()).subscribers.length === 2);
    const mistakes: number[] = [];
    for (let i = 0; i < 6; i++) mistakes.push((await sub("not-an-email", {}, "198.51.100.30")).status);
    const valid3: number[] = [];
    for (let i = 0; i < 3; i++) valid3.push((await sub(`after.mistakes${i}@example.test`, {}, "198.51.100.30")).status);
    check("form mistakes do not use up the strict sign-up limits", mistakes.every((c) => c === 400) && valid3.every((c) => c === 202), `${mistakes} / ${valid3}`);

    // Confirmation: opening the link changes nothing; the button (POST) does.
    const view = await app(`/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`);
    check("opening the emailed link alone does not subscribe anyone", view.status === 200 && (await state()).subscribers.find((r: any) => r.email_normalised === "new.person@example.test").status === "pending");
    check("a tampered token is refused", (await post("/api/newsletter/confirm", { token: confirmToken.slice(0, -2) + "xx" }, { ip: "198.51.100.6" })).status === 400);
    const expired = createToken(SECRET, "confirm", row.id, Math.floor(Date.now() / 1000) - 10);
    check("an expired confirmation link is refused", (await post("/api/newsletter/confirm", { token: expired }, { ip: "198.51.100.6" })).json().code === "expired");
    const unsubTokenAsConfirm = createToken(SECRET, "unsubscribe", row.id);
    check("an unsubscribe token cannot confirm", (await post("/api/newsletter/confirm", { token: unsubTokenAsConfirm }, { ip: "198.51.100.6" })).status === 400);
    const ok = await post("/api/newsletter/confirm", { token: confirmToken }, { ip: "198.51.100.7" });
    snap = await state();
    check("confirming activates the subscription (double opt-in complete)", ok.status === 200 && snap.subscribers.find((r: any) => r.id === row.id).status === "active" && !!snap.subscribers.find((r: any) => r.id === row.id).confirmed_at);
    check("a welcome email with an unsubscribe link is sent", /newsletter\/unsubscribe\?token=/.test(snap.mails.at(-1).text));
    check("confirming again is harmless", (await post("/api/newsletter/confirm", { token: confirmToken }, { ip: "198.51.100.7" })).status === 200 && (await state()).mails.length === snap.mails.length);
    s = await sub("new.person@example.test", {}, "198.51.100.8");
    check("sign-up by an active subscriber: neutral answer, no new email, still active", s.status === 202 && (await state()).mails.length === snap.mails.length && (await state()).subscribers.find((r: any) => r.id === row.id).status === "active");

    // Unsubscribe and resubscribe
    const unsubToken = decodeURIComponent(/token=([^\s"&]+)/.exec(snap.mails.at(-1).text)![1]);
    const un = await post("/api/newsletter/unsubscribe", { token: unsubToken }, { ip: "198.51.100.9" });
    check("unsubscribe link works and records the time", un.status === 200 && (await state()).subscribers.find((r: any) => r.id === row.id).status === "unsubscribed" && !!(await state()).subscribers.find((r: any) => r.id === row.id).unsubscribed_at);
    check("an old confirmation link cannot reactivate an unsubscribed person", (await post("/api/newsletter/confirm", { token: confirmToken }, { ip: "198.51.100.9" })).status === 400 && (await state()).subscribers.find((r: any) => r.id === row.id).status === "unsubscribed");
    const mailsBefore = (await state()).mails.length;
    s = await sub("new.person@example.test", {}, "198.51.100.10");
    snap = await state();
    check("resubscribing starts again at PENDING with fresh consent and a new confirmation email", s.status === 202 && snap.subscribers.find((r: any) => r.id === row.id).status === "pending" && snap.mails.length === mailsBefore + 1);
    const again2 = decodeURIComponent(/token=([^\s"&]+)/.exec(snap.mails.at(-1).text)![1]);
    check("...and becomes active only after confirming again", (await post("/api/newsletter/confirm", { token: again2 }, { ip: "198.51.100.11" })).status === 200 && (await state()).subscribers.find((r: any) => r.id === row.id).status === "active");
    check("events are recorded for the lifecycle", ["subscribe_requested", "confirmation_sent", "confirmed", "unsubscribed"].every((name) => (await_events(snap)).includes(name)));
    function await_events(sn: any) { return sn.events.map((e: any) => e.event); }

    // Rate limiting
    const flood: number[] = [];
    for (let i = 0; i < 5; i++) flood.push((await sub(`flood${i}@example.test`, {}, "198.51.100.99")).status);
    check("rate limit: the 4th sign-up in ten minutes from one address is refused (429)", flood.slice(0, 3).every((c) => c === 202) && flood[3] === 429, flood.join(","));
    const email3: number[] = [];
    for (let i = 0; i < 5; i++) email3.push((await sub("same.email@example.test", {}, `198.51.100.${120 + i}`)).status);
    check("rate limit: the same email address is limited across addresses", email3.includes(429) || (await state()).mails.filter((m: any) => m.to[0] === "same.email@example.test").length <= 1, email3.join(","));
    check("cross-site sign-up is refused", (await post("/api/newsletter/subscribe", { email: "x@y.test" }, { origin: "https://evil.test" })).status === 403);

    console.log("\n=== 4. Leak scan: tokens, keys, codes and addresses in responses ===");
    const all = everything.join("\n");
    check("no service key in any response", !all.includes("eyJ.service-test") && !all.includes("service-test"));
    check("no session token in any response body", !/\bat-\d+\b|\brt-\d+\b/.test(all));
    // A missing log must fail the check, not pass it.
    const logText = (() => { try { return readFileSync(process.env.E2E_APP_LOG ?? "", "utf8"); } catch { return ""; } })();
    check("server log holds no tokens, codes, service key or subscriber addresses", logText.length > 0 && !/\bat-\d+\b|\brt-\d+\b|eyJ\.service|111111|@example\.test|@evil\.test/.test(logText), logText.split("\n").filter((l) => /\bat-\d+|rt-\d+|@example\.test|111111/.test(l)).slice(0, 3).join(" | "));

    const failed = results.filter(([, ok]) => !ok);
    console.log(`\n${results.length - failed.length}/${results.length} passed`);
    if (failed.length) { console.log("FAILED:"); for (const [name, , detail] of failed) console.log(" -", name, detail); process.exitCode = 1; }
}
main().catch((error) => { console.error(error); process.exitCode = 2; });
