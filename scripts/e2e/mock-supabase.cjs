/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test server */
/* A small stand-in for Supabase Auth (GoTrue) and PostgREST, for local end-to-end tests. NOT the real Supabase.
   Listens on 127.0.0.1 only, keeps everything in memory, and only knows fixed example.test users. */
const http = require("http");

const PORT = Number(process.env.MOCK_PORT || 4010);
const state = {
    users: {
        "owner@example.test": { id: "u-owner", email: "owner@example.test", email_confirmed_at: "2026-01-01T00:00:00Z" },
        "intruder@example.test": { id: "u-intruder", email: "intruder@example.test", email_confirmed_at: "2026-01-01T00:00:00Z" },
        "unconfirmed@example.test": { id: "u-unconf", email: "unconfirmed@example.test", email_confirmed_at: null },
    },
    otps: {}, // email -> code (single slot, like Supabase: a new request replaces the old one)
    sessions: {}, // sessionId -> { user, access, refresh, usedRefresh:Set, expired:boolean }
    byAccess: {},
    byRefresh: {},
    subscribers: [],
    events: [],
    counters: {},
    mails: [],
    outage: false,
    mailFail: false,
    log: [],
};
if (process.env.MOCK_ADMIN_EMAIL) {
    const email = process.env.MOCK_ADMIN_EMAIL.toLowerCase();
    state.users[email] = { id: "u-approved-admin", email, email_confirmed_at: "2026-01-01T00:00:00Z" };
}
let n = 0;
let seq = 0; // deterministic ids and codes: the same run always produces the same values
const uid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`;
const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { "Content-Type": "application/json", ...headers });
    res.end(status === 204 ? undefined : JSON.stringify(body ?? {}));
};
const bearer = (req) => (req.headers.authorization || "").replace(/^Bearer /, "");

function readBody(req) {
    return new Promise((resolve) => {
        let data = "";
        req.on("data", (c) => (data += c));
        req.on("end", () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch {
                resolve({});
            }
        });
    });
}

function newSession(user) {
    const id = uid();
    const session = { id, user, access: `at-${++n}`, refresh: `rt-${++n}`, usedRefresh: new Set(), expired: false };
    state.sessions[id] = session;
    state.byAccess[session.access] = session;
    state.byRefresh[session.refresh] = session;
    return session;
}
const tokens = (s) => ({ access_token: s.access, refresh_token: s.refresh, expires_in: 3600, token_type: "bearer", user: s.user });

function parseFilters(url) {
    const f = {};
    for (const [k, v] of url.searchParams) f[k] = v;
    return f;
}
function matchRow(row, f) {
    if (f.id && f.id.startsWith("eq.") && row.id !== f.id.slice(3)) return false;
    if (f.email_normalised) {
        const v = f.email_normalised;
        if (v.startsWith("eq.") && row.email_normalised !== decodeURIComponent(v.slice(3))) return false;
        if (v.startsWith("ilike.")) {
            const pattern = decodeURIComponent(v.slice(6)).toLowerCase();
            const re = new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
            if (!re.test(row.email_normalised)) return false;
        }
    }
    if (f.status && f.status.startsWith("eq.") && row.status !== f.status.slice(3)) return false;
    if (f.source && f.source.startsWith("eq.") && row.source !== f.source.slice(3)) return false;
    return true;
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const path = url.pathname;

    // ---- test controls
    if (path === "/__state") return send(res, 200, { subscribers: state.subscribers, events: state.events, mails: state.mails, otps: state.otps, sessions: Object.values(state.sessions).map((s) => ({ id: s.id, user: s.user.email })), log: state.log });
    if (path === "/__reset") {
        state.subscribers = []; state.events = []; state.mails = []; state.counters = {}; state.otps = {}; state.sessions = {}; state.byAccess = {}; state.byRefresh = {}; state.outage = false; state.mailFail = false; state.log = [];
        return send(res, 200, { ok: true });
    }
    if (path === "/__mailfail") { state.mailFail = url.searchParams.get("on") === "1"; return send(res, 200, { mailFail: state.mailFail }); }
    if (path === "/__outage") { state.outage = url.searchParams.get("on") === "1"; return send(res, 200, { outage: state.outage }); }
    if (path === "/__expire-access") { for (const s of Object.values(state.sessions)) s.expired = true; return send(res, 200, { ok: true }); }
    if (path === "/__otp") { // the equivalent of the local development tool: a fresh real code for an existing user
        const email = url.searchParams.get("email");
        if (!state.users[email]) return send(res, 404, {});
        state.otps[email] = String(200000 + ++seq);
        return send(res, 200, { otp: state.otps[email] });
    }
    if (path === "/__mail" && req.method === "POST") { if (state.mailFail) return send(res, 422, { message: "mock: the provider rejected this message" }); const body = await readBody(req); state.mails.push(body); return send(res, 200, { id: "mail-" + state.mails.length }); }
    if (path === "/__seed" && req.method === "POST") {
        const rows = (await readBody(req)).rows || [];
        for (const r of rows) state.subscribers.push({ id: uid(), email_normalised: r.email.toLowerCase(), created_at: new Date(Date.now() - state.subscribers.length * 1000).toISOString(), updated_at: new Date().toISOString(), status: "pending", source: "footer", consent_text_version: "v1-2026-11", consent_given_at: new Date().toISOString(), ...r });
        return send(res, 200, { count: state.subscribers.length });
    }

    // ---- Auth
    if (path.startsWith("/auth/v1/")) {
        if (state.outage) return send(res, 503, { msg: "unavailable" });
        const body = req.method === "POST" ? await readBody(req) : {};
        if (path === "/auth/v1/admin/users" && req.method === "GET") return send(res, 200, { users: Object.values(state.users) });
        if (path === "/auth/v1/admin/generate_link" && req.method === "POST") {
            const user = state.users[(body.email || "").toLowerCase()];
            if (!user) return send(res, 404, {});
            state.otps[user.email] = String(200000 + ++seq); // a real-format code, nothing is emailed
            return send(res, 200, { email_otp: state.otps[user.email] });
        }
        if (path === "/auth/v1/otp") {
            const user = state.users[(body.email || "").toLowerCase()];
            if (!user) return send(res, 422, { msg: "Signups not allowed for otp" });
            state.otps[user.email] = "111111"; // a code that would be emailed
            state.log.push("otp_requested");
            return send(res, 200, {});
        }
        if (path === "/auth/v1/verify") {
            const email = (body.email || "").toLowerCase();
            const user = state.users[email];
            if (!user || body.type !== "email" || state.otps[email] !== body.token) return send(res, 403, { error_code: "otp_expired", msg: "Token has expired or is invalid" });
            delete state.otps[email]; // one use
            return send(res, 200, tokens(newSession(user)));
        }
        if (path === "/auth/v1/user") {
            const session = state.byAccess[bearer(req)];
            if (!session) return send(res, 401, { msg: "invalid JWT" });
            if (!state.sessions[session.id]) return send(res, 403, { error_code: "session_not_found" });
            if (session.expired) return send(res, 401, { msg: "token is expired" });
            return send(res, 200, session.user);
        }
        if (path === "/auth/v1/token") {
            const session = state.byRefresh[body.refresh_token];
            if (!session || !state.sessions[session.id]) return send(res, 400, { error_code: "refresh_token_not_found" });
            if (session.refresh !== body.refresh_token) return send(res, 400, { error_code: "refresh_token_already_used" });
            session.usedRefresh.add(session.refresh);
            delete state.byAccess[session.access];
            session.access = `at-${++n}`; session.refresh = `rt-${++n}`; session.expired = false;
            state.byAccess[session.access] = session; state.byRefresh[session.refresh] = session;
            return send(res, 200, tokens(session));
        }
        if (path === "/auth/v1/logout") {
            const session = state.byAccess[bearer(req)];
            if (!session || !state.sessions[session.id]) return send(res, 403, { error_code: "session_not_found" });
            if (session.expired) return send(res, 401, { msg: "token is expired" });
            delete state.sessions[session.id]; // refresh tokens die with the session
            return send(res, 204);
        }
        return send(res, 404, {});
    }

    // ---- PostgREST
    if (path.startsWith("/rest/v1/")) {
        if (state.outage && path.includes("newsletter_subscribers")) return send(res, 503, {});
        const table = path.replace("/rest/v1/", "");
        const f = parseFilters(url);
        const prefer = req.headers.prefer || "";
        if (table === "rpc/rate_limit_hit") {
            const body = await readBody(req);
            const c = (state.counters[body.p_key] = (state.counters[body.p_key] || 0) + 1);
            return send(res, 200, { allowed: c <= body.p_limit, retry_after: 60 });
        }
        if (table === "newsletter_events") {
            const body = await readBody(req);
            state.events.push({ ...body, at: new Date().toISOString() });
            return send(res, 201, {});
        }
        if (table === "newsletter_subscribers") {
            if (req.method === "GET") {
                let rows = state.subscribers.filter((r) => matchRow(r, f)).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
                const total = rows.length;
                const offset = Number(f.offset || 0);
                const limit = Number(f.limit || 1000);
                rows = rows.slice(offset, offset + limit);
                const headers = prefer.includes("count=exact") ? { "Content-Range": `${rows.length ? offset : "*"}${rows.length ? "-" + (offset + rows.length - 1) : ""}/${total}` } : {};
                return send(res, 200, rows, headers);
            }
            if (req.method === "POST") {
                const body = await readBody(req);
                if (state.subscribers.some((r) => r.email_normalised === body.email.trim().toLowerCase())) return send(res, 409, { code: "23505", message: "duplicate key value" });
                const now = new Date().toISOString();
                const row = { id: uid(), email_normalised: body.email.trim().toLowerCase(), created_at: now, updated_at: now, confirmed_at: null, unsubscribed_at: null, last_confirmation_sent_at: null, ...body };
                state.subscribers.push(row);
                return send(res, 201, [row]);
            }
            if (req.method === "PATCH") {
                const body = await readBody(req);
                const hit = state.subscribers.filter((r) => matchRow(r, f));
                for (const r of hit) Object.assign(r, body, { updated_at: new Date().toISOString() });
                return send(res, 200, hit);
            }
            if (req.method === "DELETE") {
                const hit = state.subscribers.filter((r) => matchRow(r, f));
                state.subscribers = state.subscribers.filter((r) => !hit.includes(r));
                return send(res, 200, hit);
            }
        }
        return send(res, 404, {});
    }
    send(res, 404, {});
});
server.listen(PORT, "127.0.0.1", () => console.log("mock supabase on", PORT));
