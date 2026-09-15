-- Admin password security lockout: 5 invalid password attempts -> 10-minute lockout.
-- Server-only state. Public clients receive no direct access.

CREATE TABLE public.login_lockouts (
  lockout_key text PRIMARY KEY CHECK (lockout_key = 'admin_password'),
  failed_attempts smallint NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0 AND failed_attempts <= 5),
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_lockouts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.login_lockouts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.login_lockout_get()
RETURNS TABLE (failed_attempts smallint, locked_until timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT failed_attempts, locked_until
  FROM public.login_lockouts
  WHERE lockout_key = 'admin_password';
$$;

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
        THEN now() + interval '10 minutes'
      ELSE NULL
    END,
    updated_at = now()
  RETURNING public.login_lockouts.failed_attempts, public.login_lockouts.locked_until;
END;
$$;

CREATE OR REPLACE FUNCTION public.login_lockout_clear()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.login_lockouts WHERE lockout_key = 'admin_password';
$$;

REVOKE ALL ON FUNCTION public.login_lockout_get() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.login_lockout_record_failure() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.login_lockout_clear() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.login_lockout_get() TO service_role;
GRANT EXECUTE ON FUNCTION public.login_lockout_record_failure() TO service_role;
GRANT EXECUTE ON FUNCTION public.login_lockout_clear() TO service_role;
