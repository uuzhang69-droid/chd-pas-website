import {
    getSupabaseConfig,
    supabaseRest,
    type SupabaseConfig,
} from "../supabase/rest";

export type RateLimitRule = {
    key: string;
    limit: number;
    windowSeconds: number;
};
export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export interface RateLimiter {
    hit(rule: RateLimitRule): Promise<RateLimitResult>;
}

/** Fixed-window counters held in memory. Suitable for tests and local work only: each server instance has its own. */
export class MemoryRateLimiter implements RateLimiter {
    private windows = new Map<string, { start: number; count: number }>();
    constructor(private now: () => number = () => Date.now()) {}

    async hit(rule: RateLimitRule): Promise<RateLimitResult> {
        const nowMs = this.now();
        const windowMs = rule.windowSeconds * 1000;
        const start = Math.floor(nowMs / windowMs) * windowMs;
        const entry = this.windows.get(rule.key);
        const count = entry && entry.start === start ? entry.count + 1 : 1;
        this.windows.set(rule.key, { start, count });
        return {
            allowed: count <= rule.limit,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil((start + windowMs - nowMs) / 1000),
            ),
        };
    }
}

/** Counters in Postgres through the `rate_limit_hit` function, shared by every server instance. */
export class SupabaseRateLimiter implements RateLimiter {
    constructor(
        private config: SupabaseConfig,
        private fetchImpl: typeof fetch = fetch,
    ) {}

    async hit(rule: RateLimitRule): Promise<RateLimitResult> {
        const response = await supabaseRest(
            this.config,
            "rpc/rate_limit_hit",
            {
                method: "POST",
                body: JSON.stringify({
                    p_key: rule.key,
                    p_window_seconds: rule.windowSeconds,
                    p_limit: rule.limit,
                }),
            },
            this.fetchImpl,
        );
        if (!response.ok)
            throw new Error(`rate limit store failed (${response.status})`);
        const data = (await response.json()) as {
            allowed: boolean;
            retry_after: number;
        };
        return { allowed: data.allowed, retryAfterSeconds: data.retry_after };
    }
}

let fallback: MemoryRateLimiter | undefined;

/**
 * Database-backed when Supabase is configured, otherwise a per-instance memory limiter.
 * If the database limiter itself fails, the request is allowed through to the in-memory one.
 */
export function getRateLimiter(): RateLimiter {
    fallback ??= new MemoryRateLimiter();
    const config = getSupabaseConfig();
    if (!config) return fallback;
    const shared = new SupabaseRateLimiter(config);
    const memory = fallback;
    return {
        async hit(rule) {
            try {
                return await shared.hit(rule);
            } catch {
                return memory.hit(rule);
            }
        },
    };
}
