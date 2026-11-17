-- verify_security.sql
-- READ-ONLY check for the Supabase SQL editor. Run it after 0000 and 0001.
-- It is one SELECT statement: it reads the system catalogues and changes nothing.
-- The editor shows only the last result, so everything is in one result table.
-- Expected: every row says PASS, including the last row "99 overall".
-- (If 0001 has not been run yet, check 13 stops with "relation ... does not exist": run 0001 first.)

with
protected_tables as (
    select c.oid, c.relname, c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname in ('rate_limits', 'newsletter_consent_texts', 'newsletter_subscribers', 'newsletter_events')
),
functions as (
    select p.oid, p.proname, p.prosecdef, p.proconfig, p.proowner, p.proacl
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('rate_limit_hit', 'rate_limit_cleanup', 'newsletter_cleanup', 'newsletter_set_updated_at')
),
checks(name, ok) as (
    values
    ('01 all four tables exist',
        (select count(*) from protected_tables) = 4),
    ('02 row level security is on for all four tables',
        (select count(*) from protected_tables where relrowsecurity) = 4),
    ('03 there are no row level security policies',
        (select count(*) from pg_policies where schemaname = 'public'
            and tablename in ('rate_limits', 'newsletter_consent_texts', 'newsletter_subscribers', 'newsletter_events')) = 0),
    ('04 anon and authenticated hold no table privileges',
        (select count(*)
         from protected_tables t
         cross join (values ('anon'), ('authenticated')) r(role_name)
         cross join (values ('select'), ('insert'), ('update'), ('delete'), ('truncate'), ('references'), ('trigger')) p(priv)
         where has_table_privilege(r.role_name, t.oid, p.priv)) = 0),
    ('05 service_role holds select, insert, update and delete on all four tables',
        (select count(*)
         from protected_tables t
         cross join (values ('select'), ('insert'), ('update'), ('delete')) p(priv)
         where has_table_privilege('service_role', t.oid, p.priv)) = 16),
    ('06 all four functions exist',
        (select count(*) from functions) = 4),
    ('07 anon and authenticated cannot run any of the functions',
        (select count(*)
         from functions f
         cross join (values ('anon'), ('authenticated')) r(role_name)
         where has_function_privilege(r.role_name, f.oid, 'execute')) = 0),
    ('08 no function is executable by PUBLIC',
        (select count(*)
         from functions f
         cross join lateral aclexplode(coalesce(f.proacl, acldefault('f', f.proowner))) a
         where a.grantee = 0 and a.privilege_type = 'EXECUTE') = 0),
    ('09 service_role can run the three server functions, and not the trigger function',
        (select count(*) from functions f
            where f.proname in ('rate_limit_hit', 'rate_limit_cleanup', 'newsletter_cleanup')
              and has_function_privilege('service_role', f.oid, 'execute')) = 3
        and not (select bool_or(has_function_privilege('service_role', f.oid, 'execute'))
                 from functions f where f.proname = 'newsletter_set_updated_at')),
    ('10 security definer functions have an empty search path',
        (select count(*) from functions f
            where f.prosecdef and 'search_path=""' = any (f.proconfig)) = 3),
    ('11 the trigger function is not security definer and has an empty search path',
        (select count(*) from functions f
            where f.proname = 'newsletter_set_updated_at'
              and not f.prosecdef and 'search_path=""' = any (f.proconfig)) = 1),
    ('12 anon and authenticated cannot use the audit table numbering',
        (select count(*)
         from (values ('anon'), ('authenticated')) r(role_name)
         where pg_get_serial_sequence('public.newsletter_events', 'id') is not null
           and has_sequence_privilege(r.role_name, pg_get_serial_sequence('public.newsletter_events', 'id'), 'usage')) = 0),
    ('13 the consent wording v1-2026-11 is in place',
        coalesce((select count(*) from public.newsletter_consent_texts where version = 'v1-2026-11'), 0) = 1)
)
select name as check_name,
       case when ok then 'PASS' else 'FAIL' end as result
from checks
union all
select '99 overall',
       case when bool_and(coalesce(ok, false)) then 'PASS' else 'FAIL' end
from checks
order by 1;
