begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(92);

select has_table('public', 'k_drama_early_access', 'k-drama registration table exists');
select has_table(
  'public',
  'ai_communication_early_access',
  'ai-communication registration table exists'
);
select has_table('public', 'k_culture_early_access', 'k-culture registration table exists');

select columns_are(
  'public',
  'k_drama_early_access',
  array['id', 'email', 'marketing_consent', 'created_at']
);
select columns_are(
  'public',
  'ai_communication_early_access',
  array['id', 'email', 'marketing_consent', 'created_at']
);
select columns_are(
  'public',
  'k_culture_early_access',
  array['id', 'email', 'marketing_consent', 'created_at']
);

select col_type_is('public', 'k_drama_early_access', 'id', 'uuid', 'k-drama id is uuid');
select col_type_is('public', 'k_drama_early_access', 'email', 'text', 'k-drama email is text');
select col_type_is('public', 'k_drama_early_access', 'marketing_consent', 'boolean', 'k-drama consent is boolean');
select col_type_is('public', 'k_drama_early_access', 'created_at', 'timestamp with time zone', 'k-drama created_at is timestamptz');
select col_type_is('public', 'ai_communication_early_access', 'id', 'uuid', 'ai-communication id is uuid');
select col_type_is('public', 'ai_communication_early_access', 'email', 'text', 'ai-communication email is text');
select col_type_is('public', 'ai_communication_early_access', 'marketing_consent', 'boolean', 'ai-communication consent is boolean');
select col_type_is('public', 'ai_communication_early_access', 'created_at', 'timestamp with time zone', 'ai-communication created_at is timestamptz');
select col_type_is('public', 'k_culture_early_access', 'id', 'uuid', 'k-culture id is uuid');
select col_type_is('public', 'k_culture_early_access', 'email', 'text', 'k-culture email is text');
select col_type_is('public', 'k_culture_early_access', 'marketing_consent', 'boolean', 'k-culture consent is boolean');
select col_type_is('public', 'k_culture_early_access', 'created_at', 'timestamp with time zone', 'k-culture created_at is timestamptz');

select col_is_pk('public', 'k_drama_early_access', 'id', 'k-drama id is the primary key');
select col_is_pk('public', 'ai_communication_early_access', 'id', 'ai-communication id is the primary key');
select col_is_pk('public', 'k_culture_early_access', 'id', 'k-culture id is the primary key');
select col_not_null('public', 'k_drama_early_access', 'email', 'k-drama email is required');
select col_not_null('public', 'k_drama_early_access', 'marketing_consent', 'k-drama consent is required');
select col_not_null('public', 'ai_communication_early_access', 'email', 'ai-communication email is required');
select col_not_null('public', 'ai_communication_early_access', 'marketing_consent', 'ai-communication consent is required');
select col_not_null('public', 'k_culture_early_access', 'email', 'k-culture email is required');
select col_not_null('public', 'k_culture_early_access', 'marketing_consent', 'k-culture consent is required');

select ok(c.relrowsecurity, c.relname || ' enables RLS')
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('k_drama_early_access', 'ai_communication_early_access', 'k_culture_early_access')
order by c.relname;
select ok(c.relforcerowsecurity, c.relname || ' forces RLS')
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('k_drama_early_access', 'ai_communication_early_access', 'k_culture_early_access')
order by c.relname;

select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename in
    ('k_drama_early_access', 'ai_communication_early_access', 'k_culture_early_access')),
  0,
  'registration tables expose no RLS policies'
);
select is(
  (select count(*)::integer
   from pg_indexes
   where schemaname = 'public'
     and tablename in ('k_drama_early_access', 'ai_communication_early_access', 'k_culture_early_access')
     and indexdef ilike '%unique%email%'),
  0,
  'email has no unique index'
);

select ok(
  not has_table_privilege(role_name, format('public.%I', table_name), privilege_name),
  format('%s has no %s on %s', role_name, privilege_name, table_name)
)
from (values ('anon'), ('authenticated')) roles(role_name)
cross join (values
  ('k_drama_early_access'),
  ('ai_communication_early_access'),
  ('k_culture_early_access')
) tables(table_name)
cross join (values ('select'), ('insert'), ('update'), ('delete')) privileges(privilege_name)
order by role_name, table_name, privilege_name;

select ok(
  not has_table_privilege('service_role', format('public.%I', table_name), privilege_name),
  format('service_role has no direct %s on %s', privilege_name, table_name)
)
from (values
  ('k_drama_early_access'),
  ('ai_communication_early_access'),
  ('k_culture_early_access')
) tables(table_name)
cross join (values ('select'), ('insert'), ('update'), ('delete')) privileges(privilege_name)
order by table_name, privilege_name;

select ok(
  not has_function_privilege('anon', 'public.consume_early_access_rate_limit(text,timestamptz)', 'execute'),
  'anon cannot execute the rate limiter'
);
select ok(
  not has_function_privilege('authenticated', 'public.consume_early_access_rate_limit(text,timestamptz)', 'execute'),
  'authenticated cannot execute the rate limiter'
);
select ok(
  has_function_privilege('service_role', 'public.consume_early_access_rate_limit(text,timestamptz)', 'execute'),
  'service role can execute the rate limiter'
);
select ok(
  not has_function_privilege('anon', 'public.insert_early_access_registration(text,text)', 'execute'),
  'anon cannot execute the registration insert RPC'
);
select ok(
  not has_function_privilege('authenticated', 'public.insert_early_access_registration(text,text)', 'execute'),
  'authenticated cannot execute the registration insert RPC'
);
select ok(
  has_function_privilege('service_role', 'public.insert_early_access_registration(text,text)', 'execute'),
  'service role can execute the registration insert RPC'
);

set local role service_role;
do $$
begin
  perform * from public.insert_early_access_registration('ai-communication', 'duplicate@example.com');
  perform * from public.insert_early_access_registration('ai-communication', 'duplicate@example.com');
  perform * from public.insert_early_access_registration('k-drama', 'drama@example.com');
  perform * from public.insert_early_access_registration('k-culture', 'culture@example.com');
end;
$$;
reset role;
select is(
  (select count(distinct id)::integer from public.ai_communication_early_access where email = 'duplicate@example.com'),
  2,
  'duplicate emails receive distinct ids'
);
select is(
  (select count(created_at)::integer from public.ai_communication_early_access where email = 'duplicate@example.com'),
  2,
  'created_at defaults are populated for duplicate registrations'
);
select is(
  (select count(*)::integer from public.k_drama_early_access where email = 'drama@example.com'),
  1,
  'insert RPC maps k-drama to its dedicated table'
);
select is(
  (select count(*)::integer from public.k_culture_early_access where email = 'culture@example.com'),
  1,
  'insert RPC maps k-culture to its dedicated table'
);
select isnt(
  (select id from public.insert_early_access_registration('ai-communication', 'receipt@example.com')),
  (select id from public.insert_early_access_registration('ai-communication', 'receipt@example.com')),
  'repeated email RPC calls return distinct receipt ids'
);
select throws_ok(
  $$insert into public.k_drama_early_access (email, marketing_consent) values (' learner@example.com ', true)$$,
  '23514',
  null,
  'untrimmed email is rejected'
);
select throws_ok(
  $$insert into public.k_culture_early_access (email, marketing_consent) values ('learner@example.com', false)$$,
  '23514',
  null,
  'false marketing consent is rejected'
);

select is((select allowed from public.consume_early_access_rate_limit(repeat('a', 64), '2026-07-24T00:00:00Z')), true, 'request 1 allowed');
select is((select allowed from public.consume_early_access_rate_limit(repeat('a', 64), '2026-07-24T00:00:01Z')), true, 'request 2 allowed');
select is((select allowed from public.consume_early_access_rate_limit(repeat('a', 64), '2026-07-24T00:00:02Z')), true, 'request 3 allowed');
select is((select allowed from public.consume_early_access_rate_limit(repeat('a', 64), '2026-07-24T00:00:03Z')), true, 'request 4 allowed');
select is((select allowed from public.consume_early_access_rate_limit(repeat('a', 64), '2026-07-24T00:00:04Z')), true, 'request 5 allowed');
select results_eq(
  $$select allowed, retry_after_seconds from public.consume_early_access_rate_limit(repeat('a', 64), '2026-07-24T00:00:59.999Z')$$,
  $$values (false, 1)$$,
  'request 6 is blocked at 59.999 seconds with Retry-After 1'
);
select is((select allowed from public.consume_early_access_rate_limit(repeat('a', 64), '2026-07-24T00:01:00Z')), true, 'oldest event expires exactly at 60 seconds');
select is((select allowed from public.consume_early_access_rate_limit(repeat('b', 64), '2026-07-24T00:00:10Z')), true, 'a different client has an independent budget');

select * from finish();
rollback;
