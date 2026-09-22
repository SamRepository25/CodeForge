-- CodeForge security regression tests.
-- Run with: supabase test db
--
-- These tests are intentionally catalog-focused: they catch accidental
-- privilege/RLS regressions without requiring production credentials.

begin;

select plan(6);

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

select * from finish();

rollback;
