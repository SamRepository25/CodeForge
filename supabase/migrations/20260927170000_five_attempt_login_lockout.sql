-- Set password-login lockout to five failed attempts followed by a 30-minute lock.
-- Keep the database threshold authoritative; the application reads locked_until
-- from this function and blocks subsequent attempts until that timestamp expires.

ALTER TABLE public.login_lockouts
  DROP CONSTRAINT IF EXISTS login_lockouts_failed_attempts_check;

ALTER TABLE public.login_lockouts
  ADD CONSTRAINT login_lockouts_failed_attempts_check
  CHECK (failed_attempts >= 0 AND failed_attempts <= 5);

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
      ELSE LEAST(public.login_lockouts.failed_attempts + 1, 5)
    END,
    locked_until = CASE
      WHEN public.login_lockouts.locked_until IS NOT NULL
           AND public.login_lockouts.locked_until > now()
        THEN public.login_lockouts.locked_until
      WHEN public.login_lockouts.locked_until IS NOT NULL
           AND public.login_lockouts.locked_until <= now()
        THEN NULL
      WHEN public.login_lockouts.failed_attempts + 1 >= 5
        THEN now() + interval '30 minutes'
      ELSE NULL
    END,
    updated_at = now()
  RETURNING public.login_lockouts.failed_attempts, public.login_lockouts.locked_until;
END;
$$;

REVOKE ALL ON FUNCTION public.login_lockout_record_failure(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.login_lockout_record_failure(text) TO service_role;
