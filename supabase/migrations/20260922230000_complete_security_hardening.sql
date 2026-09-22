-- Complete security hardening follow-up.
--
-- Keeps production and migration history aligned and closes the remaining
-- repository-audit findings:
--   * atomic, per-IP login lockouts instead of one global lockout
--   * atomic contact-form rate limiting
--   * explicit removal of the legacy guest-comment INSERT policy
--   * mandatory AAL2 for admin data/storage writes and admin sessions
--   * owner-only recovery-code storage
--
-- All SECURITY DEFINER functions below pin search_path and are restricted
-- to the roles that actually need to call them.

-- ---------------------------------------------------------------------------
-- Login lockout: scope the lockout to a hashed client IP.
-- ---------------------------------------------------------------------------

ALTER TABLE public.login_lockouts
  DROP CONSTRAINT IF EXISTS login_lockouts_lockout_key_check;

ALTER TABLE public.login_lockouts
  ADD CONSTRAINT login_lockouts_lockout_key_check
  CHECK (lockout_key ~ '^admin_password:[0-9a-f]{64}$');

DELETE FROM public.login_lockouts
WHERE lockout_key = 'admin_password';

DROP FUNCTION IF EXISTS public.login_lockout_get();
DROP FUNCTION IF EXISTS public.login_lockout_record_failure();
DROP FUNCTION IF EXISTS public.login_lockout_clear();

CREATE OR REPLACE FUNCTION public.login_lockout_get(p_lockout_key text)
RETURNS TABLE (failed_attempts smallint, locked_until timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT failed_attempts, locked_until
  FROM public.login_lockouts
  WHERE lockout_key = p_lockout_key;
$$;

CREATE OR REPLACE FUNCTION public.login_lockout_record_failure(p_lockout_key text)
RETURNS TABLE (failed_attempts smallint, locked_until timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_lockout_key IS NULL OR p_lockout_key !~ '^admin_password:[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid lockout key';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_lockout_key));

  INSERT INTO public.login_lockouts (lockout_key, failed_attempts, locked_until, updated_at)
  VALUES (p_lockout_key, 1, NULL, now())
  ON CONFLICT (lockout_key) DO UPDATE
  SET
    failed_attempts = CASE
      WHEN public.login_lockouts.locked_until IS NOT NULL
           AND public.login_lockouts.locked_until > now()
        THEN public.login_lockouts.failed_attempts
      WHEN public.login_lockouts.locked_until IS NOT NULL
           AND public.login_lockouts.locked_until <= now()
        THEN 1
      ELSE LEAST(public.login_lockouts.failed_attempts + 1, 4)
    END,
    locked_until = CASE
      WHEN public.login_lockouts.locked_until IS NOT NULL
           AND public.login_lockouts.locked_until > now()
        THEN public.login_lockouts.locked_until
      WHEN public.login_lockouts.locked_until IS NOT NULL
           AND public.login_lockouts.locked_until <= now()
        THEN NULL
      WHEN public.login_lockouts.failed_attempts + 1 >= 4
        THEN now() + interval '30 minutes'
      ELSE NULL
    END,
    updated_at = now()
  RETURNING public.login_lockouts.failed_attempts, public.login_lockouts.locked_until;
END;
$$;

CREATE OR REPLACE FUNCTION public.login_lockout_clear(p_lockout_key text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.login_lockouts
  WHERE lockout_key = p_lockout_key;
$$;

REVOKE ALL ON FUNCTION public.login_lockout_get(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.login_lockout_record_failure(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.login_lockout_clear(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.login_lockout_get(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.login_lockout_record_failure(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.login_lockout_clear(text) TO service_role;

-- ---------------------------------------------------------------------------
-- Guest comments: remove any legacy direct-insert policy explicitly.
-- ---------------------------------------------------------------------------

REVOKE INSERT ON public.guest_comments FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS guest_comments_insert ON public.guest_comments;

-- ---------------------------------------------------------------------------
-- Contact form: serialize rate-limit check + insert for each hashed IP.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.submit_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_ip_hash text
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_count integer;
BEGIN
  IF p_name IS NULL OR char_length(trim(p_name)) NOT BETWEEN 1 AND 200
     OR p_email IS NULL OR char_length(trim(p_email)) NOT BETWEEN 3 AND 320
     OR p_subject IS NOT NULL AND char_length(trim(p_subject)) > 200
     OR p_message IS NULL OR char_length(trim(p_message)) NOT BETWEEN 1 AND 5000
     OR p_ip_hash IS NULL OR char_length(p_ip_hash) <> 64
  THEN
    RAISE EXCEPTION 'Invalid contact submission';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_ip_hash));

  SELECT count(*)::integer
  INTO v_count
  FROM public.contact_messages
  WHERE ip_hash = p_ip_hash
    AND created_at >= now() - interval '1 hour';

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Contact rate limit exceeded';
  END IF;

  INSERT INTO public.contact_messages (name, email, subject, message, ip_hash)
  VALUES (
    trim(p_name),
    trim(p_email),
    NULLIF(trim(p_subject), ''),
    trim(p_message),
    p_ip_hash
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_contact_message(text, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_contact_message(text, text, text, text, text)
  TO service_role;

-- ---------------------------------------------------------------------------
-- Admin authorization: every admin write/session-management operation
-- requires an AAL2 session, not merely an enrolled factor.
-- ---------------------------------------------------------------------------

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
    AND public.session_is_aal2()
$$;

REVOKE ALL ON FUNCTION public.current_user_admin_write_allowed() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_admin_write_allowed() TO authenticated;

-- Sensitive admin reads are AAL2-gated as well.
DROP POLICY IF EXISTS contact_messages_admin_read ON public.contact_messages;
CREATE POLICY contact_messages_admin_read ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.current_user_admin_write_allowed());

DROP POLICY IF EXISTS contact_attachments_admin_read ON public.contact_attachments;
CREATE POLICY contact_attachments_admin_read ON public.contact_attachments
  FOR SELECT
  TO authenticated
  USING (public.current_user_admin_write_allowed());

-- Site media is public content, but its management surface is admin-only.
DROP POLICY IF EXISTS "Admins can list site media" ON storage.objects;
CREATE POLICY "Admins can list site media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-media'
  AND public.current_user_admin_write_allowed()
);

DROP POLICY IF EXISTS "Admins can upload site media" ON storage.objects;
CREATE POLICY "Admins can upload site media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-media'
  AND public.current_user_admin_write_allowed()
);

DROP POLICY IF EXISTS "Admins can update site media" ON storage.objects;
CREATE POLICY "Admins can update site media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-media'
  AND public.current_user_admin_write_allowed()
)
WITH CHECK (
  bucket_id = 'site-media'
  AND public.current_user_admin_write_allowed()
);

DROP POLICY IF EXISTS "Admins can delete site media" ON storage.objects;
CREATE POLICY "Admins can delete site media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-media'
  AND public.current_user_admin_write_allowed()
);

DROP POLICY IF EXISTS admin_audit_select ON public.admin_audit_log;
CREATE POLICY admin_audit_select ON public.admin_audit_log
FOR SELECT TO authenticated
USING (public.current_user_admin_write_allowed());

-- ---------------------------------------------------------------------------
-- Admin device/session functions: require AAL2.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_register_session(
  p_session_id uuid,
  p_user_agent text,
  p_device_type text,
  p_browser text,
  p_operating_system text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (select auth.uid()) IS NULL
     OR (select auth.jwt() ->> 'aal') <> 'aal2'
     OR NOT EXISTS (
       SELECT 1
       FROM public.user_roles
       WHERE user_id = (select auth.uid())
         AND role = 'admin'
     )
  THEN
    RETURN false;
  END IF;

  INSERT INTO public.admin_sessions (
    session_id, user_id, user_agent, device_type, browser, operating_system, last_seen_at
  )
  VALUES (
    p_session_id,
    (select auth.uid()),
    left(coalesce(p_user_agent, ''), 1000),
    left(coalesce(p_device_type, 'Desktop'), 50),
    left(coalesce(p_browser, 'Unknown'), 100),
    left(coalesce(p_operating_system, 'Unknown'), 100),
    now()
  )
  ON CONFLICT (session_id) DO UPDATE
    SET user_agent = excluded.user_agent,
        device_type = excluded.device_type,
        browser = excluded.browser,
        operating_system = excluded.operating_system,
        last_seen_at = now()
    WHERE public.admin_sessions.user_id = (select auth.uid());

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_touch_session(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  touched integer;
BEGIN
  UPDATE public.admin_sessions
  SET last_seen_at = now()
  WHERE session_id = p_session_id
    AND user_id = (select auth.uid())
    AND (select auth.jwt() ->> 'aal') = 'aal2'
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = (select auth.uid())
        AND role = 'admin'
    )
    AND EXISTS (
      SELECT 1
      FROM auth.sessions
      WHERE id = p_session_id
        AND user_id = (select auth.uid())
    );

  GET DIAGNOSTICS touched = ROW_COUNT;
  RETURN touched = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_sessions()
RETURNS TABLE (
  session_id uuid,
  device_type text,
  browser text,
  operating_system text,
  user_agent text,
  created_at timestamptz,
  last_seen_at timestamptz,
  is_current boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_session_id uuid;
BEGIN
  IF (select auth.uid()) IS NULL
     OR (select auth.jwt() ->> 'aal') <> 'aal2'
     OR NOT EXISTS (
       SELECT 1
       FROM public.user_roles
       WHERE user_id = (select auth.uid())
         AND role = 'admin'
     )
  THEN
    RETURN;
  END IF;

  BEGIN
    current_session_id := ((select auth.jwt() ->> 'session_id')::uuid);
  EXCEPTION WHEN others THEN
    current_session_id := null;
  END;

  DELETE FROM public.admin_sessions a
  WHERE a.user_id = (select auth.uid())
    AND NOT EXISTS (
      SELECT 1
      FROM auth.sessions s
      WHERE s.id = a.session_id
        AND s.user_id = a.user_id
    );

  RETURN QUERY
  SELECT a.session_id, a.device_type, a.browser, a.operating_system,
         a.user_agent, s.created_at, a.last_seen_at,
         a.session_id = current_session_id
  FROM public.admin_sessions a
  JOIN auth.sessions s
    ON s.id = a.session_id
   AND s.user_id = a.user_id
  WHERE a.user_id = (select auth.uid())
  ORDER BY a.last_seen_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_session(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_session_id uuid;
  removed integer;
BEGIN
  IF (select auth.uid()) IS NULL
     OR (select auth.jwt() ->> 'aal') <> 'aal2'
     OR NOT EXISTS (
       SELECT 1
       FROM public.user_roles
       WHERE user_id = (select auth.uid())
         AND role = 'admin'
     )
  THEN
    RETURN false;
  END IF;

  current_session_id := ((select auth.jwt() ->> 'session_id')::uuid);

  IF p_session_id = current_session_id THEN
    RAISE EXCEPTION 'The current session cannot be revoked from another-device logout.';
  END IF;

  DELETE FROM auth.sessions
  WHERE id = p_session_id
    AND user_id = (select auth.uid());

  GET DIAGNOSTICS removed = ROW_COUNT;

  IF removed = 1 THEN
    DELETE FROM public.admin_sessions
    WHERE session_id = p_session_id
      AND user_id = (select auth.uid());
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Recovery-code storage is user-private. The application still writes only
-- hashes, never plaintext codes.
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL CHECK (char_length(code_hash) = 64),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.recovery_codes FROM anon;
GRANT SELECT, INSERT, DELETE ON public.recovery_codes TO authenticated;

DROP POLICY IF EXISTS recovery_codes_self_select ON public.recovery_codes;
CREATE POLICY recovery_codes_self_select ON public.recovery_codes
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS recovery_codes_self_insert ON public.recovery_codes;
CREATE POLICY recovery_codes_self_insert ON public.recovery_codes
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS recovery_codes_self_delete ON public.recovery_codes;
CREATE POLICY recovery_codes_self_delete ON public.recovery_codes
FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS recovery_codes_user_id_idx
  ON public.recovery_codes (user_id);
