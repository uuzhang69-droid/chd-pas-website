/**
 * LOCAL DEVELOPMENT ONLY. Gets a real one-time sign-in code for a Newsletter administrator without sending an email.
 *
 *   1. On http://localhost:3000/admin/login enter the email and press the first button (this moves to the code step).
 *   2. In a terminal:  npx tsx scripts/dev-admin-otp.mts you@example.com
 *   3. Type the printed code on the code step.
 *   Order matters: asking for a code on the page makes Supabase issue a new token and replaces any earlier one,
 *   so the code from this tool must be generated AFTER step 1 and used straight away.
 *
 * How it works: it asks Supabase Auth's admin API (`generate_link`, the officially supported call for building your
 * own sign-in emails) to create a magic-link token for an EXISTING, confirmed user. Supabase answers with the numeric
 * `email_otp` of that token and sends nothing. You then type that code on /admin/login, so the sign-in still goes
 * through the normal path: the allow-list, `/api/admin/auth/verify`, rate limits, cookies and the audit trail.
 *
 * What it deliberately is not:
 * - not an endpoint: it is a command run in your own terminal, so there is nothing a visitor or the production site could call;
 * - not part of the website bundle: nothing in src/ imports this file;
 * - not a bypass: it never makes a session itself and never invents a code;
 * - it uses the service key from your own .env.local, in this process only. The key is never printed or sent to a browser.
 *
 * It refuses to run on a hosting platform or with NODE_ENV=production, for any address that is not in
 * NEWSLETTER_ADMIN_EMAILS, and for any user that does not already exist and have a confirmed email
 * (generate_link would otherwise create the account).
 */
import { pathToFileURL } from "node:url";
import { getAdminEmails, isAdminEmail } from "../src/lib/admin/auth";
import { getSupabaseConfig } from "../src/lib/supabase/rest";

type Fetch = typeof fetch;

export class DevOtpError extends Error {}

const FORBIDDEN_ENV = ["VERCEL", "VERCEL_ENV", "CI", "NETLIFY", "AWS_LAMBDA_FUNCTION_NAME", "RENDER", "FLY_APP_NAME"];

/** Refuses on any sign of production or a hosting platform. */
export function assertLocalOnly(env: Record<string, string | undefined>): void {
    if (env.NODE_ENV === "production")
        throw new DevOtpError("Refused: NODE_ENV is production. This tool is for local development only.");
    for (const name of FORBIDDEN_ENV)
        if (env[name])
            throw new DevOtpError(`Refused: ${name} is set, so this does not look like a local computer.`);
}

function adminHeaders(serviceKey: string): Record<string, string> {
    return {
        apikey: serviceKey,
        // The older service_role key is a JWT and is also sent as the bearer token; newer "sb_secret_" keys are not.
        ...(serviceKey.startsWith("eyJ") ? { Authorization: `Bearer ${serviceKey}` } : {}),
        "Content-Type": "application/json",
    };
}

type AuthUser = { email?: string; email_confirmed_at?: string | null };

/** Looks the user up first, because generate_link would create a missing account. */
async function findUser(
    url: string,
    serviceKey: string,
    email: string,
    fetchImpl: Fetch,
): Promise<AuthUser | undefined> {
    const perPage = 100;
    for (let page = 1; page <= 20; page++) {
        const response = await fetchImpl(`${url}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
            headers: adminHeaders(serviceKey),
            signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new DevOtpError(`Supabase could not list users (HTTP ${response.status}).`);
        const data = (await response.json()) as { users?: AuthUser[] };
        const users = data.users ?? [];
        const found = users.find((user) => user.email?.trim().toLowerCase() === email);
        if (found) return found;
        if (users.length < perPage) return undefined;
    }
    return undefined;
}

export type DevOtpInput = {
    email: string;
    env?: Record<string, string | undefined>;
    fetchImpl?: Fetch;
};

/** Returns a real one-time code from Supabase for an existing, confirmed, allow-listed administrator. */
export async function generateAdminOtp({
    email: rawEmail,
    env = process.env,
    fetchImpl = fetch,
}: DevOtpInput): Promise<{ email: string; otp: string }> {
    assertLocalOnly(env);
    const email = rawEmail.trim().toLowerCase();
    if (!email) throw new DevOtpError("Give the administrator's email address.");
    if (!isAdminEmail(email, getAdminEmails()))
        throw new DevOtpError("Refused: that address is not in NEWSLETTER_ADMIN_EMAILS.");
    const config = getSupabaseConfig();
    if (!config)
        throw new DevOtpError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) must be set in .env.local.");

    const user = await findUser(config.url, config.serviceKey, email, fetchImpl);
    if (!user)
        throw new DevOtpError("Refused: no such user in Supabase Auth. Create it in the dashboard first (nothing was created).");
    if (!user.email_confirmed_at)
        throw new DevOtpError("Refused: that user's email is not confirmed. Create it with Auto Confirm User in the dashboard.");

    const response = await fetchImpl(`${config.url}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: adminHeaders(config.serviceKey),
        body: JSON.stringify({ type: "magiclink", email }),
        signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new DevOtpError(`Supabase could not generate a code (HTTP ${response.status}).`);
    const data = (await response.json()) as { email_otp?: string; properties?: { email_otp?: string } };
    const otp = data.email_otp ?? data.properties?.email_otp;
    if (!otp || !/^\d{6,10}$/.test(otp))
        throw new DevOtpError("Supabase did not return a numeric code. Nothing is usable.");

    // Audit trail, best effort: who asked for a development code, never the code itself.
    await fetchImpl(`${config.url}/rest/v1/newsletter_events`, {
        method: "POST",
        headers: adminHeaders(config.serviceKey),
        body: JSON.stringify({ subscriber_id: null, event: "dev_otp_generated", actor: email }),
        signal: AbortSignal.timeout(10_000),
    }).catch(() => undefined);

    return { email, otp };
}

/** What is printed: the code and the next step. Never a key. */
export function describeResult(result: { email: string; otp: string }): string {
    return [
        `One-time code for ${result.email}: ${result.otp}`,
        "Type it on the code step of http://localhost:3000/admin/login (you must already have pressed the first button",
        "there: asking for a code on the page replaces this one). It works once and expires after the time set in",
        "Supabase (about an hour). Do not share it.",
    ].join("\n");
}

async function main() {
    try {
        process.loadEnvFile(".env.local");
    } catch {
        // No .env.local file: rely on variables already in the environment.
    }
    try {
        const result = await generateAdminOtp({ email: process.argv[2] ?? "" });
        console.log(describeResult(result));
    } catch (error) {
        console.error(error instanceof DevOtpError ? error.message : "Unexpected error. Nothing was changed.");
        process.exitCode = 1;
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main();
