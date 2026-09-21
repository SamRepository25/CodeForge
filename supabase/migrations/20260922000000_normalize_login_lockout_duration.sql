-- Normalize any active legacy 10-minute login lockout to the current 30-minute policy.
-- The existing lockout is extended only when its stored expiry is shorter than
-- the 30-minute window measured from the lockout record's updated_at.
-- MFA lockouts remain separate and unchanged.

UPDATE public.login_lockouts
SET
  locked_until = updated_at + interval '30 minutes',
  updated_at = now()
WHERE lockout_key = 'admin_password'
  AND locked_until IS NOT NULL
  AND locked_until > now()
  AND locked_until < updated_at + interval '30 minutes';
