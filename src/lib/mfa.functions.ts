import { createServerFn } from "@tanstack/react-start";

const LOCKOUT_MINUTES = 10;
const MAX_FAILED_ATTEMPTS = 4;

type LockoutRow = {
  failed_attempts: number;
  locked_until: string | null;
};

function validateInput(data: unknown) {
  if (!data || typeof data !== "object") throw new Error("Invalid MFA request.");
  const value = data as Record<string, unknown>;
  const accessToken = value.accessToken;
  if (typeof accessToken !== "string" || !accessToken) throw new Error("Authentication required.");
  return { accessToken };
}

async function getAdminUser(accessToken: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Authentication required.");

  const { data: role, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError || !role) throw new Error("Authentication required.");

  return { supabaseAdmin, user: data.user };
}

export const getMfaLockout = createServerFn({ method: "POST" })
  .inputValidator(validateInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin, user } = await getAdminUser(data.accessToken);
    const { data: rows, error } = await (supabaseAdmin as any).rpc("mfa_lockout_get", {
      p_user_id: user.id,
    });
    if (error) {
      console.error("[mfa] lockout lookup failed", error);
      throw new Error("Unable to prepare verification.");
    }

    const row = (rows?.[0] ?? null) as LockoutRow | null;
    const lockedUntil = row?.locked_until ?? null;
    const isLocked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

    return {
      locked: isLocked,
      lockedUntil: isLocked ? lockedUntil : null,
      failedAttempts: isLocked ? (row?.failed_attempts ?? MAX_FAILED_ATTEMPTS) : 0,
    };
  });

export const recordMfaFailure = createServerFn({ method: "POST" })
  .inputValidator(validateInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin, user } = await getAdminUser(data.accessToken);
    const { data: failureRows, error } = await (supabaseAdmin as any).rpc(
      "mfa_lockout_record_failure",
      { p_user_id: user.id },
    );
    if (error) {
      console.error("[mfa] failed-attempt recording failed", error);
      throw new Error("Unable to record verification attempt.");
    }

    const failureRow = (failureRows?.[0] ?? null) as LockoutRow | null;
    const lockedUntil = failureRow?.locked_until ?? null;
    const locked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

    return {
      locked,
      lockedUntil: locked ? lockedUntil : null,
      failedAttempts: failureRow?.failed_attempts ?? 1,
      remainingAttempts: Math.max(
        0,
        MAX_FAILED_ATTEMPTS - (failureRow?.failed_attempts ?? 1),
      ),
    };
  });

export const clearMfaLockout = createServerFn({ method: "POST" })
  .inputValidator(validateInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin, user } = await getAdminUser(data.accessToken);
    const { error } = await (supabaseAdmin as any).rpc("mfa_lockout_clear", {
      p_user_id: user.id,
    });
    if (error) console.error("[mfa] lockout clear failed", error);
    return { success: !error };
  });
