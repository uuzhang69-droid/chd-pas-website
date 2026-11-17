import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { DevOtpError, assertLocalOnly, describeResult, generateAdminOtp } from "./dev-admin-otp.mts";

type Call = { url: string; method: string; headers: Record<string, string>; body?: string };

/** Fake Supabase. Nothing here touches the network. */
function fakeSupabase(users: Array<{ email: string; email_confirmed_at: string | null }>, otp = "482913") {
    const calls: Call[] = [];
    const fetchImpl = (async (url: string, init: RequestInit = {}) => {
        const call: Call = {
            url: String(url),
            method: String(init.method ?? "GET"),
            headers: (init.headers ?? {}) as Record<string, string>,
            body: init.body ? String(init.body) : undefined,
        };
        calls.push(call);
        if (call.url.includes("/auth/v1/admin/users")) return new Response(JSON.stringify({ users }), { status: 200 });
        if (call.url.endsWith("/auth/v1/admin/generate_link"))
            return new Response(JSON.stringify({ action_link: "https://x/verify?token=SECRET-LINK", email_otp: otp, hashed_token: "HASH", verification_type: "magiclink" }), { status: 200 });
        return new Response("{}", { status: 201 });
    }) as unknown as typeof fetch;
    return { calls, fetchImpl };
}

async function withEnv<T>(values: Record<string, string | undefined>, fn: () => Promise<T>): Promise<T> {
    const saved = { ...process.env };
    for (const [key, value] of Object.entries(values)) {
        if (value === undefined) delete (process.env as Record<string, string | undefined>)[key];
        else (process.env as Record<string, string | undefined>)[key] = value;
    }
    try {
        return await fn();
    } finally {
        process.env = saved;
    }
}

const local = {
    NODE_ENV: "development",
    VERCEL: undefined,
    VERCEL_ENV: undefined,
    CI: undefined,
    NETLIFY: undefined,
    SUPABASE_URL: "https://project.example.test",
    SUPABASE_SERVICE_ROLE_KEY: "eyJ.service.jwt",
    NEWSLETTER_ADMIN_EMAILS: "owner@example.test",
};
const owner = { email: "Owner@Example.test", email_confirmed_at: "2026-01-01T00:00:00Z" };

test("it refuses to run on production or on a hosting platform", async () => {
    for (const env of [{ NODE_ENV: "production" }, { VERCEL: "1" }, { VERCEL_ENV: "production" }, { VERCEL_ENV: "preview" }, { CI: "true" }, { NETLIFY: "true" }])
        assert.throws(() => assertLocalOnly(env), DevOtpError, JSON.stringify(env));
    assert.doesNotThrow(() => assertLocalOnly({ NODE_ENV: "development" }));
    assert.doesNotThrow(() => assertLocalOnly({}));
    const fake = fakeSupabase([owner]);
    await withEnv(local, async () => {
        for (const env of [{ NODE_ENV: "production" }, { VERCEL_ENV: "production" }])
            await assert.rejects(generateAdminOtp({ email: "owner@example.test", env, fetchImpl: fake.fetchImpl }), /Refused/);
    });
    assert.equal(fake.calls.length, 0, "no request is made when the environment is not local");
});

test("it gives a real code from Supabase for an existing, confirmed, allow-listed administrator, and nothing else", async () => {
    const fake = fakeSupabase([{ email: "someone@example.test", email_confirmed_at: "x" }, owner]);
    await withEnv(local, async () => {
        const result = await generateAdminOtp({ email: "  OWNER@example.TEST ", env: { NODE_ENV: "development" }, fetchImpl: fake.fetchImpl });
        assert.deepEqual(result, { email: "owner@example.test", otp: "482913" });
    });
    const generate = fake.calls.find((call) => call.url.endsWith("/auth/v1/admin/generate_link"))!;
    assert.equal(generate.method, "POST");
    assert.deepEqual(JSON.parse(String(generate.body)), { type: "magiclink", email: "owner@example.test" });
    // The user is looked up first, so generate_link can never create an account.
    assert.ok(fake.calls.findIndex((call) => call.url.includes("/admin/users")) < fake.calls.indexOf(generate));
    // The audit row names the address and never the code.
    const audit = fake.calls.find((call) => call.url.endsWith("/rest/v1/newsletter_events"))!;
    assert.match(String(audit.body), /dev_otp_generated/);
    assert.ok(!String(audit.body).includes("482913"));
});

test("it refuses anyone who is not allow-listed, does not exist, or is not confirmed, without creating anything", async () => {
    const cases: Array<[string, Array<{ email: string; email_confirmed_at: string | null }>, RegExp]> = [
        ["stranger@example.test", [owner], /not in NEWSLETTER_ADMIN_EMAILS/],
        ["owner@example.test", [], /no such user/],
        ["owner@example.test", [{ email: "owner@example.test", email_confirmed_at: null }], /not confirmed/],
    ];
    for (const [email, users, message] of cases) {
        const fake = fakeSupabase(users);
        await withEnv({ ...local, NEWSLETTER_ADMIN_EMAILS: "owner@example.test" }, async () => {
            await assert.rejects(generateAdminOtp({ email, env: { NODE_ENV: "development" }, fetchImpl: fake.fetchImpl }), message);
        });
        assert.ok(!fake.calls.some((call) => call.url.includes("generate_link")), `${email}: generate_link must not be called`);
    }
    // Missing settings: a clear message, no request.
    const fake = fakeSupabase([owner]);
    await withEnv({ ...local, SUPABASE_SERVICE_ROLE_KEY: undefined, SUPABASE_SECRET_KEY: undefined }, async () => {
        await assert.rejects(generateAdminOtp({ email: "owner@example.test", env: { NODE_ENV: "development" }, fetchImpl: fake.fetchImpl }), /must be set/);
    });
    assert.equal(fake.calls.length, 0);
});

test("a code that is not numeric, or a Supabase failure, is never turned into something usable", async () => {
    await withEnv(local, async () => {
        const bad = fakeSupabase([owner], "not-a-code");
        await assert.rejects(generateAdminOtp({ email: "owner@example.test", env: { NODE_ENV: "development" }, fetchImpl: bad.fetchImpl }), /numeric code/);
        const failing = (async (url: string) =>
            String(url).includes("generate_link") ? new Response("{}", { status: 500 }) : new Response(JSON.stringify({ users: [owner] }), { status: 200 })) as unknown as typeof fetch;
        await assert.rejects(generateAdminOtp({ email: "owner@example.test", env: { NODE_ENV: "development" }, fetchImpl: failing }), /could not generate/);
    });
});

test("the service key goes only to Supabase's server, in the right header for each key type, and is never printed", async () => {
    for (const [key, expectBearer] of [["eyJ.legacy.service.jwt", true], ["sb_secret_example", false]] as const) {
        const fake = fakeSupabase([owner]);
        await withEnv({ ...local, SUPABASE_SERVICE_ROLE_KEY: key }, async () => {
            const result = await generateAdminOtp({ email: "owner@example.test", env: { NODE_ENV: "development" }, fetchImpl: fake.fetchImpl });
            const printed = describeResult(result);
            assert.ok(!printed.includes(key), "the key is not printed");
            assert.ok(printed.includes(result.otp));
            for (const call of fake.calls.filter((entry) => entry.url.startsWith("https://project.example.test"))) {
                assert.equal(call.headers.apikey, key);
                assert.equal(call.headers.Authorization, expectBearer ? `Bearer ${key}` : undefined);
            }
        });
    }
});

test("it is only a command: no website code can reach it, and no endpoint can return a code", () => {
    const walk = (dir: string): string[] =>
        readdirSync(dir).flatMap((name) => {
            const path = join(dir, name);
            return statSync(path).isDirectory() ? walk(path) : /\.(ts|tsx|mts)$/.test(name) ? [path] : [];
        });
    for (const file of walk("src")) {
        const source = readFileSync(file, "utf8");
        assert.ok(!source.includes("dev-admin-otp"), `${file} imports the development tool`);
        assert.ok(!/generate_link|generateLink|email_otp/.test(source), `${file} touches generate_link or an OTP`);
    }
    // No Next.js route file exists for it, and nothing in the config exposes it.
    assert.ok(!readFileSync("next.config.ts", "utf8").includes("dev-admin-otp"));
    const script = readFileSync("scripts/dev-admin-otp.mts", "utf8");
    assert.ok(script.includes("assertLocalOnly(env)"));
    assert.ok(!/Response\.json|new Response\(|export (async )?function (GET|POST)/.test(script), "it is not an HTTP handler");
    // The sign-in itself is untouched: it still checks the allow-list and uses the normal verify call.
    const auth = readFileSync("src/lib/admin/auth.ts", "utf8");
    assert.ok(auth.includes('type: "email"') && auth.includes("create_user: false"));
});
