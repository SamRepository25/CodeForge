-- Unify admin authentication lockouts:
-- 4 invalid password attempts -> 10-minute lockout.
-- 4 invalid TOTP codes -> 10-minute lockout.
-- Existing server-only RLS and service_role-only RPC execution are preserved.

ALTER TABLE public.login_lockouts
  DROP CONSTRAINT IF EXISTS login_lockouts_failed_attempts_check;

ALTER TABLE public.login_lockouts
  ADD CONSTRAINT login_lockouts_failed_attempts_check
  CHECK (failed_attempts >= 0 AND failed_attempts <= 4);

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
        THEN now() + interval '10 minutes'
      ELSE NULL
    END,
    updated_at = now()
  RETURNING public.login_lockouts.failed_attempts, public.login_lockouts.locked_until;
END;
$$;

ALTER TABLE public.mfa_lockouts
  DROP CONSTRAINT IF EXISTS mfa_lockouts_failed_attempts_check;

ALTER TABLE public.mfa_lockouts
  ADD CONSTRAINT mfa_lockouts_failed_attempts_check
  CHECK (failed_attempts >= 0 AND failed_attempts <= 4);

CREATE OR REPLACE FUNCTION public.mfa_lockout_record_failure(p_user_id uuid)
RETURNS TABLE (failed_attempts smallint, locked_until timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts smallint;
  v_locked_until timestamptz;
BEGIN
  INSERT INTO public.mfa_lockouts (user_id, failed_attempts, locked_until, updated_at)
  VALUES (p_user_id, 1, NULL, now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    failed_attempts = CASE
      WHEN public.mfa_lockouts.locked_until IS NOT NULL
           AND public.mfa_lockouts.locked_until > now()
        THEN public.mfa_lockouts.failed_attempts
      WHEN public.mfa_lockouts.locked_until IS NOT NULL
           AND public.mfa_lockouts.locked_until <= now()
        THEN 1
      ELSE LEAST(public.mfa_lockouts.failed_attempts + 1, 4)
    END,
    locked_until = CASE
      WHEN public.mfa_lockouts.locked_until IS NOT NULL
           AND public.mfa_lockouts.locked_until > now()
        THEN public.mfa_lockouts.locked_until
      WHEN public.mfa_lockouts.locked_until IS NOT NULL
           AND public.mfa_lockouts.locked_until <= now()
        THEN NULL
      WHEN public.mfa_lockouts.failed_attempts + 1 >= 4
        THEN now() + interval '10 minutes'
      ELSE NULL
    END,
    updated_at = now()
  RETURNING public.mfa_lockouts.failed_attempts, public.mfa_lockouts.locked_until
  INTO v_attempts, v_locked_until;

  RETURN QUERY SELECT v_attempts, v_locked_until;
END;
$$;
