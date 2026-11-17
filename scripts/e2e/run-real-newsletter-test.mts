/* eslint-disable @typescript-eslint/no-explicit-any -- reads loose JSON from the local mock */
/* Controlled real-Supabase Newsletter integration test: launcher with a built-in dry run.

   Approved test address and sender are FIXED below. They cannot be changed from the command line.

       npx tsx scripts/e2e/run-real-newsletter-test.mts --dry-run                      (default; no real writes, no real e-mail)
       npx tsx scripts/e2e/run-real-newsletter-test.mts --execute --approved-live-run  (real Supabase + 2 real e-mails)
       npx tsx scripts/e2e/run-real-newsletter-test.mts --cleanup --approved-cleanup   (deletes ONLY the test row)

   A live run is refused unless a dry run succeeded for exactly this version of the test mechanism and of the
   Newsletter/Admin code. The normal NEWSLETTER_ONLINE_SIGNUP_LIVE setting stays closed: it is set to "true"
   only in the environment of a throw-away copy (.e2e-build/) that listens on 127.0.0.1 and is deleted afterwards. */
import { type ChildProcess, spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { appendFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { E2E } from "./config.mts";
import { baseEnv, copyWebsite, portFree, runNode, stopProcess, waitFor } from "./harness.mts";

const APPROVED_EMAIL = "website.countyhalldance@gmail.com";
const APPROVED_SENDER = "County Hall Dance Centre <onboarding@resend.dev>";
const MAX_MAILS = 2; // one confirmation + one welcome
const WAIT_MINUTES = 15;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const here = path.join(root, "scripts", "e2e");
const build = path.join(root, ".e2e-build");
const stateDir = path.join(root, ".real-test");
const stampFile = path.join(stateDir, "dry-run-ok.json");
const ledger = path.join(stateDir, "ledger.jsonl");
const safeguardLedger = path.join(stateDir, "ledger-safeguards.jsonl");
let currentLedger = ledger; // the dry run's safeguard tests use their own ledger so they do not use up the e-mail limit
const args = new Set(process.argv.slice(2));
const mode: "dry" | "live" = args.has("--execute") || args.has("--cleanup") ? "live" : "dry";
const cleanupOnly = args.has("--cleanup");
const children: ChildProcess[] = [];

for (const arg of args) {
    if (!["--dry-run", "--execute", "--cleanup", "--approved-live-run", "--approved-cleanup", "--keep"].includes(arg)) throw new Error(`Unknown option: ${arg}. The approved address and sender cannot be changed from the command line.`);
}
if (args.has("--execute") && args.has("--cleanup")) throw new Error("Use --execute or --cleanup, not both.");
const fwd = (p: string) => p.replace(/\\/g, "/");

// ---------------------------------------------------------------- .env.local (read here, never printed, never put in process.env)
function readEnvFile(): Record<string, string> {
    const file = path.join(root, ".env.local");
    const out: Record<string, string> = {};
    if (!existsSync(file)) return out;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
        if (!m) continue;
        out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
    return out;
}
const fileEnv = readEnvFile();
const serviceKey = fileEnv.SUPABASE_SERVICE_ROLE_KEY || fileEnv.SUPABASE_SECRET_KEY || "";
const anonKey = fileEnv.SUPABASE_ANON_KEY || fileEnv.SUPABASE_PUBLISHABLE_KEY || "";

type Finding = { ok: boolean; text: string };
function preflight(): Finding[] {
    const f: Finding[] = [];
    const add = (ok: boolean, text: string) => f.push({ ok, text });
    const from = /^(.*)<([^>]+)>\s*$/.exec(fileEnv.MAIL_FROM ?? "");
    const wanted = /^(.*)<([^>]+)>\s*$/.exec(APPROVED_SENDER);
    add(fileEnv.MAIL_PROVIDER === "resend", "MAIL_PROVIDER is resend");
    add(!!fileEnv.MAIL_API_KEY, "MAIL_API_KEY is present (value not shown)");
    add(!!from && !!wanted && from[2].toLowerCase() === wanted[2].toLowerCase(), `.env.local MAIL_FROM uses the same sending address (${wanted?.[2] ?? "?"}); the test overrides only the display name inside the throw-away copy, .env.local is not changed`);
    add((fileEnv.NEWSLETTER_ADMIN_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).includes(APPROVED_EMAIL), "the approved address is in NEWSLETTER_ADMIN_EMAILS (so Admin can be used with it)");
    add(/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(fileEnv.SUPABASE_URL ?? ""), "SUPABASE_URL is an https supabase.co project address");
    add(!!serviceKey, "a Supabase secret/service key is present (value not shown)");
    add(!!anonKey, "a Supabase publishable/anon key is present (value not shown)");
    add(!!fileEnv.NEWSLETTER_TOKEN_SECRET || true, `NEWSLETTER_TOKEN_SECRET ${fileEnv.NEWSLETTER_TOKEN_SECRET ? "is present" : "is not in .env.local: a random one is generated for this run only (links in these two e-mails work only during the run)"}`);
    add(!fileEnv.APP_BASE_URL || true, `APP_BASE_URL ${fileEnv.APP_BASE_URL ? "is in .env.local but is NOT used" : "is not in .env.local"}: the copy uses ${E2E.appUrl}, so the e-mail links open the temporary local site`);
    add(!/NEWSLETTER_ONLINE_SIGNUP_LIVE\s*=\s*true/.test(readFileSync(path.join(root, "src", "lib", "features.ts"), "utf8")) && (fileEnv.NEWSLETTER_ONLINE_SIGNUP_LIVE ?? "false").trim().toLowerCase() !== "true", "public sign-up is closed in the real source and in .env.local (the test opens it only in the throw-away copy's environment)");
    return f;
}

// ---------------------------------------------------------------- hash of exactly what is being tested
function filesUnder(dir: string): string[] {
    if (!existsSync(dir)) return [];
    return readdirSync(dir).flatMap((name) => {
        const full = path.join(dir, name);
        return statSync(full).isDirectory() ? filesUnder(full) : [full];
    });
}
function versionHash(): string {
    const files = [
        ...["real-test-preload.cjs", "real-newsletter-flow.mts", "run-real-newsletter-test.mts", "harness.mts", "config.mts", "mock-supabase.cjs"].map((n) => path.join(here, n)),
        path.join(root, "scripts", "dev-admin-otp.mts"),
        path.join(root, "src", "lib", "features.ts"),
        ...["src/lib/newsletter", "src/lib/admin", "src/lib/supabase", "src/lib/security", "src/app/api/newsletter", "src/app/api/admin", "src/app/admin", "src/app/newsletter", "src/components/admin"].flatMap((d) => filesUnder(path.join(root, d))),
        ...filesUnder(path.join(root, "src", "lib")).filter((f) => /[\\/]mail[^\\/]*$/.test(f)),
        path.join(root, "src", "components", "ui", "NewsletterSignupForm.tsx"),
    ].filter((f) => existsSync(f)).sort();
    const hash = createHash("sha256");
    hash.update(APPROVED_EMAIL + "|" + APPROVED_SENDER + "|" + MAX_MAILS);
    for (const file of files) hash.update(path.relative(root, file) + "\0" + readFileSync(file));
    return hash.digest("hex");
}

// ---------------------------------------------------------------- ledger summary
type Entry = { phase?: string; proc?: string; kind?: string; method?: string; target?: string; allowed?: boolean; reason?: string };
function readLedger(): Entry[] {
    if (!existsSync(ledger)) return [];
    return readFileSync(ledger, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l) as Entry; } catch { return {}; } });
}
function summarise(): { text: string; mails: number; writes: Record<string, number> } {
    const entries = readLedger();
    let phase = "";
    const byPhase = new Map<string, Map<string, number>>();
    const blocked: string[] = [];
    let mails = 0;
    for (const e of entries) {
        if (e.phase) { phase = e.phase; continue; }
        if (e.kind === "resend" && e.allowed) mails++;
        if (e.allowed === false) { blocked.push(`${e.method} ${e.target}: ${e.reason}`); continue; }
        if (e.kind !== "supabase" && e.kind !== "resend") continue;
        const label = e.kind === "resend" ? "RESEND  send e-mail" : `${(e.method ?? "").padEnd(6)} ${e.target}`;
        const map = byPhase.get(phase) ?? new Map<string, number>();
        map.set(label, (map.get(label) ?? 0) + 1);
        byPhase.set(phase, map);
    }
    const writes: Record<string, number> = {};
    const lines: string[] = [];
    for (const [name, map] of byPhase) {
        lines.push(`  [${name}]`);
        for (const [label, count] of [...map].sort()) {
            lines.push(`    ${String(count).padStart(3)} x ${label}`);
            if (!label.startsWith("GET")) writes[`${name}: ${label}`] = count;
        }
    }
    lines.push(`  Requests REFUSED by the gate (expected only in the gate checks): ${blocked.length}`);
    for (const b of [...new Set(blocked)]) lines.push(`    - ${b}`);
    lines.push(`  E-mails sent: ${mails}`);
    return { text: lines.join("\n"), mails, writes };
}

// ---------------------------------------------------------------- process set-up
function cleanupAll() {
    for (const child of children) stopProcess(child);
    children.length = 0;
}

function appEnv(real: boolean, allowDelete: boolean): Record<string, string> {
    const common = {
        NEWSLETTER_ADMIN_EMAILS: APPROVED_EMAIL,
        APP_BASE_URL: E2E.appUrl,
        MAIL_PROVIDER: "resend",
        MAIL_FROM: APPROVED_SENDER,
        // Cloudflare's published always-pass test keys; the gate answers Turnstile locally anyway.
        TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
        RATE_LIMIT_SALT: "real-test-salt-not-secret",
        NEXT_TELEMETRY_DISABLED: "1",
        NEWSLETTER_ONLINE_SIGNUP_LIVE: "true", // only in the throw-away copy's environment
        NEWSLETTER_DELIVERY_MODE: "double_opt_in", // the real test exercises the confirmation workflow
    };
    const live = {
        SUPABASE_URL: (fileEnv.SUPABASE_URL ?? "").replace(/\/$/, ""),
        SUPABASE_SERVICE_ROLE_KEY: serviceKey,
        SUPABASE_ANON_KEY: anonKey,
        NEWSLETTER_TOKEN_SECRET: tokenSecret,
        MAIL_API_KEY: fileEnv.MAIL_API_KEY ?? "",
    };
    const dry = {
        SUPABASE_URL: E2E.mockUrl,
        SUPABASE_SERVICE_ROLE_KEY: "eyJ.service-test",
        SUPABASE_ANON_KEY: "anon-test",
        NEWSLETTER_TOKEN_SECRET: tokenSecret,
        MAIL_API_KEY: "re_test_key_not_real",
    };
    return { ...baseEnv(), ...common, ...(real ? live : dry), ...gateEnv("app", allowDelete) };
}
const tokenSecret = randomBytes(32).toString("hex");
const supabaseForGate = () => (mode === "live" ? (fileEnv.SUPABASE_URL ?? "").replace(/\/$/, "") : E2E.mockUrl);

function gateEnv(role: "app" | "driver", allowDelete: boolean): Record<string, string> {
    return {
        RT_MODE: mode,
        RT_ROLE: role,
        RT_APPROVED_EMAIL: APPROVED_EMAIL,
        RT_APPROVED_SENDER: APPROVED_SENDER,
        RT_LEDGER: currentLedger,
        RT_SUPABASE_URL: supabaseForGate(),
        RT_MAX_MAILS: String(MAX_MAILS),
        RT_ALLOW_DELETE: allowDelete ? "1" : "0",
        E2E_MOCK_URL: E2E.mockUrl,
        NODE_OPTIONS: `--require "${fwd(path.join(here, "real-test-preload.cjs"))}"`,
    };
}

async function startApp(allowDelete: boolean, logPath: string): Promise<ChildProcess> {
    const next = path.join(root, "node_modules", "next", "dist", "bin", "next");
    const server = spawn(process.execPath, [next, "start", "-p", String(E2E.appPort), "-H", "127.0.0.1"], { cwd: build, env: appEnv(mode === "live", allowDelete), stdio: ["ignore", "pipe", "pipe"] });
    const log = createWriteStream(logPath, { flags: "a" });
    server.stdout?.pipe(log);
    server.stderr?.pipe(log);
    children.push(server);
    await waitFor(`${E2E.appUrl}/`, 60_000);
    return server;
}

async function runPhase(phase: string, extra: Record<string, string> = {}, label = phase): Promise<{ code: number; output: string }> {
    appendFileSync(currentLedger, JSON.stringify({ phase: label }) + "\n");
    const tsx = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
    const env = {
        ...baseEnv(),
        SUPABASE_URL: supabaseForGate(),
        SUPABASE_SERVICE_ROLE_KEY: mode === "live" ? serviceKey : "eyJ.service-test",
        NEWSLETTER_ADMIN_EMAILS: APPROVED_EMAIL,
        RT_APP_URL: E2E.appUrl,
        RT_PHASE: phase,
        RT_WAIT_MINUTES: String(WAIT_MINUTES),
        ...gateEnv("driver", false),
        ...extra,
    };
    return runNode([tsx, path.join(here, "real-newsletter-flow.mts")], env, root);
}

function secretsIn(text: string): string[] {
    const secrets = [serviceKey, anonKey, fileEnv.MAIL_API_KEY ?? "", tokenSecret].filter((s) => s.length >= 8);
    return secrets.filter((s) => text.includes(s)).map((_, i) => `secret #${i + 1}`);
}

async function mockControl(pathAndQuery: string, init?: RequestInit): Promise<any> {
    return (await fetch(E2E.mockUrl + pathAndQuery, init)).json();
}

/** Dry run only: proves the stop conditions leave things untouched. Returns true when all hold. */
async function dryRunSafeguards(logPath: string): Promise<boolean> {
    console.log("\n=== SAFEGUARD TESTS (dry run, local mock) ===");
    currentLedger = safeguardLedger;
    rmSync(safeguardLedger, { force: true });
    const app = await startApp(false, logPath);
    const results: Array<[string, boolean]> = [];
    const note = (name: string, ok: boolean) => {
        results.push([name, ok]);
        console.log((ok ? "PASS  " : "FAIL  ") + name);
    };
    /** Subscriber changes and mails the gate allowed during one labelled phase. */
    const changesIn = (label: string) => {
        let on = false;
        return readFileSync(safeguardLedger, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Entry).filter((e) => {
            if (e.phase) {
                on = e.phase === label;
                return false;
            }
            return on && e.allowed && ((e.kind === "supabase" && e.method !== "GET" && /newsletter_subscribers/.test(e.target ?? "")) || e.kind === "resend");
        });
    };
    const noDelete = () => !readFileSync(safeguardLedger, "utf8").includes('"method":"DELETE"');

    // 1. A record for the approved address already exists.
    await mockControl("/__reset");
    await mockControl("/__seed", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rows: [{ email: APPROVED_EMAIL, status: "active" }] }) });
    let r = await runPhase("signup-flow", {}, "sg-existing");
    let st = await mockControl("/__state");
    note("existing record: the test stops", r.code === 3);
    note("existing record: it is left exactly as it was (still active, one row)", st.subscribers.length === 1 && st.subscribers[0].status === "active");
    note("existing record: no subscriber write and no e-mail was attempted", changesIn("sg-existing").length === 0 && st.mails.length === 0);

    // 2. The confirmation e-mail cannot be sent (the provider rejects it).
    rmSync(safeguardLedger, { force: true });
    await mockControl("/__reset");
    await mockControl("/__mailfail?on=1");
    r = await runPhase("signup-flow", {}, "sg-mailfail");
    st = await mockControl("/__state");
    note("undeliverable e-mail: the test stops", r.code === 3);
    note("undeliverable e-mail: nothing was activated or unsubscribed; the single row stays pending", st.subscribers.length === 1 && st.subscribers[0].status === "pending");
    note("undeliverable e-mail: no cleanup was attempted", noDelete());

    // 3. Nobody confirms before the timeout.
    rmSync(safeguardLedger, { force: true });
    await mockControl("/__reset");
    r = await runPhase("signup-flow", { RT_FORCE_WAIT: "1", RT_WAIT_MINUTES: "0.05" }, "sg-timeout");
    st = await mockControl("/__state");
    note("no confirmation: the test stops after the timeout", r.code === 3 && /TIMED OUT/.test(r.output));
    note("no confirmation: the row stays pending (not activated, unsubscribed or deleted)", st.subscribers.length === 1 && st.subscribers[0].status === "pending");
    note("no confirmation: exactly one e-mail was sent and no cleanup was attempted", st.mails.length === 1 && noDelete());

    stopProcess(app);
    await new Promise((res) => setTimeout(res, 1500));
    await mockControl("/__reset");
    const ok = results.every(([, passed]) => passed);
    console.log(`Safeguard tests: ${ok ? "all passed" : "FAILED"}`);
    return ok;
}

async function main(): Promise<number> {
    mkdirSync(stateDir, { recursive: true });
    const hash = versionHash();
    console.log(`Mode: ${mode.toUpperCase()}${cleanupOnly ? " (cleanup)" : ""}`);
    console.log(`Approved recipient: ${APPROVED_EMAIL}`);
    console.log(`Approved sender:    ${APPROVED_SENDER}`);
    console.log("\nPre-flight checks on .env.local and the code (no values shown):");
    const findings = preflight();
    for (const f of findings) console.log(`  ${f.ok ? "OK  " : "FAIL"} ${f.text}`);
    const hardFail = findings.some((f) => !f.ok);

    if (mode === "live") {
        if (hardFail) throw new Error("Pre-flight checks failed; nothing was sent or written.");
        if (!(cleanupOnly ? args.has("--approved-cleanup") : args.has("--approved-live-run"))) throw new Error(`Refused: ${cleanupOnly ? "--approved-cleanup" : "--approved-live-run"} is required and must only be added after the user approved the dry-run results.`);
        const stamp = existsSync(stampFile) ? (JSON.parse(readFileSync(stampFile, "utf8")) as { hash?: string }) : {};
        if (stamp.hash !== hash) throw new Error("Refused: no successful dry run exists for exactly this version of the test mechanism and code. Run --dry-run again and have it approved.");
    }

    for (const port of [E2E.appPort, ...(mode === "dry" ? [E2E.mockPort] : [])]) {
        if (!(await portFree(port))) throw new Error(`Port ${port} is already in use. Stop whatever is using it and run again.`);
    }

    rmSync(ledger, { force: true }); // every run starts with an empty ledger, so the e-mail limit counts this run only
    console.log("\nPreparing the isolated copy (sign-up flag ON in the copy only)...");
    copyWebsite(root, build);
    const next = path.join(root, "node_modules", "next", "dist", "bin", "next");
    const buildPreload = `--require "${fwd(path.join(here, "preload.cjs"))}"`;
    const buildEnv = { ...baseEnv(), ...E2E.appEnv(), E2E_MOCK_URL: E2E.mockUrl, NODE_OPTIONS: buildPreload, E2E_ALLOW_HOSTS: "fonts.googleapis.com,fonts.gstatic.com" };
    let built = await runNode([next, "build"], buildEnv, build);
    if (built.code !== 0) built = await runNode([next, "build"], buildEnv, build);
    if (built.code !== 0) throw new Error("The test copy did not build.");

    if (mode === "dry") {
        const mock = spawn(process.execPath, [path.join(here, "mock-supabase.cjs")], { env: { ...baseEnv(), MOCK_PORT: String(E2E.mockPort), MOCK_ADMIN_EMAIL: APPROVED_EMAIL }, stdio: "ignore" });
        children.push(mock);
        await waitFor(`${E2E.mockUrl}/__state`, 15_000);
    }

    const logPath = path.join(build, "app.log");
    let code = 0;
    let transcript = "";
    if (cleanupOnly) {
        await startApp(true, logPath);
        const r = await runPhase("cleanup");
        code = r.code;
        transcript += r.output;
    } else if (mode === "live") {
        await startApp(false, logPath);
        const r = await runPhase("signup-flow");
        code = r.code;
        transcript += r.output;
    } else {
        if (!(await dryRunSafeguards(logPath))) return 6;
        currentLedger = ledger;
        const first = await startApp(false, logPath);
        let r = await runPhase("signup-flow");
        code = r.code;
        transcript += r.output;
        if (code === 0) {
            r = await runPhase("negatives");
            code = r.code;
            transcript += r.output;
        }
        stopProcess(first);
        await new Promise((res) => setTimeout(res, 1500));
        if (code === 0) {
            await startApp(true, logPath);
            r = await runPhase("cleanup");
            code = r.code;
            transcript += r.output;
        }
    }

    const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
    const leaks = secretsIn(log + transcript);
    console.log(`\nSecret scan of the server log and test output: ${leaks.length === 0 ? "clean (no key, token secret or API key appears)" : "LEAK FOUND: " + leaks.join(", ")}`);
    if (leaks.length) code = code || 4;

    const summary = summarise();
    console.log(`\n${mode === "dry" ? "PLANNED real operations (counted from this dry run against the mock; the live run makes the same calls)" : "Operations actually performed"}:\n${summary.text}`);
    if (mode === "dry" && code === 0) {
        if (summary.mails !== MAX_MAILS) { console.log(`\nUnexpected number of e-mails in the dry run (${summary.mails}); the live run will not be allowed.`); return 5; }
        writeFileSync(path.join(stateDir, "dry-run-ledger.jsonl"), readFileSync(ledger));
        writeFileSync(stampFile, JSON.stringify({ hash, at: new Date().toISOString(), mails: summary.mails }, null, 2));
        console.log("\nDry run PASSED. A live run is now permitted ONLY after the user approves these results.");
    }
    return code;
}

process.on("SIGINT", () => { cleanupAll(); process.exit(130); });
main()
    .then((code) => { cleanupAll(); if (!args.has("--keep")) rmSync(build, { recursive: true, force: true }); process.exitCode = code; })
    .catch((error) => { console.error(String(error instanceof Error ? error.message : error)); cleanupAll(); if (!args.has("--keep")) rmSync(build, { recursive: true, force: true }); process.exitCode = 2; });
