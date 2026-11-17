-- 0001_newsletter.sql
-- Newsletter subscribers, the wording each person agreed to, and a small audit trail.
--
-- Run in the Supabase SQL editor of the website's project, AFTER 0000_rate_limit.sql.
-- Safe to run again: tables and indexes are "if not exists", the consent text is inserted once, functions
-- are "create or replace" and the trigger is replaced inside one transaction. Nothing existing is dropped,
-- truncated or altered, and the script stops with a clear message if 0000 has not been run.
--
-- Who can use it: only the website's server, which connects with the service role key. Row level security
-- is on with no policies, and the public (anon) and signed-in (authenticated) roles are denied everything,
-- so neither can read or change subscriber data, the audit trail or the consent wordings.

begin;

-- 1. Stop early, with a clear reason, instead of half-applying.
do $guard$
declare
    v_table record;
begin
    if to_regprocedure('public.rate_limit_hit(text,integer,integer)') is null
       or to_regprocedure('public.rate_limit_cleanup()') is null then
        raise exception 'Run 0000_rate_limit.sql first.';
    end if;

    -- A table with one of these names but another shape must be looked at by a person, not silently skipped.
    for v_table in
        select * from (values
            ('newsletter_consent_texts', array['version', 'body', 'effective_from']),
            ('newsletter_subscribers', array['id', 'email', 'email_normalised', 'status', 'source', 'source_path',
                                              'consent_text_version', 'consent_given_at', 'confirmed_at',
                                              'unsubscribed_at', 'last_confirmation_sent_at', 'created_at', 'updated_at']),
            ('newsletter_events', array['id', 'subscriber_id', 'event', 'actor', 'at'])
        ) as t(table_name, expected_columns)
    loop
        if to_regclass('public.' || v_table.table_name) is not null
           and (
                select count(*)
                from information_schema.columns
                where table_schema = 'public'
                  and table_name = v_table.table_name
                  and column_name = any (v_table.expected_columns)
           ) <> cardinality(v_table.expected_columns)
        then
            raise exception 'public.% already exists with a different structure. Review it before running this migration.', v_table.table_name;
        end if;
    end loop;
end
$guard$;

-- 2. Exact consent wordings. A subscriber row points at the version it agreed to.
create table if not exists public.newsletter_consent_texts (
    version        text        primary key,
    body           text        not null,
    effective_from timestamptz not null default now()
);

insert into public.newsletter_consent_texts (version, body) values (
    'v1-2026-11',
    'I''d like to receive occasional news about classes, events and offers from County Hall Dance Centre by email. I can unsubscribe at any time. See our Privacy Policy.'
) on conflict (version) do nothing;

-- 3. Subscribers. An address that unsubscribes stays as a row, so it is not added again by mistake.
create table if not exists public.newsletter_subscribers (
    id                        uuid        primary key default gen_random_uuid(),
    email                     text        not null,
    email_normalised          text        generated always as (lower(btrim(email))) stored,
    status                    text        not null default 'pending'
                                  check (status in ('pending', 'active', 'unsubscribed')),
    source                    text        not null check (source in ('footer', 'home', 'other')),
    source_path               text,
    consent_text_version      text        not null references public.newsletter_consent_texts (version),
    consent_given_at          timestamptz not null,
    confirmed_at              timestamptz,
    unsubscribed_at           timestamptz,
    last_confirmation_sent_at timestamptz,
    created_at                timestamptz not null default now(),
    updated_at                timestamptz not null default now()
);

-- One row per address, whatever the capitalisation or surrounding spaces.
create unique index if not exists newsletter_subscribers_email_uq
    on public.newsletter_subscribers (email_normalised);
create index if not exists newsletter_subscribers_status_idx
    on public.newsletter_subscribers (status, created_at desc);

-- 4. Keeps updated_at current. A trigger function: it cannot be called on its own, it does not read or write
-- any table, and it is not SECURITY DEFINER. Its name is specific to this feature so it can never replace a
-- function of the same name that the project already has. Execution is revoked from every role except the owner;
-- PostgreSQL checks the right to run a trigger function only when the trigger is created, not when it fires,
-- so the trigger keeps working for the server.
create or replace function public.newsletter_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end
$$;

revoke all on function public.newsletter_set_updated_at() from public, anon, authenticated, service_role;

drop trigger if exists newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_updated_at
    before update on public.newsletter_subscribers
    for each row execute function public.newsletter_set_updated_at();

-- 5. Small audit trail. No IP addresses and no message text. `actor` is "visitor" or an administrator's email.
create table if not exists public.newsletter_events (
    id            bigint      generated always as identity primary key,
    subscriber_id uuid        references public.newsletter_subscribers (id) on delete set null,
    event         text        not null,
    actor         text        not null,
    at            timestamptz not null default now()
);

-- 6. Housekeeping. Addresses that never confirmed are removed after 30 days; old rate limit counters are
-- cleared through the function from 0000. SECURITY DEFINER with an empty search_path, run only by the server.
create or replace function public.newsletter_cleanup()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    delete from public.newsletter_subscribers
    where status = 'pending' and created_at < now() - interval '30 days';
    perform public.rate_limit_cleanup();
end
$$;

-- 7. Lock everything down. Row level security is on and there are deliberately no policies.
alter table public.newsletter_consent_texts enable row level security;
alter table public.newsletter_subscribers   enable row level security;
alter table public.newsletter_events        enable row level security;

revoke all on table public.newsletter_consent_texts, public.newsletter_subscribers, public.newsletter_events
    from public, anon, authenticated;
grant select, insert, update, delete
    on table public.newsletter_consent_texts, public.newsletter_subscribers, public.newsletter_events
    to service_role;

-- The numbering behind newsletter_events.id is not for the public roles either.
do $seq$
declare
    v_sequence text := pg_get_serial_sequence('public.newsletter_events', 'id');
begin
    if v_sequence is not null then
        execute format('revoke all on sequence %s from public, anon, authenticated', v_sequence);
        execute format('grant usage, select on sequence %s to service_role', v_sequence);
    end if;
end
$seq$;

revoke all on function public.newsletter_cleanup() from public, anon, authenticated;
grant execute on function public.newsletter_cleanup() to service_role;

commit;

-- Make the new tables and functions visible to the API straight away.
notify pgrst, 'reload schema';

-- Optional: run the housekeeping every night once the pg_cron extension is enabled, for example:
--   select cron.schedule('newsletter-cleanup', '17 3 * * *', 'select public.newsletter_cleanup()');
