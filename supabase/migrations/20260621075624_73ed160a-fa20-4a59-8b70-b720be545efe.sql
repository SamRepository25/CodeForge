DROP POLICY IF EXISTS likes_auth_read ON public.likes;

CREATE POLICY likes_select_own ON public.likes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_post_like_count(_post_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*), 0)::int FROM public.likes WHERE post_id = _post_id
$$;

REVOKE ALL ON FUNCTION public.get_post_like_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_post_like_count(uuid) TO anon, authenticated;