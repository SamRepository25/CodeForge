DROP POLICY IF EXISTS comments_public_read ON public.comments;
CREATE POLICY comments_auth_read ON public.comments FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.comments FROM anon;