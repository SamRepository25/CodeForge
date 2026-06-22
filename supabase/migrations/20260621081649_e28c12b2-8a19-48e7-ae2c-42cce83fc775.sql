
DROP POLICY IF EXISTS comments_auth_read ON public.comments;
CREATE POLICY comments_read_published ON public.comments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND p.published = true)
  );

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_read_public_authors ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    (auth.uid() = id)
    OR EXISTS (SELECT 1 FROM public.posts p WHERE p.author_id = profiles.id AND p.published = true)
  );
