/* Small helpers shared by the controlled real-test launcher: process handling and the isolated website copy. */
import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import net from "node:net";
import path from "node:path";

/** Only these inherited variables are passed on; nothing from .env files or the real shell secrets. */
export function baseEnv(): Record<string, string> {
    const env: Record<string, string> = {};
    for (const key of ["PATH", "Path", "SystemRoot", "SYSTEMROOT", "TEMP", "TMP", "USERPROFILE", "HOME", "APPDATA", "LOCALAPPDATA", "ComSpec", "PATHEXT", "WINDIR"]) {
        if (process.env[key]) env[key] = process.env[key] as string;
    }
    return env;
}

export function stopProcess(child: ChildProcess) {
    if (!child.pid || child.exitCode !== null) return;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGKILL");
}

export function portFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const probe = net.createServer();
        probe.once("error", () => resolve(false));
        probe.listen(port, "127.0.0.1", () => probe.close(() => resolve(true)));
    });
}

export async function waitFor(url: string, ms: number) {
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

/** Runs a node script to completion, streaming its output; also returns everything it printed. */
export function runNode(args: string[], env: Record<string, string>, cwd: string): Promise<{ code: number; output: string }> {
    return new Promise((resolve) => {
        const child = spawn(process.execPath, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
        let output = "";
        const forward = (chunk: Buffer) => {
            output += chunk.toString();
            process.stdout.write(chunk);
        };
        child.stdout.on("data", forward);
        child.stderr.on("data", forward);
        child.on("close", (code) => resolve({ code: code ?? 1, output }));
    });
}

/** Copies the website into `build`, switches the sign-up flag on IN THE COPY ONLY, and never copies env files. */
export function copyWebsite(root: string, build: string) {
    rmSync(build, { recursive: true, force: true });
    mkdirSync(build);
    for (const entry of ["src", "content", "sanity", "sanity.config.ts", "sanity.cli.ts", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "package.json"]) {
        if (existsSync(path.join(root, entry))) cpSync(path.join(root, entry), path.join(build, entry), { recursive: true });
    }
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
