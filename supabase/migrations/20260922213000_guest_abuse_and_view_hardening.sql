-- Security hardening: protect guest comments and make post view increments atomic.
--
-- Guest comments are now accepted only through the trusted server function,
-- which verifies Cloudflare Turnstile and rate-limits by a salted IP hash.
-- Public readers retain SELECT access to approved comments.
ALTER TABLE public.guest_comments
  ADD COLUMN IF NOT EXISTS ip_hash text;

CREATE INDEX IF NOT EXISTS guest_comments_ip_hash_created_idx
  ON public.guest_comments (ip_hash, created_at DESC);

REVOKE INSERT ON public.guest_comments FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.guest_comments FROM anon;

-- Atomic, published-post-only view counter. The function intentionally
-- exposes no row data and cannot update unpublished posts.
CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id uuid)
RETURNS integer
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.posts
  SET views = views + 1
  WHERE id = p_post_id
    AND published = true
  RETURNING views;
$$;

REVOKE ALL ON FUNCTION public.increment_post_views(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;

-- The legacy authenticated-user comments table is no longer used by CodeForge.
-- Keep the table for migration compatibility, but remove anonymous access.
REVOKE ALL ON public.comments FROM anon;
DROP POLICY IF EXISTS comments_public_read ON public.comments;
DROP POLICY IF EXISTS comments_read_published ON public.comments;
