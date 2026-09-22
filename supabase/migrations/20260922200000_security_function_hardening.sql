-- CodeForge security hardening: restrict trigger-only SECURITY DEFINER functions.
--
-- These functions are invoked by PostgreSQL triggers and do not need to be
-- callable through the Data API. Removing PUBLIC/anon/authenticated EXECUTE
-- closes unnecessary RPC exposure while preserving trigger execution.

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;

-- The aggregate RPC is intentionally public because the blog exposes like
-- totals. Keep only the explicitly intended callers.
REVOKE ALL ON FUNCTION public.get_post_like_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_post_like_count(uuid) TO anon, authenticated;

-- has_role() is intentionally callable because it is used by RLS policies.
-- Scope it explicitly rather than relying on PostgreSQL's PUBLIC EXECUTE
-- default for newly-created functions.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
