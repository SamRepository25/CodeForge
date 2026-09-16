import { createServerFn } from "@tanstack/react-start";
import { verifyTurnstile, getClientIp } from "@/lib/turnstile.server";

const ADMIN_EMAIL = "simakahmed002@gmail.com";
const LOCKOUT_MINUTES = 10;
const MAX_FAILED_ATTEMPTS = 4;

type LockoutRow = {
  failed_attempts: number;
  locked_until: string | null;
};

function validateInput(data: unknown) {
  if (!data || typeof data !== "object") throw new Error("Invalid login request.");
  const value = data as Record<string, unknown>;
  const email = value.email;
  const password = value.password;
  const turnstileToken = value.turnstileToken;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof turnstileToken !== "string"
  ) {
    throw new Error("Invalid login request.");
  }

  return { email: email.trim(), password, turnstileToken };
}

async function getLockout(supabaseAdmin: any): Promise<LockoutRow | null> {
  const { data, error } = await supabaseAdmin.rpc("login_lockout_get");
  if (error) {
    console.error("[login] lockout lookup failed", error);
    throw new Error("Unable to prepare login.");
  }
  return (data?.[0] ?? null) as LockoutRow | null;
}

export const getLoginLockout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid login request.");
    return {};
  })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = await getLockout(supabaseAdmin);
    const lockedUntil = row?.locked_until ?? null;
    const locked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

    return {
      locked,
      lockedUntil: locked ? lockedUntil : null,
      failedAttempts: locked ? (row?.failed_attempts ?? MAX_FAILED_ATTEMPTS) : (row?.failed_attempts ?? 0),
    };
  });

export const loginWithProtection = createServerFn({ method: "POST" })
  .inputValidator(validateInput)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const isAdminEmail = email === ADMIN_EMAIL.toLowerCase();

    // This is an admin-only login endpoint. Do not authenticate other accounts.
    if (!isAdminEmail) {
      return {
        success: false,
        reason: "not_admin" as const,
        error: "Only admins can access this page",
      };
    }

    // Turnstile must pass before a password attempt is allowed to affect lockout state.
    const verified = await verifyTurnstile(data.turnstileToken, getClientIp());
    if (!verified) {
      throw new Error("Human verification failed. Please try again.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const lockRow = await getLockout(supabaseAdmin);
    if (lockRow?.locked_until && new Date(lockRow.locked_until).getTime() > Date.now()) {
      return {
        success: false,
        reason: "locked" as const,
        locked: true,
        lockedUntil: lockRow.locked_until,
        error: "Security lockout. Please try again after 10 minutes.",
      };
    }

    // Password authentication must use the same Supabase project/key pair as the browser client.
    // Prefer the VITE_* values because they are the canonical public Supabase configuration
    // used by src/integrations/supabase/client.ts, with the server-side names as fallback.
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const publishableKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) {
      throw new Error("Supabase server configuration is incomplete.");
    }

    const { createClient } = await import("@supabase/supabase-js");
    const userClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const { data: authData, error: authError } = await userClient.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (authError || !authData.user || !authData.session) {
      const { data: failureRows, error: failureError } = await supabaseAdmin.rpc(
        "login_lockout_record_failure",
      );
      if (failureError) {
        console.error("[login] failed-attempt recording failed", failureError);
        throw new Error("Unable to record login attempt.");
      }

      const failureRow = (failureRows?.[0] ?? null) as LockoutRow | null;
      const lockedUntil = failureRow?.locked_until ?? null;
      const locked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

      return {
        success: false,
        reason: "invalid_credentials" as const,
        locked,
        lockedUntil: locked ? lockedUntil : null,
        failedAttempts: failureRow?.failed_attempts ?? 1,
        remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - (failureRow?.failed_attempts ?? 1)),
        error: locked
          ? `Security lockout. Please try again after ${LOCKOUT_MINUTES} minutes.`
          : "Invalid username or password.",
      };
    }

    const { error: clearError } = await supabaseAdmin.rpc("login_lockout_clear");
    if (clearError) console.error("[login] lockout clear failed", clearError);

    return {
      success: true,
      reason: "success" as const,
      session: authData.session,
    };
  });
