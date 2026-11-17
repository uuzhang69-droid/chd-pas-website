import assert from "node:assert/strict";
import { test } from "node:test";
import {
    getAdminFromAccessToken,
    refreshAdminSession,
    requestAdminCode,
    verifyAdminCode,
    type AuthConfig,
} from "../src/lib/admin/auth";
import {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    checkAdmin,
    clearedCookies,
    parseCookies,
    sessionCookies,
} from "../src/lib/admin/session";
import { CONSENT_TEXT_VERSION } from "../src/lib/newsletter/consent";
import { subscribersToCsv } from "../src/lib/newsletter/csv";
import type { Subscriber } from "../src/lib/newsletter/store";
import { POST as requestCodeRoute } from "../src/app/api/admin/auth/request/route";
import { POST as verifyCodeRoute } from "../src/app/api/admin/auth/verify/route";
import { GET as exportRoute } from "../src/app/api/admin/newsletter/export/route";
import { POST as rowActionRoute } from "../src/app/api/admin/newsletter/subscribers/[id]/route";
import { GET as refreshRoute } from "../src/app/api/admin/auth/refresh/route";

const config: AuthConfig = {
    url: "https://project.example.test",
    anonKey: "ANON-KEY",
};
const allowed = ["owner@example.test"];

type Call = { url: string; init: RequestInit };
function gotrue(
    handler: (url: string, body: unknown) => { status: number; json?: unknown },
) {
    const calls: Call[] = [];
    const fetchMock = (async (url: string, init: RequestInit) => {
        calls.push({ url: String(url), init });
        const body = init.body ? JSON.parse(String(init.body)) : undefined;
        const { status, json } = handler(String(url), body);
        return new Response(JSON.stringify(json ?? {}), { status });
    }) as unknown as typeof fetch;
    return { calls, fetchMock };
}

test("a sign-in code is only requested for allow-listed administrators, and never creates an account", async () => {
    const { calls, fetchMock } = gotrue(() => ({ status: 200 }));
    const stranger = await requestAdminCode(
        config,
        "stranger@example.test",
        allowed,
        fetchMock,
    );
    assert.deepEqual(stranger, { requested: false, serviceOk: true });
    assert.equal(calls.length, 0);
    const owner = await requestAdminCode(
        config,
        " Owner@Example.test ",
        allowed,
        fetchMock,
    );
    assert.equal(owner.requested, true);
    assert.match(calls[0].url, /\/auth\/v1\/otp$/);
    assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
        email: "owner@example.test",
        create_user: false,
    });
    assert.equal(
        (calls[0].init.headers as Record<string, string>).apikey,
        "ANON-KEY",
    );
    const down = await requestAdminCode(
        config,
        "owner@example.test",
        allowed,
        (async () => {
            throw new Error("offline");
        }) as unknown as typeof fetch,
    );
    assert.deepEqual(down, { requested: false, serviceOk: false });
});

test("verifying a code returns a session only for an allow-listed verified address", async () => {
    const session = {
        access_token: "AT",
        refresh_token: "RT",
        expires_in: 3600,
        user: { email: "owner@example.test" },
    };
    const ok = gotrue(() => ({ status: 200, json: session }));
    assert.deepEqual(
        await verifyAdminCode(
            config,
            "owner@example.test",
            "123456",
            allowed,
            ok.fetchMock,
        ),
        { accessToken: "AT", refreshToken: "RT", expiresIn: 3600 },
    );
    assert.deepEqual(JSON.parse(String(ok.calls[0].init.body)), {
        type: "email",
        email: "owner@example.test",
        token: "123456",
    });
    // Wrong format and strangers never reach Supabase.
    assert.equal(
        await verifyAdminCode(
            config,
            "owner@example.test",
            "abc",
            allowed,
            ok.fetchMock,
        ),
        undefined,
    );
    assert.equal(
        await verifyAdminCode(
            config,
            "stranger@example.test",
            "123456",
            allowed,
            ok.fetchMock,
        ),
        undefined,
    );
    assert.equal(ok.calls.length, 1);
    // Supabase accepting a code for an address that is not allow-listed still gets nothing.
    const other = gotrue(() => ({
        status: 200,
        json: { ...session, user: { email: "intruder@example.test" } },
    }));
    assert.equal(
        await verifyAdminCode(
            config,
            "owner@example.test",
            "123456",
            allowed,
            other.fetchMock,
        ),
        undefined,
    );
    const refused = gotrue(() => ({ status: 403 }));
    assert.equal(
        await verifyAdminCode(
            config,
            "owner@example.test",
            "123456",
            allowed,
            refused.fetchMock,
        ),
        undefined,
    );
});

test("an access token is trusted only when Supabase confirms it for an allow-listed, confirmed address", async () => {
    const user = (email: string, confirmed: string | null) =>
        gotrue(() => ({
            status: 200,
            json: { email, email_confirmed_at: confirmed },
        }));
    assert.equal(
        await getAdminFromAccessToken(
            config,
            "AT",
            allowed,
            user("owner@example.test", "2026-01-01").fetchMock,
        ),
        "owner@example.test",
    );
    assert.equal(
        await getAdminFromAccessToken(
            config,
            "AT",
            allowed,
            user("other@example.test", "2026-01-01").fetchMock,
        ),
        undefined,
    );
    assert.equal(
        await getAdminFromAccessToken(
            config,
            "AT",
            allowed,
            user("owner@example.test", null).fetchMock,
        ),
        undefined,
    );
    assert.equal(
        await getAdminFromAccessToken(
            config,
            undefined,
            allowed,
            user("owner@example.test", "x").fetchMock,
        ),
        undefined,
    );
    assert.equal(
        await getAdminFromAccessToken(
            config,
            "AT",
            allowed,
            gotrue(() => ({ status: 401 })).fetchMock,
        ),
        undefined,
    );
    const sent = gotrue(() => ({
        status: 200,
        json: { email: "owner@example.test", email_confirmed_at: "x" },
    }));
    await getAdminFromAccessToken(config, "THE-TOKEN", allowed, sent.fetchMock);
    assert.equal(
        (sent.calls[0].init.headers as Record<string, string>).Authorization,
        "Bearer THE-TOKEN",
    );
    const refreshed = gotrue(() => ({
        status: 200,
        json: {
            access_token: "A2",
            refresh_token: "R2",
            expires_in: 100,
            user: { email: "owner@example.test" },
        },
    }));
    assert.deepEqual(
        await refreshAdminSession(config, "RT", allowed, refreshed.fetchMock),
        { accessToken: "A2", refreshToken: "R2", expiresIn: 100 },
    );
    assert.equal(
        await refreshAdminSession(
            config,
            undefined,
            allowed,
            refreshed.fetchMock,
        ),
        undefined,
    );
});

test("session cookies are HttpOnly and SameSite=Strict, and parse back", () => {
    const [access, refresh] = sessionCookies({
        accessToken: "a b",
        refreshToken: "r",
        expiresIn: 3600,
    });
    for (const header of [access, refresh]) {
        assert.match(header, /HttpOnly/);
        assert.match(header, /SameSite=Strict/);
        assert.match(header, /Path=\//);
    }
    const cookies = parseCookies(
        `x=1; ${access.split(";")[0]}; ${refresh.split(";")[0]}`,
    );
    assert.equal(cookies[ACCESS_COOKIE], "a b");
    assert.equal(cookies[REFRESH_COOKIE], "r");
    assert.ok(clearedCookies().every((header) => /Max-Age=0/.test(header)));
});

test("admin endpoints refuse everyone when sign-in is not configured, and never leak data", async () => {
    const saved = { ...process.env };
    const env = process.env as Record<string, string | undefined>;
    try {
        for (const key of [
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY",
            "NEWSLETTER_ADMIN_EMAILS",
        ])
            delete env[key];
        assert.deepEqual(await checkAdmin(`${ACCESS_COOKIE}=whatever`), {
            ok: false,
            reason: "not_configured",
        });
        const exported = await exportRoute(
            new Request("https://site.test/api/admin/newsletter/export", {
                headers: { cookie: `${ACCESS_COOKIE}=whatever` },
            }),
        );
        assert.equal(exported.status, 503);
        assert.equal((await exported.text()).includes("@"), false);
        const asked = await requestCodeRoute(
            new Request("https://site.test/api/admin/auth/request", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    origin: "https://site.test",
                    host: "site.test",
                },
                body: JSON.stringify({ email: "a@example.test" }),
            }),
        );
        assert.equal(asked.status, 503);
    } finally {
        process.env = saved;
    }
});

test("with sign-in configured: no cookie means 401, a non-admin means 401, and actions need the same origin", async () => {
    const saved = { ...process.env };
    const realFetch = globalThis.fetch;
    const env = process.env as Record<string, string | undefined>;
    try {
        env.SUPABASE_URL = "https://project.example.test";
        env.SUPABASE_ANON_KEY = "ANON";
        env.SUPABASE_SERVICE_ROLE_KEY = "SERVICE";
        env.NEWSLETTER_ADMIN_EMAILS = "owner@example.test";
        let userEmail = "intruder@example.test";
        const dataCalls: string[] = [];
        globalThis.fetch = (async (url: string) => {
            const target = String(url);
            if (target.includes("/auth/v1/user"))
                return new Response(
                    JSON.stringify({
                        email: userEmail,
                        email_confirmed_at: "x",
                    }),
                    { status: 200 },
                );
            dataCalls.push(target);
            return new Response("[]", {
                status: 200,
                headers: { "content-range": "*/0" },
            });
        }) as typeof fetch;

        const noCookie = await exportRoute(
            new Request("https://site.test/api/admin/newsletter/export"),
        );
        assert.equal(noCookie.status, 401);
        const intruder = await exportRoute(
            new Request("https://site.test/api/admin/newsletter/export", {
                headers: { cookie: `${ACCESS_COOKIE}=tok` },
            }),
        );
        assert.equal(intruder.status, 401);
        assert.equal(
            dataCalls.length,
            0,
            "no subscriber data may be requested for a non-admin",
        );

        const ownerHeaders = {
            cookie: `${ACCESS_COOKIE}=tok`,
            "content-type": "application/json",
            host: "site.test",
        };
        userEmail = "owner@example.test";
        const crossSite = await rowActionRoute(
            new Request("https://site.test/x", {
                method: "POST",
                headers: { ...ownerHeaders, origin: "https://evil.test" },
                body: JSON.stringify({ action: "delete" }),
            }),
            {
                params: Promise.resolve({
                    id: "11111111-1111-1111-1111-111111111111",
                }),
            },
        );
        assert.equal(crossSite.status, 403);
        const badId = await rowActionRoute(
            new Request("https://site.test/x", {
                method: "POST",
                headers: { ...ownerHeaders, origin: "https://site.test" },
                body: JSON.stringify({ action: "delete" }),
            }),
            { params: Promise.resolve({ id: "not-an-id" }) },
        );
        assert.equal(badId.status, 400);
        const badAction = await rowActionRoute(
            new Request("https://site.test/x", {
                method: "POST",
                headers: { ...ownerHeaders, origin: "https://site.test" },
                body: JSON.stringify({ action: "drop-table" }),
            }),
            {
                params: Promise.resolve({
                    id: "11111111-1111-1111-1111-111111111111",
                }),
            },
        );
        assert.equal(badAction.status, 400);

        const csv = await exportRoute(
            new Request(
                "https://site.test/api/admin/newsletter/export?status=active",
                { headers: { cookie: `${ACCESS_COOKIE}=tok` } },
            ),
        );
        assert.equal(csv.status, 200);
        assert.match(csv.headers.get("content-type") ?? "", /text\/csv/);
        assert.match(
            csv.headers.get("content-disposition") ?? "",
            /attachment; filename="newsletter-verified-recipients-\d{4}-\d{2}-\d{2}\.csv"/,
        );

        // The refresh route always lands on a fixed page, whatever it is given.
        const refresh = await refreshRoute(
            new Request(
                "https://site.test/api/admin/auth/refresh?next=https://evil.test",
                { headers: { cookie: `${REFRESH_COOKIE}=bad` } },
            ),
        );
        assert.equal(refresh.status, 303);
        assert.equal(
            refresh.headers.get("location"),
            "https://site.test/admin/login",
        );

        const verify = await verifyCodeRoute(
            new Request("https://site.test/v", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    origin: "https://evil.test",
                    host: "site.test",
                },
                body: "{}",
            }),
        );
        assert.equal(verify.status, 403);
    } finally {
        globalThis.fetch = realFetch;
        process.env = saved;
    }
});

test("CSV export neutralises formulas, quotes values, and leaves out tokens and ids", () => {
    const row = (
        email: string,
        extra: Partial<Subscriber> = {},
    ): Subscriber => ({
        id: "SECRET-ID",
        email,
        emailNormalised: email.toLowerCase(),
        status: "active",
        source: "footer",
        consentTextVersion: CONSENT_TEXT_VERSION,
        consentGivenAt: "2026-11-01T10:00:00Z",
        createdAt: "2026-11-01T10:00:00Z",
        updatedAt: "2026-11-01T10:00:00Z",
        ...extra,
    });
    const csv = subscribersToCsv([
        row("=cmd|' /C calc'!A0@example.com"),
        row("a,b@example.com", { sourcePath: '/say "hi"' }),
    ]);
    assert.ok(
        csv.startsWith("﻿email,verification,marketing_use,status,source,source_page,consent_text_version"),
    );
    assert.ok(csv.includes("'=cmd"));
    assert.ok(csv.includes('"a,b@example.com"'));
    assert.ok(csv.includes('"/say ""hi"""'));
    assert.equal(csv.includes("SECRET-ID"), false);
    assert.equal(csv.split("\r\n").length, 4);
});
