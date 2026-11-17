/* Runs the mocked end-to-end tests for the Newsletter and Admin features.

       npx tsx scripts/e2e/run-newsletter-e2e.mts [--collect-only] [--keep]

   Default: the email workflow (double opt-in), NEWSLETTER_DELIVERY_MODE=double_opt_in in the test copy.
   --collect-only: the safe default mode, where sign-ups are stored UNVERIFIED and no email is sent (collect-e2e.mts).

   What it does, in order:
     1. makes a throw-away copy of the website in .e2e-build/ (git-ignored; never your real .env files);
     2. switches the public sign-up flag ON in the COPY only (the real flag stays false);
     3. builds and starts the copy against a local mock Supabase and a local mock mailbox;
     4. runs the checks, then stops everything and deletes the copy (--keep leaves it for inspection).

   Safety: every process gets a small explicit environment of fake values, and a preload script refuses any
   connection that does not go to this computer. Real Supabase, Resend, Cloudflare and Airtable cannot be reached. */
import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, createWriteStream } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { E2E } from "./config.mts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const build = path.join(root, ".e2e-build");
const here = path.join(root, "scripts", "e2e");
const keep = process.argv.includes("--keep");
const collectOnly = process.argv.includes("--collect-only");
const children: ChildProcess[] = [];

/** Only these inherited variables are passed on; nothing from .env files or the real shell secrets. */
function baseEnv(): Record<string, string> {
    const env: Record<string, string> = {};
    for (const key of ["PATH", "Path", "SystemRoot", "SYSTEMROOT", "TEMP", "TMP", "USERPROFILE", "HOME", "APPDATA", "LOCALAPPDATA", "ComSpec", "PATHEXT", "WINDIR"]) {
        if (process.env[key]) env[key] = process.env[key] as string;
    }
    return env;
}

function stop(child: ChildProcess) {
    if (!child.pid || child.exitCode !== null) return;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGKILL");
}

function cleanup() {
    for (const child of children) stop(child);
    if (!keep) rmSync(build, { recursive: true, force: true });
}

function portFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const probe = net.createServer();
        probe.once("error", () => resolve(false));
        probe.listen(port, "127.0.0.1", () => probe.close(() => resolve(true)));
    });
}

async function waitFor(url: string, ms: number) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
        try {
            await fetch(url);
            return;
        } catch {
            await new Promise((r) => setTimeout(r, 500));
        }
    }
    throw new Error(`Timed out waiting for ${url}`);
}

function run(label: string, args: string[], env: Record<string, string>, cwd: string): number {
    console.log(`> ${label}`);
    const result = spawnSync(process.execPath, args, { cwd, env, stdio: "inherit" });
    return result.status ?? 1;
}

function copyWebsite() {
    rmSync(build, { recursive: true, force: true });
    mkdirSync(build);
    for (const entry of ["src", "content", "sanity", "sanity.config.ts", "sanity.cli.ts", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "package.json"]) {
        if (existsSync(path.join(root, entry))) cpSync(path.join(root, entry), path.join(build, entry), { recursive: true });
    }
    // Only the small top-level files of /public (schedule.json, logos); the large image folders are not needed.
    mkdirSync(path.join(build, "public"));
    for (const name of readdirSync(path.join(root, "public"))) {
        const full = path.join(root, "public", name);
        if (statSync(full).isFile()) cpSync(full, path.join(build, "public", name));
    }
    // No source file is edited. The sign-up switch is the server-side variable NEWSLETTER_ONLINE_SIGNUP_LIVE, set to "true"
    // only in the environment handed to the test copy (config.mts / the launcher), never in the real environment.
    if (/NEWSLETTER_ONLINE_SIGNUP_LIVE\s*=\s*true/.test(readFileSync(path.join(root, "src", "lib", "features.ts"), "utf8"))) {
        throw new Error("The real source switches public sign-up on. Stop and check before running tests.");
    }
}

async function main(): Promise<number> {
    for (const port of [E2E.appPort, E2E.mockPort]) {
        if (!(await portFree(port))) throw new Error(`Port ${port} is already in use. Stop whatever is using it and run again.`);
    }
    // NODE_OPTIONS treats backslashes as escapes, so the path must use forward slashes.
    const preload = path.join(here, "preload.cjs").replace(/\\/g, "/");
    const nodeOptions = `--require "${preload}"`;
    const common = { ...baseEnv(), ...E2E.appEnv(), ...(collectOnly ? { NEWSLETTER_DELIVERY_MODE: "collect_only" } : {}), E2E_MOCK_URL: E2E.mockUrl, NODE_OPTIONS: nodeOptions };
    const next = path.join(root, "node_modules", "next", "dist", "bin", "next");
    const tsx = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

    console.log("Preparing the isolated test copy...");
    copyWebsite();

    // The build may fetch the two Google Fonts hosts (next/font); nothing else is allowed, and no data is sent.
    const buildEnv = { ...common, E2E_ALLOW_HOSTS: "fonts.googleapis.com,fonts.gstatic.com" };
    let status = run("next build (test copy)", [next, "build"], buildEnv, build);
    if (status !== 0) status = run("next build (retry, the font download is occasionally flaky)", [next, "build"], buildEnv, build);
    if (status !== 0) throw new Error("The test copy did not build.");

    const mock = spawn(process.execPath, [path.join(here, "mock-supabase.cjs")], { env: { ...baseEnv(), MOCK_PORT: String(E2E.mockPort) }, stdio: "ignore" });
    children.push(mock);
    await waitFor(`${E2E.mockUrl}/__state`, 15_000);

    const logPath = path.join(build, "app.log");
    const log = createWriteStream(logPath);
    const server = spawn(process.execPath, [next, "start", "-p", String(E2E.appPort), "-H", "127.0.0.1"], { cwd: build, env: common, stdio: ["ignore", "pipe", "pipe"] });
    server.stdout?.pipe(log);
    server.stderr?.pipe(log);
    children.push(server);
    await waitFor(`${E2E.appUrl}/`, 60_000);

    const driverEnv = { ...baseEnv(), E2E_MOCK_URL: E2E.mockUrl, E2E_APP_LOG: logPath, NODE_OPTIONS: nodeOptions };
    return run("end-to-end checks", [tsx, path.join(here, collectOnly ? "collect-e2e.mts" : "newsletter-e2e.mts")], driverEnv, root);
}

process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
});
main()
    .then((code) => {
        cleanup();
        process.exitCode = code;
    })
    .catch((error) => {
        console.error(String(error instanceof Error ? error.message : error));
        cleanup();
        process.exitCode = 2;
    });
