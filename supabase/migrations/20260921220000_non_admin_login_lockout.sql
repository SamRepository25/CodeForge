-- Extend the existing admin login lockout to non-admin login attempts.
-- Four attempts (more than 3) trigger a 30-minute lockout.
-- MFA lockouts remain separate and unchanged.

CREATE OR REPLACE FUNCTION public.login_lockout_record_failure()
RETURNS TABLE (failed_attempts smallint, locked_until timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_lockouts (lockout_key, failed_attempts, locked_until, updated_at)
  VALUES ('admin_password', 1, NULL, now())
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
