/**
 * Minimal Supabase client over plain HTTPS (PostgREST and GoTrue). No SDK, no Vercel services:
 * the same calls work from any Node host and can be reproduced from PHP.
 * The service key is read on the server only and never reaches the browser.
 */
export type SupabaseConfig = { url: string; serviceKey: string };

type Fetch = typeof fetch;

export class SupabaseError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
    }
}

export function getSupabaseConfig(): SupabaseConfig | undefined {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return undefined;
    return { url: url.replace(/\/+$/, ""), serviceKey };
}

export async function supabaseRest(
    config: SupabaseConfig,
    path: string,
    init: RequestInit & { prefer?: string } = {},
    fetchImpl: Fetch = fetch,
): Promise<Response> {
    const { prefer, headers, ...rest } = init;
    const response = await fetchImpl(`${config.url}/rest/v1/${path}`, {
        ...rest,
        headers: {
            apikey: config.serviceKey,
            Authorization: `Bearer ${config.serviceKey}`,
            "Content-Type": "application/json",
            ...(prefer ? { Prefer: prefer } : {}),
            ...(headers as Record<string, string> | undefined),
        },
        signal: AbortSignal.timeout(10_000),
    });
    return response;
}

/** Throws without echoing the response body, because it can contain personal data. */
export async function expectOk(
    response: Response,
    action: string,
): Promise<Response> {
    if (!response.ok)
        throw new SupabaseError(
            response.status,
            `${action} failed (${response.status})`,
        );
    return response;
}

/** PostgREST filter values must not contain its reserved characters. */
export function filterValue(value: string): string {
    return value
        .replace(/[*,()\\%_]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 100);
}
