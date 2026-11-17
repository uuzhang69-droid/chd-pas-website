/* Proves the mocked E2E harness cannot reach real services. Runs in a second; needs no server. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { isNewsletterSignupLive } from "../src/lib/features";
import { E2E } from "./e2e/config.mts";

const here = path.dirname(fileURLToPath(import.meta.url));
const preload = path.join(here, "e2e", "preload.cjs");

function underPreload(code: string, extraEnv: Record<string, string> = {}) {
    const result = spawnSync(process.execPath, ["--require", preload, "-e", code], {
        env: { PATH: process.env.PATH ?? "", SystemRoot: process.env.SystemRoot ?? "", E2E_MOCK_URL: "http://127.0.0.1:9", ...extraEnv },
        encoding: "utf8",
        timeout: 20_000,
    });
    return `${result.stdout}${result.stderr}`;
}

test("fetch to a real internet host is refused", () => {
    const out = underPreload(`fetch("https://example.com/").then(()=>console.log("REACHED"),(e)=>console.log(String(e)))`);
    assert.match(out, /blocked outbound connection to example\.com/);
    assert.doesNotMatch(out, /REACHED/);
});

test("the real Supabase and Resend hosts are refused or captured, never reached", () => {
    const supabase = underPreload(`fetch("https://abcdefgh.supabase.co/rest/v1/x").then(()=>console.log("REACHED"),(e)=>console.log(String(e)))`);
    assert.match(supabase, /blocked outbound connection/);
    // Resend is answered locally: the mock mailbox on port 9 is unreachable here, so the capture step fails, but nothing leaves the machine.
    const resend = underPreload(`fetch("https://api.resend.com/emails",{method:"POST",body:"{}"}).then((r)=>console.log("STATUS",r.status),(e)=>console.log("ERR",String(e.cause&&e.cause.code||e)))`);
    assert.doesNotMatch(resend, /STATUS 4|STATUS 2.*resend/);
    assert.match(resend, /ECONNREFUSED|ERR/);
});

test("a raw socket to a public address is refused (libraries that do not use fetch)", () => {
    const out = underPreload(`const n=require("net");try{const s=n.connect(80,"93.184.216.34");s.on("error",(e)=>console.log("ERR",e.code));s.on("connect",()=>console.log("REACHED"))}catch(e){console.log(String(e))}`);
    assert.match(out, /blocked outbound connection to 93\.184\.216\.34/);
    assert.doesNotMatch(out, /REACHED/);
});

test("this computer stays reachable (so the mock services work)", () => {
    const out = underPreload(`const s=require("net").connect(9,"127.0.0.1");s.on("error",(e)=>console.log("LOCAL",e.code))`);
    assert.match(out, /LOCAL ECONNREFUSED/);
});

test("only the build may reach the font hosts, and only when asked", () => {
    const withoutAllow = underPreload(`fetch("https://fonts.googleapis.com/").then(()=>console.log("REACHED"),(e)=>console.log(String(e)))`);
    assert.match(withoutAllow, /blocked outbound connection/);
});

test("the test settings are fake and local", () => {
    const env = E2E.appEnv();
    assert.match(env.SUPABASE_URL, /^http:\/\/127\.0\.0\.1:/);
    assert.match(env.APP_BASE_URL, /^http:\/\/127\.0\.0\.1:/);
    assert.ok(env.NEWSLETTER_ADMIN_EMAILS.split(",").every((e) => e.endsWith("@example.test")));
    assert.doesNotMatch(JSON.stringify(env), /supabase\.co|re_[A-Za-z0-9]{20,}|sk_live|eyJhbGci/);
});

test("the runner hands children an explicit environment and never reads real env files", () => {
    const runner = readFileSync(path.join(here, "e2e", "run-newsletter-e2e.mts"), "utf8");
    assert.doesNotMatch(runner, /\.\.\.process\.env/);
    assert.doesNotMatch(runner, /\.env\.local|dotenv|loadEnvFile/);
    assert.match(runner, /E2E_ALLOW_HOSTS: "fonts\.googleapis\.com,fonts\.gstatic\.com"/);
    assert.match(runner, /\.\.\.baseEnv\(\)/);
});

test("public sign-up stays closed by default, and is opened only in the test copy's environment", () => {
    const features = readFileSync(path.join(here, "..", "src", "lib", "features.ts"), "utf8");
    assert.doesNotMatch(features, /NEWSLETTER_ONLINE_SIGNUP_LIVE\s*=\s*true/);
    assert.equal(isNewsletterSignupLive({}), false);
    assert.equal(E2E.appEnv().NEWSLETTER_ONLINE_SIGNUP_LIVE, "true");
});
