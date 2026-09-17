create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) between 1 and 64),
  resource text not null check (char_length(resource) between 1 and 64),
  resource_id text null check (char_length(resource_id) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_actor_idx
  on public.admin_audit_log (actor_id, created_at desc);

alter table public.admin_audit_log enable row level security;

revoke all on public.admin_audit_log from anon;
grant select, insert on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;

drop policy if exists admin_audit_select on public.admin_audit_log;
create policy admin_audit_select on public.admin_audit_log
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists admin_audit_insert on public.admin_audit_log;
create policy admin_audit_insert on public.admin_audit_log
for insert to authenticated
with check (
  actor_id = auth.uid()
  and public.current_user_admin_write_allowed()
);

-- No UPDATE or DELETE policy is intentionally provided: application admins can
-- create and read audit records, but cannot rewrite or erase the audit history.