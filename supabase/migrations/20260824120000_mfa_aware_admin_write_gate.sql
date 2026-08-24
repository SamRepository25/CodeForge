-- MFA-aware optional admin write gate
--
-- Security model:
-- 1) Non-admins cannot perform admin writes
-- 2) Admins WITHOUT verified TOTP MFA factor can perform admin writes
-- 3) Admins WITH verified TOTP MFA factor must have AAL2 session

-- ---------------------------------------------------------------------
-- Helper: session assurance is AAL2?
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.session_is_aal2()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt() ->> 'aal') = 'aal2', false)
$$;

-- ---------------------------------------------------------------------
-- Helper: current caller has verified TOTP factor?
-- Uses SECURITY DEFINER for auth schema access.
-- No user_id parameter to avoid arbitrary-user MFA introspection.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_has_verified_mfa_factor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    CASE
      WHEN auth.uid() IS NULL THEN false
      ELSE EXISTS (
        SELECT 1
        FROM auth.mfa_factors f
        WHERE f.user_id = auth.uid()
          AND f.factor_type = 'totp'
          AND f.status = 'verified'
      )
    END
$$;

REVOKE ALL ON FUNCTION public.current_user_has_verified_mfa_factor() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_has_verified_mfa_factor() TO authenticated;

-- ---------------------------------------------------------------------
-- Helper: current caller is allowed admin writes under optional MFA model
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_admin_write_allowed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'admin')
    AND (
      NOT public.current_user_has_verified_mfa_factor()
      OR public.session_is_aal2()
    )
$$;

REVOKE ALL ON FUNCTION public.current_user_admin_write_allowed() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_admin_write_allowed() TO authenticated;

-- ---------------------------------------------------------------------
-- projects: replace admin write policy with MFA-aware gate
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS projects_admin_all ON public.projects;

CREATE POLICY projects_admin_all ON public.projects
FOR ALL
USING (public.current_user_admin_write_allowed())
WITH CHECK (public.current_user_admin_write_allowed());

-- ---------------------------------------------------------------------
-- site_settings: replace exact existing role-only write policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS admin_insert_site_settings ON public.site_settings;
DROP POLICY IF EXISTS admin_update_site_settings ON public.site_settings;
DROP POLICY IF EXISTS admin_delete_site_settings ON public.site_settings;

CREATE POLICY admin_write_site_settings ON public.site_settings
FOR ALL
USING (public.current_user_admin_write_allowed())
WITH CHECK (public.current_user_admin_write_allowed());

-- ---------------------------------------------------------------------
-- experience: replace exact existing role-only write policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS admin_insert_experience ON public.experience;
DROP POLICY IF EXISTS admin_update_experience ON public.experience;
DROP POLICY IF EXISTS admin_delete_experience ON public.experience;

CREATE POLICY admin_write_experience ON public.experience
FOR ALL
USING (public.current_user_admin_write_allowed())
WITH CHECK (public.current_user_admin_write_allowed());

-- ---------------------------------------------------------------------
-- education: replace exact existing role-only write policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS admin_insert_education ON public.education;
DROP POLICY IF EXISTS admin_update_education ON public.education;
DROP POLICY IF EXISTS admin_delete_education ON public.education;

CREATE POLICY admin_write_education ON public.education
FOR ALL
USING (public.current_user_admin_write_allowed())
WITH CHECK (public.current_user_admin_write_allowed());

-- ---------------------------------------------------------------------
-- posts: preserve author ownership behavior; tighten only admin branch
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS posts_author_update ON public.posts;
CREATE POLICY posts_author_update ON public.posts
FOR UPDATE
USING (
  auth.uid() = author_id
  OR public.current_user_admin_write_allowed()
);

DROP POLICY IF EXISTS posts_author_delete ON public.posts;
CREATE POLICY posts_author_delete ON public.posts
FOR DELETE
USING (
  auth.uid() = author_id
  OR public.current_user_admin_write_allowed()
);

-- NOTE:
-- - posts_author_insert intentionally unchanged
-- - published/public read policies intentionally unchanged
-- - guest_comments intentionally untouched
