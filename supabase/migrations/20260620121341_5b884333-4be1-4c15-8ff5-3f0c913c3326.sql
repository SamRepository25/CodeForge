
-- 1) has_role: only the caller may check their own role.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN auth.uid() IS NULL THEN false
      WHEN auth.uid() <> _user_id THEN false
      ELSE EXISTS (
        SELECT 1 FROM public.user_roles
         WHERE user_id = _user_id AND role = _role
      )
    END
$$;

-- 2) likes: remove public read, allow authenticated only.
DROP POLICY IF EXISTS "likes_public_read" ON public.likes;
DROP POLICY IF EXISTS "likes_select" ON public.likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
REVOKE SELECT ON public.likes FROM anon;
CREATE POLICY "likes_auth_read" ON public.likes
  FOR SELECT TO authenticated USING (true);
