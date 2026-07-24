create table public.k_drama_early_access (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = btrim(email) and length(email) between 1 and 254),
  marketing_consent boolean not null check (marketing_consent is true),
  created_at timestamptz not null default now()
);

create table public.ai_communication_early_access (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = btrim(email) and length(email) between 1 and 254),
  marketing_consent boolean not null check (marketing_consent is true),
  created_at timestamptz not null default now()
);

create table public.k_culture_early_access (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = btrim(email) and length(email) between 1 and 254),
  marketing_consent boolean not null check (marketing_consent is true),
  created_at timestamptz not null default now()
);

alter table public.k_drama_early_access enable row level security;
alter table public.k_drama_early_access force row level security;
alter table public.ai_communication_early_access enable row level security;
alter table public.ai_communication_early_access force row level security;
alter table public.k_culture_early_access enable row level security;
alter table public.k_culture_early_access force row level security;

revoke all on table public.k_drama_early_access from anon, authenticated;
revoke all on table public.ai_communication_early_access from anon, authenticated;
revoke all on table public.k_culture_early_access from anon, authenticated;
revoke all on table public.k_drama_early_access from service_role;
revoke all on table public.ai_communication_early_access from service_role;
revoke all on table public.k_culture_early_access from service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.early_access_rate_limit_events (
  id bigint generated always as identity primary key,
  client_key text not null,
  attempted_at timestamptz not null
);

create index early_access_rate_limit_events_lookup
  on private.early_access_rate_limit_events (client_key, attempted_at);
create index early_access_rate_limit_events_expiry
  on private.early_access_rate_limit_events (attempted_at);

revoke all on table private.early_access_rate_limit_events from public, anon, authenticated;

create or replace function public.consume_early_access_rate_limit(
  p_client_key text,
  p_now timestamptz default clock_timestamp()
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
declare
  oldest_attempt timestamptz;
  request_count integer;
begin
  if p_client_key is null or length(p_client_key) < 32 then
    raise exception 'invalid client key';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_client_key, 0));

  delete from private.early_access_rate_limit_events
  where attempted_at <= p_now - interval '60 seconds';

  select count(*), min(attempted_at)
  into request_count, oldest_attempt
  from private.early_access_rate_limit_events
  where client_key = p_client_key
    and attempted_at > p_now - interval '60 seconds';

  if request_count >= 5 then
    allowed := false;
    retry_after_seconds := greatest(
      1,
      least(60, ceil(extract(epoch from (oldest_attempt + interval '60 seconds' - p_now)))::integer)
    );
    return next;
    return;
  end if;

  insert into private.early_access_rate_limit_events (client_key, attempted_at)
  values (p_client_key, p_now);
  allowed := true;
  retry_after_seconds := 0;
  return next;
end;
$$;

revoke all on function public.consume_early_access_rate_limit(text, timestamptz) from public, anon, authenticated;
grant execute on function public.consume_early_access_rate_limit(text, timestamptz) to service_role;

create or replace function public.insert_early_access_registration(p_project_id text, p_email text)
returns table (id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_email is null
    or p_email <> btrim(p_email)
    or length(p_email) not between 1 and 254
    or p_email !~ '^[^@[:space:][:cntrl:]]+@[^@[:space:][:cntrl:]]+\.[^@[:space:][:cntrl:]]+$' then
    raise exception 'invalid registration';
  end if;
  case p_project_id
    when 'k-drama' then return query insert into public.k_drama_early_access (email, marketing_consent) values (p_email, true) returning k_drama_early_access.id, k_drama_early_access.created_at;
    when 'ai-communication' then return query insert into public.ai_communication_early_access (email, marketing_consent) values (p_email, true) returning ai_communication_early_access.id, ai_communication_early_access.created_at;
    when 'k-culture' then return query insert into public.k_culture_early_access (email, marketing_consent) values (p_email, true) returning k_culture_early_access.id, k_culture_early_access.created_at;
    else raise exception 'unknown project';
  end case;
end;
$$;

revoke all on function public.insert_early_access_registration(text, text) from public, anon, authenticated;
grant execute on function public.insert_early_access_registration(text, text) to service_role;
