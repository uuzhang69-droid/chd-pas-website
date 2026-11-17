/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS preload: required by NODE_OPTIONS=--require */
/* Loaded (via NODE_OPTIONS=--require) into the isolated test copy of the website only.

   What it guarantees:
   - mail sent to Resend is captured by the local mock instead (nothing leaves the machine);
   - Cloudflare Turnstile checks are answered locally;
   - every other network connection that is not to this computer is refused, at two levels:
     the global fetch(), and the raw socket layer (so a library that does not use fetch is stopped too).

   E2E_ALLOW_HOSTS (comma separated) lets the BUILD step reach the two Google Fonts hosts, which
   next/font needs. It is never set for the running server. */
const net = require("net");

const MOCK = process.env.E2E_MOCK_URL || "http://127.0.0.1:4010";
const extra = (process.env.E2E_ALLOW_HOSTS || "").split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
const LOCAL = new Set(["127.0.0.1", "localhost", "::1", "0.0.0.0", "::", "[::1]"]);
const allowed = (host) => !host || LOCAL.has(String(host).toLowerCase()) || extra.includes(String(host).toLowerCase());

function refuse(host) {
    return new Error("E2E harness: blocked outbound connection to " + host + " (only this computer is reachable in tests)");
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("https://api.resend.com/emails")) {
        await realFetch(MOCK + "/__mail", { method: "POST", headers: { "Content-Type": "application/json" }, body: init && init.body });
        return new Response(JSON.stringify({ id: "mock-mail" }), { status: 200 });
    }
    if (url.startsWith("https://challenges.cloudflare.com/")) return new Response(JSON.stringify({ success: true }), { status: 200 });
    const host = new URL(url).hostname;
    if (!allowed(host)) throw refuse(host);
    return realFetch(input, init);
};

const realConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
    const first = Array.isArray(args[0]) ? args[0][0] : args[0];
    let host;
    if (first && typeof first === "object") host = first.path ? undefined : first.host;
    else if (typeof first === "number") host = typeof args[1] === "string" ? args[1] : undefined;
    else host = undefined; // a named pipe / unix path
    if (!allowed(host)) throw refuse(host);
    return realConnect.apply(this, args);
};
