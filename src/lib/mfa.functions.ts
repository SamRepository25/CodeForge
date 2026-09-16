import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "simakahmed002@gmail.com";
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
  if (error || !data.user || data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Authentication required.");
  }
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

export const verifyMfaCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid MFA request.");
    const value = data as Record<string, unknown>;
    const accessToken = value.accessToken;
    const factorId = value.factorId;
    const challengeId = value.challengeId;
    const code = value.code;
    if (
      typeof accessToken !== "string" ||
      typeof factorId !== "string" ||
      typeof challengeId !== "string" ||
      typeof code !== "string"
    ) {
      throw new Error("Invalid MFA request.");
    }
    if (!/^\d{6}$/.test(code)) throw new Error("Enter a valid 6-digit code.");
    return { accessToken, factorId, challengeId, code };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin, user } = await getAdminUser(data.accessToken);

    const { data: lockRows, error: lockError } = await (supabaseAdmin as any).rpc("mfa_lockout_get", {
      p_user_id: user.id,
    });
    if (lockError) {
      console.error("[mfa] lockout lookup failed", lockError);
      throw new Error("Unable to verify the code.");
    }

    const lockRow = (lockRows?.[0] ?? null) as LockoutRow | null;
    if (lockRow?.locked_until && new Date(lockRow.locked_until).getTime() > Date.now()) {
      return {
        success: false,
        locked: true,
        lockedUntil: lockRow.locked_until,
        error: "Security lockout. Please try again after 10 minutes.",
      };
    }

    // Use the same canonical Supabase project/key configuration as the browser client.
    // Keep the server-side names as a fallback for existing deployments.
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const publishableKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) throw new Error("Supabase server configuration is incomplete.");

    const { createClient } = await import("@supabase/supabase-js");
    const userClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      },
    });

    const { data: verification, error: verifyError } = await userClient.auth.mfa.verify({
      factorId: data.factorId,
      challengeId: data.challengeId,
      code: data.code,
    });

    if (!verifyError) {
      const { error: clearError } = await (supabaseAdmin as any).rpc("mfa_lockout_clear", {
        p_user_id: user.id,
      });
      if (clearError) console.error("[mfa] lockout clear failed", clearError);

      return {
        success: true,
        locked: false,
        session: verification.session ?? null,
      };
    }

    const errorMessage = verifyError.message.toLowerCase();
    if (errorMessage.includes("expired")) {
      return {
        success: false,
        locked: false,
        expired: true,
        error: "Challenge expired.",
      };
    }

    const { data: failureRows, error: failureError } = await (supabaseAdmin as any).rpc(
      "mfa_lockout_record_failure",
      { p_user_id: user.id },
    );
    if (failureError) {
      console.error("[mfa] failed-attempt recording failed", failureError);
      throw new Error("Unable to record verification attempt.");
    }

    const failureRow = (failureRows?.[0] ?? null) as LockoutRow | null;
    const lockedUntil = failureRow?.locked_until ?? null;
    const locked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

    return {
      success: false,
      locked,
      lockedUntil: locked ? lockedUntil : null,
      failedAttempts: failureRow?.failed_attempts ?? 1,
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - (failureRow?.failed_attempts ?? 1)),
      error: locked
        ? `Security lockout. Please try again after ${LOCKOUT_MINUTES} minutes.`
        : "Invalid code. Check your authenticator app.",
    };
  });
