-- Shared rate limiting for the website contact form (and any other form later).
-- Standalone and idempotent: safe to run before or after 0001_newsletter.sql, which repeats these objects.
-- Keys are hashed network addresses and hashed email addresses. No names, messages or raw addresses are stored.

create table if not exists rate_limits (
    key          text not null,
    window_start timestamptz not null,
    count        int not null default 1,
    primary key (key, window_start)
);

create or replace function rate_limit_hit(p_key text, p_window_seconds int, p_limit int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
    w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
    c int;
begin
    insert into rate_limits (key, window_start, count) values (p_key, w, 1)
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count into c;
    return jsonb_build_object(
        'allowed', c <= p_limit,
        'retry_after', greatest(1, ceil(extract(epoch from (w + make_interval(secs => p_window_seconds) - now())))::int)
    );
end $$;

-- Only the server's service role may use these objects.
alter table rate_limits enable row level security;
revoke all on rate_limits from anon, authenticated;
revoke all on function rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function rate_limit_hit(text, int, int) to service_role;

-- Old counters are useless after a few hours. Remove them on a schedule (pg_cron) or by hand, for example:
--   delete from rate_limits where window_start < now() - interval '2 days';
