import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { verifyTurnstile, getClientIp } from "@/lib/turnstile.server";

const LOCKOUT_MINUTES = 30;
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

  return { email: email.trim().toLowerCase(), password, turnstileToken };
}

function getLockoutKey(ip: string): string {
  const salt = process.env.LOGIN_IP_HASH_SALT ?? "codeforge-login";
  const hash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  return `admin_password:${hash}`;
}

async function getLockout(supabaseAdmin: any, lockoutKey: string): Promise<LockoutRow | null> {
  const { data, error } = await supabaseAdmin.rpc("login_lockout_get", {
    p_lockout_key: lockoutKey,
  });
  if (error) {
    console.error("[login] lockout lookup failed", error);
    throw new Error("Unable to prepare login.");
  }
  return (data?.[0] ?? null) as LockoutRow | null;
}

async function recordFailure(supabaseAdmin: any, lockoutKey: string) {
  const { data, error } = await supabaseAdmin.rpc("login_lockout_record_failure", {
    p_lockout_key: lockoutKey,
  });
  if (error) {
    console.error("[login] failed-attempt recording failed", error);
    throw new Error("Unable to record login attempt.");
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
    const lockoutKey = getLockoutKey(getClientIp());
    const row = await getLockout(supabaseAdmin, lockoutKey);
    const lockedUntil = row?.locked_until ?? null;
    const locked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

    return {
      locked,
      lockedUntil: locked ? lockedUntil : null,
      failedAttempts: locked
        ? (row?.failed_attempts ?? MAX_FAILED_ATTEMPTS)
        : (row?.failed_attempts ?? 0),
    };
  });

export const loginWithProtection = createServerFn({ method: "POST" })
  .inputValidator(validateInput)
  .handler(async ({ data }) => {
    const ip = getClientIp();
    const lockoutKey = getLockoutKey(ip);

    // Turnstile must pass before an authentication attempt can affect lockout state.
    const verified = await verifyTurnstile(data.turnstileToken, ip, "login");
    if (!verified) {
      throw new Error("Human verification failed. Please try again.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const lockRow = await getLockout(supabaseAdmin, lockoutKey);

    if (lockRow?.locked_until && new Date(lockRow.locked_until).getTime() > Date.now()) {
      return {
        success: false,
        reason: "locked" as const,
        locked: true,
        lockedUntil: lockRow.locked_until,
        error: `Security lockout. Please try again after ${LOCKOUT_MINUTES} minutes.`,
      };
    }

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
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user || !authData.session) {
      const failureRow = await recordFailure(supabaseAdmin, lockoutKey);
      const lockedUntil = failureRow?.locked_until ?? null;
      const locked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

      return {
        success: false,
        reason: "invalid_credentials" as const,
        locked,
        lockedUntil: locked ? lockedUntil : null,
        failedAttempts: failureRow?.failed_attempts ?? 1,
        remainingAttempts: Math.max(
          0,
          MAX_FAILED_ATTEMPTS - (failureRow?.failed_attempts ?? 1),
        ),
        error: locked
          ? `Security lockout. Please try again after ${LOCKOUT_MINUTES} minutes.`
          : "Invalid username or password.",
      };
    }

    // Authorization is role-based, not based on a hard-coded email address.
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleRow) {
      await userClient.auth.signOut();
      const failureRow = await recordFailure(supabaseAdmin, lockoutKey);
      const lockedUntil = failureRow?.locked_until ?? null;
      const locked = !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();

      return {
        success: false,
        reason: locked ? ("locked" as const) : ("invalid_credentials" as const),
        locked,
        lockedUntil: locked ? lockedUntil : null,
        failedAttempts: failureRow?.failed_attempts ?? 1,
        remainingAttempts: Math.max(
          0,
          MAX_FAILED_ATTEMPTS - (failureRow?.failed_attempts ?? 1),
        ),
        error: locked
          ? `Security lockout. Please try again after ${LOCKOUT_MINUTES} minutes.`
          : "Invalid username or password.",
      };
    }

    const { error: clearError } = await supabaseAdmin.rpc("login_lockout_clear", {
      p_lockout_key: lockoutKey,
    });
    if (clearError) console.error("[login] lockout clear failed", clearError);

    return {
      success: true,
      reason: "success" as const,
      session: authData.session,
    };
  });
