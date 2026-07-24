revoke all on table public.k_drama_early_access from service_role;
revoke all on table public.ai_communication_early_access from service_role;
revoke all on table public.k_culture_early_access from service_role;

alter table private.early_access_rate_limit_events
  add column if not exists id bigint generated always as identity;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'private.early_access_rate_limit_events'::regclass and contype = 'p') then
    alter table private.early_access_rate_limit_events add constraint early_access_rate_limit_events_pkey primary key (id);
  end if;
end;
$$;

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
