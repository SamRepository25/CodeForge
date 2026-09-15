-- MFA security lockout: 3 invalid TOTP codes -> 3-minute lockout.
-- The table is server-only. Public/authenticated clients receive no direct access.

CREATE TABLE public.mfa_lockouts (
  user_id uuid PRIMARY KEY,
  failed_attempts smallint NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0 AND failed_attempts <= 3),
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mfa_lockouts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mfa_lockouts FROM anon, authenticated;

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
      ELSE LEAST(public.mfa_lockouts.failed_attempts + 1, 3)
    END,
    locked_until = CASE
      WHEN public.mfa_lockouts.locked_until IS NOT NULL
           AND public.mfa_lockouts.locked_until > now()
        THEN public.mfa_lockouts.locked_until
      WHEN public.mfa_lockouts.failed_attempts + 1 >= 3
        THEN now() + interval '3 minutes'
      ELSE NULL
    END,
    updated_at = now()
  RETURNING public.mfa_lockouts.failed_attempts, public.mfa_lockouts.locked_until
  INTO v_attempts, v_locked_until;

  RETURN QUERY SELECT v_attempts, v_locked_until;
END;
$$;

CREATE OR REPLACE FUNCTION public.mfa_lockout_get(p_user_id uuid)
RETURNS TABLE (failed_attempts smallint, locked_until timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT failed_attempts, locked_until
  FROM public.mfa_lockouts
  WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.mfa_lockout_clear(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.mfa_lockouts WHERE user_id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.mfa_lockout_record_failure(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mfa_lockout_get(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mfa_lockout_clear(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mfa_lockout_record_failure(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mfa_lockout_get(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mfa_lockout_clear(uuid) TO service_role;
