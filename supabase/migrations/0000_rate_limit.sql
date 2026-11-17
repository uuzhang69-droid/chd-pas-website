-- 0000_rate_limit.sql
-- Shared rate limiting for the website's forms (the contact form today).
--
-- Run in the Supabase SQL editor of the website's project. Run it once, before 0001_newsletter.sql.
-- Safe to run again: every statement is "if not exists" / "create or replace" / a repeatable grant.
-- Nothing is dropped, truncated or deleted, and no existing table is altered.
--
-- What is stored: one counter per hashed key (hashed network address or hashed email address) and time
-- window. No names, messages or raw addresses.
--
-- Who can use it: only the website's server, which connects with the service role key.
-- The public (anon) and signed-in (authenticated) roles get no access to the table or the functions.

begin;

-- Stop, instead of silently skipping, if a table with this name already exists with another shape.
-- The functions below rely on exactly these three columns, their types, and a primary key for ON CONFLICT.
do $guard$
begin
    if to_regclass('public.rate_limits') is not null
       and (
            (
                select count(*)
                from information_schema.columns
                where table_schema = 'public'
                  and table_name = 'rate_limits'
                  and (column_name, data_type) in (
                      ('key', 'text'),
                      ('window_start', 'timestamp with time zone'),
                      ('count', 'integer')
                  )
            ) <> 3
            or not exists (
                select 1 from pg_constraint
                where conrelid = to_regclass('public.rate_limits') and contype = 'p'
            )
       )
    then
        raise exception 'public.rate_limits already exists with a different structure. Review it before running this migration.';
    end if;
end
$guard$;

create table if not exists public.rate_limits (
    key          text        not null,
    window_start timestamptz not null,
    count        integer     not null default 1,
    primary key (key, window_start)
);

comment on table public.rate_limits is
    'Fixed-window request counters for the website forms. Written only through public.rate_limit_hit by the server.';

-- Counts one request and says whether it is still within the limit.
-- SECURITY DEFINER: it runs with its owner's rights (the role that runs this migration, normally postgres),
-- which is what lets it write to a table that no public role can touch.
-- search_path is empty and every object is schema-qualified, so a caller cannot redirect it to look-alike objects.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_window timestamptz;
    v_count  integer;
begin
    -- Every argument is required: NULL is rejected explicitly, because "NULL < 1" is not true and would slip through.
    if p_key is null or length(p_key) = 0 or length(p_key) > 200
       or p_window_seconds is null or p_window_seconds < 1
       or p_limit is null or p_limit < 1 then
        raise exception 'invalid rate limit arguments' using errcode = '22023';
    end if;

    v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

    insert into public.rate_limits as r (key, window_start, count)
    values (p_key, v_window, 1)
    on conflict (key, window_start) do update set count = r.count + 1
    returning r.count into v_count;

    return jsonb_build_object(
        'allowed', v_count <= p_limit,
        'retry_after', greatest(1, ceil(extract(epoch from (v_window + make_interval(secs => p_window_seconds) - now())))::integer)
    );
end
$$;

-- Counters older than two days are of no use. Call this by hand or on a schedule (see the note at the end).
create or replace function public.rate_limit_cleanup()
returns void
language sql
security definer
set search_path = ''
as $$
    delete from public.rate_limits where window_start < now() - interval '2 days';
$$;

-- Lock everything down. Row level security is on and there are deliberately no policies.
alter table public.rate_limits enable row level security;

revoke all on table public.rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.rate_limits to service_role;

revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.rate_limit_cleanup() from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.rate_limit_cleanup() to service_role;

commit;

-- Make the new function visible to the API straight away.
notify pgrst, 'reload schema';

-- Optional: clean old counters every night once the pg_cron extension is enabled, for example:
--   select cron.schedule('rate-limit-cleanup', '23 3 * * *', 'select public.rate_limit_cleanup()');
