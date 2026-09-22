-- CodeForge security regression tests.
-- Run with: supabase test db
--
-- These tests are intentionally catalog-focused: they catch accidental
-- privilege/RLS regressions without requiring production credentials.

begin;

select plan(10);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.contact_messages'::regclass),
  'contact_messages has RLS enabled'
);

select ok(
  not has_table_privilege('anon', 'public.contact_messages', 'SELECT'),
  'anon cannot directly SELECT contact_messages'
);

select ok(
  not has_table_privilege('anon', 'public.contact_attachments', 'SELECT'),
  'anon cannot directly SELECT contact_attachments'
);

select ok(
  not has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
  'anon cannot execute the trigger-only handle_new_user function'
);

select ok(
  not has_function_privilege('anon', 'public.tg_set_updated_at()', 'EXECUTE'),
  'anon cannot execute the trigger-only updated_at function'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and not exists (
        select 1
        from unnest(coalesce(p.proconfig, array[]::text[])) cfg
        where cfg like 'search_path=%'
      )
  ),
  'every SECURITY DEFINER function in public pins search_path'
);

select ok(
  not has_table_privilege('anon', 'public.guest_comments', 'INSERT'),
  'anon cannot directly insert guest comments'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.submit_guest_comment(uuid,text,text,text,text)',
    'EXECUTE'
  ),
  'anon cannot execute the guest comment submission RPC'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.submit_guest_comment(uuid,text,text,text,text)',
    'EXECUTE'
  ),
  'service_role can execute the guest comment submission RPC'
);

select ok(
  has_function_privilege(
    'anon',
    'public.increment_post_views(uuid)',
    'EXECUTE'
  ),
  'anon can execute the published-post view counter RPC'
);

select * from finish();

rollback;
