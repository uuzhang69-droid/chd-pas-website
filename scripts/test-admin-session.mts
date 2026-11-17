import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { POST as requestRoute } from "../src/app/api/admin/auth/request/route";
import { POST as verifyRoute } from "../src/app/api/admin/auth/verify/route";
import { GET as refreshRoute } from "../src/app/api/admin/auth/refresh/route";
import { POST as logoutRoute } from "../src/app/api/admin/auth/logout/route";
import { GET as exportRoute } from "../src/app/api/admin/newsletter/export/route";
import { POST as actionRoute } from "../src/app/api/admin/newsletter/subscribers/[id]/route";
import { POST as subscribeRoute } from "../src/app/api/newsletter/subscribe/route";
import nextConfig from "../next.config";
import {
    lookupAdmin,
    refreshSession,
    revokeAdminSession,
    type AuthConfig,
} from "../src/lib/admin/auth";
import {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    checkAdmin,
    clearedCookies,
    sessionCookies,
} from "../src/lib/admin/session";
import { isNewsletterSignupLive } from "../src/lib/features";
import { subscribersToCsv } from "../src/lib/newsletter/csv";
import type { Subscriber } from "../src/lib/newsletter/store";

const SITE = "https://site.test";
const config: AuthConfig = { url: "https://project.example.test", anonKey: "ANON" };
const OWNER = "owner@example.test";

type Call = { url: string; method: string; headers: Record<string, string>; body?: string };
type Reply = { status: number; json?: unknown } | "throw";

/** Runs `fn` with Supabase settings in the environment and every network call answered by `handler`. */
async function withSupabase<T>(
    handler: (call: Call) => Reply,
    fn: (calls: Call[]) => Promise<T>,
    admins = OWNER,
): Promise<T> {
    const saved = { ...process.env };
    const realFetch = globalThis.fetch;
    const env = process.env as Record<string, string | undefined>;
    const calls: Call[] = [];
    env.SUPABASE_URL = config.url;
    env.SUPABASE_ANON_KEY = "ANON";
    env.SUPABASE_SERVICE_ROLE_KEY = "SERVICE";
    env.NEWSLETTER_ADMIN_EMAILS = admins;
    globalThis.fetch = (async (url: string, init: RequestInit = {}) => {
        const call: Call = {
            url: String(url),
            method: String(init.method ?? "GET"),
            headers: (init.headers ?? {}) as Record<string, string>,
            body: init.body ? String(init.body) : undefined,
        };
        calls.push(call);
        // The shared rate limiter talks to Supabase too: always allow in these tests.
        if (call.url.includes("/rpc/rate_limit_hit"))
            return new Response(JSON.stringify({ allowed: true, retry_after: 1 }), { status: 200 });
        const reply = handler(call);
        if (reply === "throw") throw new Error("network down");
        // A 204 answer has no body.
        return new Response(reply.status === 204 ? null : JSON.stringify(reply.json ?? {}), { status: reply.status });
    }) as typeof fetch;
    try {
        return await fn(calls);
    } finally {
        globalThis.fetch = realFetch;
        process.env = saved;
    }
}

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    new Request(`${SITE}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: SITE, host: "site.test", ...headers },
        body: JSON.stringify(body),
    });
const cookieHeader = (access?: string, refresh?: string) =>
    [access ? `${ACCESS_COOKIE}=${access}` : "", refresh ? `${REFRESH_COOKIE}=${refresh}` : ""]
        .filter(Boolean)
        .join("; ");
const logged = async (fn: () => Promise<void>) => {
    const original = console.error;
    const lines: unknown[][] = [];
    console.error = (...args: unknown[]) => void lines.push(args);
    try {
        await fn();
    } finally {
        console.error = original;
    }
    return JSON.stringify(lines);
};

test("OTP sign-in: an allow-listed address gets a session; case and spaces do not matter; tokens never reach the browser", async () => {
    await withSupabase(
        (call) => {
            if (call.url.endsWith("/auth/v1/verify"))
                return { status: 200, json: { access_token: "AT-secret", refresh_token: "RT-secret", expires_in: 3600, user: { email: "Owner@Example.test" } } };
            return { status: 200, json: {} };
        },
        async (calls) => {
            const response = await verifyRoute(post("/api/admin/auth/verify", { email: "  OWNER@example.TEST ", code: "123456" }));
            assert.equal(response.status, 200);
            const body = await response.text();
            assert.equal(body, JSON.stringify({ ok: true }));
            assert.ok(!body.includes("AT-secret") && !body.includes("RT-secret"));
            const cookies = response.headers.getSetCookie();
            assert.equal(cookies.length, 2);
            for (const cookie of cookies) {
                assert.match(cookie, /HttpOnly/);
                assert.match(cookie, /SameSite=Strict/);
                assert.match(cookie, /Path=\//);
            }
            // The sign-in is written to the audit trail by address only, never with a token.
            const audit = calls.find((call) => call.url.includes("newsletter_events"));
            assert.ok(audit, "audit event");
            assert.match(String(audit!.body), /admin_login/);
            assert.ok(!String(audit!.body).includes("secret"));
        },
    );
});

test("OTP sign-in: an address that is not allow-listed is refused, even if Supabase would accept it", async () => {
    await withSupabase(
        (call) =>
            call.url.endsWith("/auth/v1/verify")
                ? { status: 200, json: { access_token: "A", refresh_token: "R", expires_in: 3600, user: { email: "intruder@example.test" } } }
                : { status: 200 },
        async (calls) => {
            const response = await verifyRoute(post("/api/admin/auth/verify", { email: "intruder@example.test", code: "123456" }));
            assert.equal(response.status, 401);
            assert.equal(response.headers.getSetCookie().length, 0);
            assert.ok(!calls.some((call) => call.url.endsWith("/auth/v1/verify")), "Supabase is not even asked");
            // Supabase accepts a code but reports another user than the one typed: still refused.
            const mismatch = await verifyRoute(post("/api/admin/auth/verify", { email: OWNER, code: "123456" }));
            assert.equal(mismatch.status, 401);
        },
    );
});

test("asking for a code: the answer is identical for administrators, strangers and a Supabase outage, and logs no address", async () => {
    let outage = false;
    const answers: string[] = [];
    let log = "";
    await withSupabase(
        () => (outage ? { status: 503 } : { status: 200 }),
        async (calls) => {
            for (const email of [OWNER, "stranger@example.test"]) {
                const response = await requestRoute(post("/api/admin/auth/request", { email }));
                answers.push(`${response.status} ${await response.text()}`);
            }
            outage = true;
            log = await logged(async () => {
                const response = await requestRoute(post("/api/admin/auth/request", { email: OWNER }));
                answers.push(`${response.status} ${await response.text()}`);
            });
            assert.equal(calls.filter((call) => call.url.endsWith("/auth/v1/otp")).length, 2, "strangers never reach Supabase");
        },
    );
    assert.equal(new Set(answers).size, 1, JSON.stringify(answers));
    assert.match(log, /admin_code_request_failed/);
    assert.ok(!log.includes("example.test"), "no address in the log");
});

test("sessions: invalid, unconfirmed and signed-out tokens are refused; an outage is reported separately", async () => {
    const reply = (status: number, json: unknown = {}) => (async () => new Response(JSON.stringify(json), { status })) as unknown as typeof fetch;
    const ok = { email: OWNER, email_confirmed_at: "2026-01-01" };
    assert.deepEqual(await lookupAdmin(config, "t", [OWNER], reply(200, ok)), { kind: "admin", email: OWNER });
    assert.deepEqual(await lookupAdmin(config, "t", [OWNER], reply(200, { ...ok, email: "OWNER@Example.Test" })), { kind: "admin", email: OWNER });
    for (const [label, fetcher] of [
        ["expired", reply(401, { msg: "invalid JWT" })],
        ["session revoked", reply(403, { error_code: "session_not_found" })],
        ["unconfirmed", reply(200, { email: OWNER, email_confirmed_at: null })],
        ["not allow-listed", reply(200, { email: "x@example.test", email_confirmed_at: "y" })],
    ] as const)
        assert.deepEqual(await lookupAdmin(config, "t", [OWNER], fetcher), { kind: "invalid" }, label);
    assert.deepEqual(await lookupAdmin(config, undefined, [OWNER], reply(200, ok)), { kind: "invalid" });
    for (const fetcher of [reply(500), reply(503), reply(429), (async () => { throw new Error("offline"); }) as unknown as typeof fetch])
        assert.deepEqual(await lookupAdmin(config, "t", [OWNER], fetcher), { kind: "unavailable" });
    // The page and APIs treat an outage as "refuse, but keep the session", not as "signed out".
    await withSupabase(() => ({ status: 503 }), async () => {
        assert.deepEqual(await checkAdmin(cookieHeader("t", "r")), { ok: false, reason: "unavailable" });
    });
    await withSupabase(() => ({ status: 401 }), async () => {
        assert.deepEqual(await checkAdmin(cookieHeader("t", "r")), { ok: false, reason: "needs_refresh" });
        assert.deepEqual(await checkAdmin(cookieHeader("t")), { ok: false, reason: "signed_out" });
    });
});

test("refresh rotation: the new tokens replace both cookies; an old or revoked token, and an outage, are told apart", async () => {
    const issued: string[] = [];
    await withSupabase(
        (call) => {
            const used = JSON.parse(String(call.body)).refresh_token as string;
            if (used === "RT-1") {
                issued.push("RT-2");
                return { status: 200, json: { access_token: "AT-2", refresh_token: "RT-2", expires_in: 3600, user: { email: OWNER } } };
            }
            if (used === "RT-down") return { status: 503 };
            return { status: 400, json: { error_code: "refresh_token_already_used" } };
        },
        async () => {
            const fresh = await refreshRoute(new Request(`${SITE}/api/admin/auth/refresh`, { headers: { cookie: cookieHeader("old", "RT-1") } }));
            assert.equal(fresh.status, 303);
            assert.equal(fresh.headers.get("location"), `${SITE}/admin/newsletter`);
            const set = fresh.headers.getSetCookie().join("\n");
            assert.match(set, /chdc_admin_at=AT-2/);
            assert.match(set, /chdc_admin_rt=RT-2/);
            assert.equal(fresh.headers.get("cache-control"), "no-store");

            // The same, already used refresh token a second time (a stolen or replayed copy): refused and cleared.
            const replay = await refreshRoute(new Request(`${SITE}/api/admin/auth/refresh`, { headers: { cookie: cookieHeader("old", "RT-1-used") } }));
            assert.equal(replay.headers.get("location"), `${SITE}/admin/login`);
            assert.ok(replay.headers.getSetCookie().every((cookie) => /Max-Age=0/.test(cookie)));

            // Supabase down: nobody is signed out, and the cookies are left alone.
            const down = await refreshRoute(new Request(`${SITE}/api/admin/auth/refresh`, { headers: { cookie: cookieHeader("old", "RT-down") } }));
            assert.equal(down.headers.get("location"), `${SITE}/admin/login?notice=unavailable`);
            assert.equal(down.headers.getSetCookie().length, 0);

            // An administrator who was removed from the allow-list cannot refresh.
            const none = await refreshSession(config, "RT-1", ["someone-else@example.test"], (async () =>
                new Response(JSON.stringify({ access_token: "a", refresh_token: "b", expires_in: 1, user: { email: OWNER } }), { status: 200 })) as unknown as typeof fetch);
            assert.deepEqual(none, { kind: "invalid" });
        },
    );
    assert.deepEqual(issued, ["RT-2"]);
});

test("logout ends the session at Supabase, clears the cookies, and never returns a token", async () => {
    await withSupabase(
        (call) => {
            if (call.url.includes("/auth/v1/user")) return { status: 200, json: { email: OWNER, email_confirmed_at: "x" } };
            return { status: 204 };
        },
        async (calls) => {
            const response = await logoutRoute(post("/api/admin/auth/logout", {}, { cookie: cookieHeader("AT-live", "RT-live") }));
            assert.equal(response.status, 200);
            const body = (await response.json()) as Record<string, unknown>;
            assert.deepEqual(body, { ok: true, revoked: true });
            assert.ok(response.headers.getSetCookie().every((cookie) => /Max-Age=0/.test(cookie) && /HttpOnly/.test(cookie) && /SameSite=Strict/.test(cookie)));
            const out = calls.find((call) => call.url.includes("/auth/v1/logout"));
            assert.ok(out, "Supabase logout is called");
            assert.match(out!.url, /scope=local/);
            assert.equal(out!.method, "POST");
            assert.equal(out!.headers.Authorization, "Bearer AT-live");
            assert.equal(out!.headers.apikey, "ANON");
            // Neither the service key nor a token is ever sent to the browser.
            assert.ok(!JSON.stringify(body).includes("SERVICE") && !JSON.stringify(body).includes("AT-live"));
            const audit = calls.find((call) => call.url.includes("newsletter_events"));
            assert.match(String(audit?.body), /admin_logout/);
        },
    );
});

test("logout with an expired access token: the refresh token is used to reach Supabase's logout", async () => {
    await withSupabase(
        (call) => {
            if (call.url.includes("/auth/v1/user")) return { status: 401 };
            if (call.url.includes("/auth/v1/logout")) return call.headers.Authorization === "Bearer AT-fresh" ? { status: 204 } : { status: 401 };
            if (call.url.includes("grant_type=refresh_token")) return { status: 200, json: { access_token: "AT-fresh", refresh_token: "RT-next", expires_in: 3600, user: { email: OWNER } } };
            return { status: 200 };
        },
        async (calls) => {
            const response = await logoutRoute(post("/api/admin/auth/logout", {}, { cookie: cookieHeader("AT-expired", "RT-live") }));
            assert.deepEqual(await response.json(), { ok: true, revoked: true });
            assert.equal(calls.filter((call) => call.url.includes("/auth/v1/logout")).length, 2);
        },
    );
    // A refresh token that Supabase no longer accepts means the session cannot be restored: reported as such.
    const result = await revokeAdminSession(config, "AT-expired", "RT-gone", (async (url: string) =>
        new Response("{}", { status: String(url).includes("grant_type") ? 400 : 401 })) as unknown as typeof fetch);
    assert.deepEqual(result, { revoked: true, how: "already_invalid" });
});

test("logout during a Supabase outage still clears the cookies and says honestly that revocation is not confirmed", async () => {
    for (const outage of ["throw", { status: 503 }] as const) {
        const text = await logged(async () => {
            await withSupabase(
                () => outage,
                async () => {
                    const response = await logoutRoute(post("/api/admin/auth/logout", {}, { cookie: cookieHeader("AT", "RT") }));
                    assert.equal(response.status, 200);
                    const body = (await response.json()) as { revoked: boolean; reason?: string };
                    assert.equal(body.revoked, false);
                    assert.equal(body.reason, "unavailable");
                    assert.equal(response.headers.getSetCookie().length, 2);
                    assert.ok(response.headers.getSetCookie().every((cookie) => /Max-Age=0/.test(cookie)));
                },
            );
        });
        assert.match(text, /admin_logout_not_revoked/);
        assert.ok(!text.includes('"AT"') && !text.includes('"RT"') && !text.includes("Bearer"), "no token in the log");
    }
    // Nothing to revoke: no Supabase call at all.
    await withSupabase(() => ({ status: 204 }), async (calls) => {
        const response = await logoutRoute(post("/api/admin/auth/logout", {}));
        assert.deepEqual(await response.json(), { ok: true, revoked: false, reason: "no_session" });
        assert.equal(calls.filter((call) => call.url.includes("/auth/v1")).length, 0);
    });
});

test("logout is a state-changing request: a request from another site is refused and changes nothing", async () => {
    await withSupabase(() => ({ status: 204 }), async (calls) => {
        const response = await logoutRoute(post("/api/admin/auth/logout", {}, { origin: "https://evil.test", cookie: cookieHeader("AT", "RT") }));
        assert.equal(response.status, 403);
        assert.equal(response.headers.getSetCookie().length, 0);
        assert.equal(calls.filter((call) => call.url.includes("/auth/v1")).length, 0);
        const missing = await logoutRoute(new Request(`${SITE}/api/admin/auth/logout`, { method: "POST", headers: { host: "site.test" } }));
        assert.equal(missing.status, 403);
    });
});

test("unauthenticated and unauthorised access to admin data is refused, and Supabase outages never open the door", async () => {
    const dataCalls = (calls: Call[]) => calls.filter((call) => call.url.includes("/rest/v1/newsletter_subscribers"));
    await withSupabase(
        (call) => (call.url.includes("/auth/v1/user") ? { status: 200, json: { email: "intruder@example.test", email_confirmed_at: "x" } } : { status: 200, json: [] }),
        async (calls) => {
            const none = await exportRoute(new Request(`${SITE}/api/admin/newsletter/export`));
            assert.equal(none.status, 401);
            const wrongUser = await exportRoute(new Request(`${SITE}/api/admin/newsletter/export`, { headers: { cookie: cookieHeader("AT") } }));
            assert.equal(wrongUser.status, 401);
            const action = await actionRoute(post("/api/admin/newsletter/subscribers/00000000-0000-0000-0000-000000000000", { action: "delete" }, { cookie: cookieHeader("AT") }), {
                params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }),
            });
            assert.equal(action.status, 401);
            assert.equal(dataCalls(calls).length, 0, "no subscriber data was read or changed");
        },
    );
    await withSupabase(() => "throw", async (calls) => {
        const exported = await exportRoute(new Request(`${SITE}/api/admin/newsletter/export`, { headers: { cookie: cookieHeader("AT", "RT") } }));
        assert.equal(exported.status, 503);
        assert.ok(!(await exported.text()).includes("@"));
        assert.equal(dataCalls(calls).length, 0);
    });
});

test("state-changing admin actions need the same origin even for a signed-in administrator", async () => {
    const id = "11111111-1111-1111-1111-111111111111";
    await withSupabase(
        (call) => (call.url.includes("/auth/v1/user") ? { status: 200, json: { email: OWNER, email_confirmed_at: "x" } } : { status: 200, json: [] }),
        async (calls) => {
            const cross = await actionRoute(post(`/api/admin/newsletter/subscribers/${id}`, { action: "delete" }, { origin: "https://evil.test", cookie: cookieHeader("AT") }), { params: Promise.resolve({ id }) });
            assert.equal(cross.status, 403);
            assert.equal(calls.filter((call) => call.method === "DELETE").length, 0);
            const bad = await actionRoute(post(`/api/admin/newsletter/subscribers/not-an-id`, { action: "delete" }, { cookie: cookieHeader("AT") }), { params: Promise.resolve({ id: "not-an-id" }) });
            assert.equal(bad.status, 400);
            const unknown = await actionRoute(post(`/api/admin/newsletter/subscribers/${id}`, { action: "everything" }, { cookie: cookieHeader("AT") }), { params: Promise.resolve({ id }) });
            assert.equal(unknown.status, 400);
        },
    );
});

test("CSV export neutralises formulas in every cell, including addresses", () => {
    const base: Subscriber = {
        id: "1", email: "a@example.test", status: "active", source: "footer", sourcePath: "/x",
        consentTextVersion: "v1", consentGivenAt: "2026-11-01T00:00:00Z", createdAt: "2026-11-01T00:00:00Z", updatedAt: "2026-11-01T00:00:00Z",
    };
    const risky = ["=HYPERLINK(\"http://evil\")", "+1+1", "-2+3", "@SUM(A1)", "\t=1", "\r=1", "=1,2"];
    const csv = subscribersToCsv(risky.map((email, index) => ({ ...base, id: String(index), email })));
    const lines = csv.replace(/^﻿/, "").split("\r\n").slice(1).filter(Boolean);
    assert.equal(lines.length, risky.length);
    for (const line of lines) {
        const first = line.startsWith('"') ? line[1] : line[0];
        assert.equal(first, "'", `cell starts a formula: ${line}`);
    }
    assert.ok(!csv.includes(",id,") && !csv.includes("token"));
});

test("deleting a subscriber is confirmed in the page, names the person, and the page hands the address over", () => {
    const actions = readFileSync("src/components/admin/AdminRowActions.tsx", "utf8");
    assert.ok(actions.indexOf("window.confirm(") > 0);
    assert.ok(actions.indexOf("window.confirm(") < actions.indexOf("fetch("), "confirm before the request");
    assert.match(actions, /Delete \$\{email\} permanently/);
    assert.match(actions, /cannot be undone/);
    assert.ok(readFileSync("src/app/admin/newsletter/page.tsx", "utf8").includes("email={row.email}"));
});

test("private pages are never cached, framed or indexed, and send no referrer", async () => {
    const config = ((nextConfig as unknown as { default?: typeof nextConfig }).default ?? nextConfig) as typeof nextConfig;
    const rules = await config.headers!();
    for (const source of ["/admin/:path*", "/api/admin/:path*", "/newsletter/:path*"]) {
        const rule = rules.find((entry) => entry.source === source);
        assert.ok(rule, source);
        const value = (key: string) => rule!.headers.find((header) => header.key === key)?.value;
        assert.match(String(value("Cache-Control")), /no-store/);
        assert.equal(value("X-Frame-Options"), "DENY");
        assert.equal(value("Referrer-Policy"), "no-referrer");
        assert.match(String(value("X-Robots-Tag")), /noindex/);
    }
    // API answers are also no-store on their own.
    const refused = await exportRoute(new Request(`${SITE}/api/admin/newsletter/export`));
    assert.equal(refused.headers.get("cache-control"), "no-store");
});

test("cookies: HttpOnly, SameSite=Strict, Secure in production, cleared with the same attributes", () => {
    const env = process.env as Record<string, string | undefined>;
    const before = env.NODE_ENV;
    try {
        env.NODE_ENV = "production";
        for (const cookie of [...sessionCookies({ accessToken: "a", refreshToken: "r", expiresIn: 3600 }), ...clearedCookies()]) {
            assert.match(cookie, /HttpOnly/);
            assert.match(cookie, /SameSite=Strict/);
            assert.match(cookie, /Secure/);
            assert.match(cookie, /Path=\//);
        }
    } finally {
        env.NODE_ENV = before;
    }
});

test("the Supabase service key and every token stay on the server", () => {
    const walk = (dir: string): string[] =>
        readdirSync(dir).flatMap((name) => {
            const path = join(dir, name);
            return statSync(path).isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
        });
    for (const file of walk("src")) {
        const source = readFileSync(file, "utf8");
        if (!/^\s*["']use client["']/.test(source)) continue;
        assert.ok(!/lib\/(supabase|admin|newsletter\/(deps|service|store|supabase-store))/.test(source), `${file} imports server-only code`);
        assert.ok(!/SERVICE_ROLE|SECRET_KEY|SUPABASE_/.test(source), `${file} mentions a Supabase credential`);
    }
    // No credential is ever given a NEXT_PUBLIC_ name (the public URL and publishable/anon key are the only exceptions).
    for (const file of [".env.example", ...walk("src")]) {
        const text = readFileSync(file, "utf8");
        assert.ok(!/NEXT_PUBLIC_[A-Z_]*(SERVICE|SECRET|TOKEN_SECRET)/.test(text), file);
    }
});

test("the newsletter feature flag stays off: public sign-up is closed on the server and nothing admin depends on it", async () => {
    assert.equal(isNewsletterSignupLive({}), false);
    assert.equal(isNewsletterSignupLive({ NEWSLETTER_ONLINE_SIGNUP_LIVE: undefined }), false);
    const response = await subscribeRoute(post("/api/newsletter/subscribe", { email: "a@example.test", consent: true }));
    assert.equal(response.status, 404);
    assert.equal(((await response.json()) as { code: string }).code, "not_available");
    assert.ok(!readFileSync("src/lib/admin/session.ts", "utf8").includes("NEWSLETTER_ONLINE_SIGNUP_LIVE"));
});

test("the sign-in page shows only its own fixed notices and never echoes the address", () => {
    const page = readFileSync("src/app/admin/login/page.tsx", "utf8");
    assert.ok(page.includes("Object.hasOwn(NOTICES, notice)"), "prototype names such as constructor must not match");
    assert.ok(!page.includes("dangerouslySetInnerHTML"));
});
