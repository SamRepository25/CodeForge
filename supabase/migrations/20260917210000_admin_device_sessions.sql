-- Admin device/session management.
-- The Auth schema is intentionally not exposed through the Data API, so this
-- migration provides tightly scoped SECURITY DEFINER functions for the admin.

create table if not exists public.admin_sessions (
  session_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_agent text not null default '',
  device_type text not null default 'Desktop',
  browser text not null default 'Unknown',
  operating_system text not null default 'Unknown',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.admin_sessions enable row level security;
revoke all on table public.admin_sessions from anon, authenticated, public;

create index if not exists admin_sessions_user_id_idx
  on public.admin_sessions (user_id);

create or replace function public.admin_register_session(
  p_session_id uuid,
  p_user_agent text,
  p_device_type text,
  p_browser text,
  p_operating_system text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  ) then
    return false;
  end if;

  insert into public.admin_sessions (
    session_id,
    user_id,
    user_agent,
    device_type,
    browser,
    operating_system,
    last_seen_at
  )
  values (
    p_session_id,
    (select auth.uid()),
    left(coalesce(p_user_agent, ''), 1000),
    left(coalesce(p_device_type, 'Desktop'), 50),
    left(coalesce(p_browser, 'Unknown'), 100),
    left(coalesce(p_operating_system, 'Unknown'), 100),
    now()
  )
  on conflict (session_id) do update
    set user_agent = excluded.user_agent,
        device_type = excluded.device_type,
        browser = excluded.browser,
        operating_system = excluded.operating_system,
        last_seen_at = now()
    where public.admin_sessions.user_id = (select auth.uid());

  return true;
end;
$$;

create or replace function public.admin_touch_session(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  touched integer;
begin
  update public.admin_sessions
  set last_seen_at = now()
  where session_id = p_session_id
    and user_id = (select auth.uid())
    and exists (
      select 1
      from public.user_roles
      where user_id = (select auth.uid())
        and role = 'admin'
    )
    and exists (
      select 1
      from auth.sessions
      where id = p_session_id
        and user_id = (select auth.uid())
    );

  get diagnostics touched = row_count;
  return touched = 1;
end;
$$;

create or replace function public.admin_list_sessions()
returns table (
  session_id uuid,
  device_type text,
  browser text,
  operating_system text,
  user_agent text,
  created_at timestamptz,
  last_seen_at timestamptz,
  is_current boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_session_id uuid;
begin
  if not exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  ) then
    return;
  end if;

  begin
    current_session_id := ((select auth.jwt() ->> 'session_id')::uuid);
  exception when others then
    current_session_id := null;
  end;

  -- Remove local registry records whose real Supabase Auth sessions no longer exist.
  delete from public.admin_sessions a
  where a.user_id = (select auth.uid())
    and not exists (
      select 1
      from auth.sessions s
      where s.id = a.session_id
        and s.user_id = a.user_id
    );

  return query
  select
    a.session_id,
    a.device_type,
    a.browser,
    a.operating_system,
    a.user_agent,
    s.created_at,
    a.last_seen_at,
    a.session_id = current_session_id
  from public.admin_sessions a
  join auth.sessions s
    on s.id = a.session_id
   and s.user_id = a.user_id
  where a.user_id = (select auth.uid())
  order by a.last_seen_at desc;
end;
$$;

create or replace function public.admin_revoke_session(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_session_id uuid;
  removed integer;
begin
  if not exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  ) then
    return false;
  end if;

  current_session_id := ((select auth.jwt() ->> 'session_id')::uuid);

  if p_session_id = current_session_id then
    raise exception 'The current session cannot be revoked from another-device logout.';
  end if;

  delete from auth.sessions
  where id = p_session_id
    and user_id = (select auth.uid());

  get diagnostics removed = row_count;

  if removed = 1 then
    delete from public.admin_sessions
    where session_id = p_session_id
      and user_id = (select auth.uid());
    return true;
  end if;

  return false;
end;
$$;

revoke execute on function public.admin_register_session(uuid, text, text, text, text) from public, anon;
revoke execute on function public.admin_touch_session(uuid) from public, anon;
revoke execute on function public.admin_list_sessions() from public, anon;
revoke execute on function public.admin_revoke_session(uuid) from public, anon;

grant execute on function public.admin_register_session(uuid, text, text, text, text) to authenticated;
grant execute on function public.admin_touch_session(uuid) to authenticated;
grant execute on function public.admin_list_sessions() to authenticated;
grant execute on function public.admin_revoke_session(uuid) to authenticated;
