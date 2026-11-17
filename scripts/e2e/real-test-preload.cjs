/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS preload: required by NODE_OPTIONS=--require */
/* The safety gate for the controlled real-Supabase Newsletter test. Loaded into BOTH the throw-away website copy
   and the test driver. It fails closed: if any setting is missing, the process refuses to start.

   What it enforces (in "dry" mode against the local mock, and in "live" mode against the real services):
   - the only e-mail address that can be written to the database or sent mail is the one approved address;
   - at most RT_MAX_MAILS e-mails can ever be sent, always from the one approved sender;
   - only the listed Supabase routes can be used; Supabase's own login-code e-mail route is blocked;
   - rows can only be changed one at a time by id; deletion is blocked unless the cleanup step switched it on;
   - the only hosts reachable are this computer, the one Supabase project, and (live, app only) api.resend.com;
   - Cloudflare Turnstile is answered locally (the test never contacts Cloudflare);
   - every request is logged (method and kind only, never bodies, keys or addresses) so the plan can be counted. */
const fs = require("fs");
const net = require("net");

function need(name) {
    const value = process.env[name];
    if (!value) throw new Error("real-test preload: " + name + " is not set; refusing to start");
    return value;
}

const MODE = need("RT_MODE");
if (MODE !== "dry" && MODE !== "live") throw new Error("real-test preload: RT_MODE must be dry or live");
const ROLE = need("RT_ROLE"); // "app" (the website copy) or "driver" (the test script)
const APPROVED = need("RT_APPROVED_EMAIL").trim().toLowerCase();
const SENDER = need("RT_APPROVED_SENDER");
const LEDGER = need("RT_LEDGER");
const SUPA = new URL(need("RT_SUPABASE_URL"));
const MOCK = process.env.E2E_MOCK_URL || "";
const MAX_MAILS = Number(need("RT_MAX_MAILS"));
const ALLOW_DELETE = process.env.RT_ALLOW_DELETE === "1";
if (MODE === "dry" && SUPA.hostname !== "127.0.0.1") throw new Error("real-test preload: a dry run must point at the local mock");
if (MODE === "live" && (SUPA.protocol !== "https:" || !/\.supabase\.co$/.test(SUPA.hostname))) throw new Error("real-test preload: live mode needs the https Supabase project address");

const LOCAL = new Set(["127.0.0.1", "localhost", "::1", "0.0.0.0", "::", "[::1]"]);
const reachable = new Set(MODE === "live" ? [SUPA.hostname, ...(ROLE === "app" ? ["api.resend.com"] : [])] : []);
const allowedHost = (host) => !host || LOCAL.has(String(host).toLowerCase()) || reachable.has(String(host).toLowerCase());

function log(kind, method, target, allowed, reason) {
    try {
        fs.appendFileSync(LEDGER, JSON.stringify({ proc: ROLE, kind, method, target, allowed, reason: reason || undefined }) + "\n");
    } catch {
        // The ledger is informational; the gate itself does not depend on it except for the mail counter below.
    }
}

class Blocked extends Error {}
function block(kind, method, target, reason) {
    log(kind, method, target, false, reason);
    return new Blocked("real-test gate: blocked " + method + " " + target + " (" + reason + ")");
}

function mailsAlreadySent() {
    try {
        return fs.readFileSync(LEDGER, "utf8").split("\n").filter((l) => l.includes('"kind":"resend"') && l.includes('"allowed":true')).length;
    } catch {
        return 0;
    }
}

function parseJson(text) {
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

const isApproved = (value) => typeof value === "string" && value.trim().toLowerCase() === APPROVED;
const idFilter = (u) => /^eq\.[0-9a-fA-F-]{36}$/.test(u.searchParams.get("id") || "");

function gateSupabase(u, method, body) {
    const path = u.pathname;
    const target = path.replace(/^\/(rest|auth)\/v1\//, "$1:");
    if (path === "/rest/v1/rpc/rate_limit_hit" && method === "POST") return log("supabase", method, target, true), undefined;
    if (path === "/rest/v1/newsletter_events" && method === "POST") return log("supabase", method, target, true), undefined;
    if (path === "/rest/v1/newsletter_subscribers") {
        if (method === "GET") return log("supabase", method, target, true), undefined;
        if (method === "POST") {
            const rows = Array.isArray(body) ? body : [body];
            const ok = rows.length === 1 && rows[0] && (rows[0].email === undefined || isApproved(rows[0].email)) && (rows[0].email_normalised === undefined || isApproved(rows[0].email_normalised)) && (rows[0].email !== undefined || rows[0].email_normalised !== undefined);
            if (!ok) throw block("supabase", method, target, "only the approved address may be stored");
            return log("supabase", method, target, true), undefined;
        }
        if (method === "PATCH") {
            if (!idFilter(u)) throw block("supabase", method, target, "changes must target one row by id");
            if (body && ((body.email !== undefined && !isApproved(body.email)) || (body.email_normalised !== undefined && !isApproved(body.email_normalised)))) throw block("supabase", method, target, "the address may not be changed");
            return log("supabase", method, target, true), undefined;
        }
        if (method === "DELETE") {
            if (!ALLOW_DELETE) throw block("supabase", method, target, "deletion is switched off (only the approved cleanup step enables it)");
            if (!idFilter(u)) throw block("supabase", method, target, "deletion must target one row by id");
            return log("supabase", method, target, true), undefined;
        }
    }
    if (["/auth/v1/verify", "/auth/v1/token", "/auth/v1/logout"].includes(path) && method === "POST") return log("supabase", method, target, true), undefined;
    if (path === "/auth/v1/user" && method === "GET") return log("supabase", method, target, true), undefined;
    if (path === "/auth/v1/admin/users" && method === "GET" && ROLE === "driver") return log("supabase", method, target, true), undefined;
    if (path === "/auth/v1/admin/generate_link" && method === "POST" && ROLE === "driver" && body && body.type === "magiclink" && isApproved(body.email)) return log("supabase", method, target, true), undefined;
    throw block("supabase", method, target, path === "/auth/v1/otp" ? "Supabase's own login-code e-mail is not allowed in this test" : "route not on the allow-list");
}

function gateMail(body) {
    const msg = body || {};
    const to = [].concat(msg.to || []);
    const problems = [];
    if (ROLE !== "app") problems.push("only the website copy may send mail");
    if (to.length !== 1 || !isApproved(to[0])) problems.push("recipient is not the single approved address");
    if (msg.cc || msg.bcc || msg.reply_to) problems.push("cc/bcc/reply_to are not allowed");
    if (msg.from !== SENDER) problems.push("sender is not the approved sender");
    if (mailsAlreadySent() >= MAX_MAILS) problems.push("the e-mail limit (" + MAX_MAILS + ") has been reached");
    if (problems.length) throw block("resend", "POST", "emails", problems.join("; "));
    log("resend", "POST", "emails", true);
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
    const isRequest = typeof input === "object" && input !== null && !(input instanceof URL);
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = String((init && init.method) || (isRequest && input.method) || "GET").toUpperCase();
    const u = new URL(url);
    if (u.origin === "https://challenges.cloudflare.com") {
        log("turnstile", method, "siteverify", true, "answered locally");
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    let rawBody = init && typeof init.body === "string" ? init.body : undefined;
    if (rawBody === undefined && isRequest && method !== "GET") rawBody = await input.clone().text();
    if (rawBody === undefined && init && init.body !== undefined && init.body !== null) throw block("other", method, u.hostname, "unsupported request body type");
    const body = rawBody ? parseJson(rawBody) : undefined;

    if (u.origin === "https://api.resend.com" && u.pathname === "/emails" && method === "POST") {
        gateMail(body);
        if (MODE === "dry") {
            // Captured by the local mock mailbox: nothing is sent.
            const res = await realFetch(MOCK + "/__mail", { method: "POST", headers: { "Content-Type": "application/json" }, body: rawBody });
            await res.arrayBuffer();
            if (!res.ok) return new Response(JSON.stringify({ message: "mock provider rejected the message" }), { status: res.status });
            return new Response(JSON.stringify({ id: "mock-mail" }), { status: 200 });
        }
        return realFetch(input, init);
    }
    if (MODE === "dry" && u.origin === SUPA.origin && u.pathname.startsWith("/__")) return realFetch(input, init); // the mock's own test controls
    if (u.origin === SUPA.origin) {
        gateSupabase(u, method, body);
        return realFetch(input, init);
    }
    if (u.origin === MOCK || (LOCAL.has(u.hostname) && u.port !== "")) {
        log("local", method, "loopback", true);
        return realFetch(input, init);
    }
    if (!allowedHost(u.hostname)) throw block("other", method, u.hostname, "host not allowed");
    return realFetch(input, init);
};

const realConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
    const first = Array.isArray(args[0]) ? args[0][0] : args[0];
    let host;
    if (first && typeof first === "object") host = first.path ? undefined : first.host;
    else if (typeof first === "number") host = typeof args[1] === "string" ? args[1] : undefined;
    if (!allowedHost(host)) throw block("socket", "CONNECT", String(host), "host not allowed");
    return realConnect.apply(this, args);
};
