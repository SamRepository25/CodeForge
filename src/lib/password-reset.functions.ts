import { createServerFn } from "@tanstack/react-start";
import { verifyTurnstile, getClientIp } from "@/lib/turnstile.server";

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid password reset request.");
    const value = data as Record<string, unknown>;
    if (typeof value.email !== "string" || typeof value.turnstileToken !== "string") {
      throw new Error("Invalid password reset request.");
    }
    return {
      email: value.email.trim().toLowerCase(),
      turnstileToken: value.turnstileToken,
    };
  })
  .handler(async ({ data }) => {
    const ip = getClientIp();
    const verified = await verifyTurnstile(data.turnstileToken, ip, "password_reset");
    if (!verified) throw new Error("Human verification failed. Please try again.");

    // Resolve the administrator email server-side from the role assignment.
    // Never trust the submitted address or expose service-role credentials.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: adminRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (roleError) {
      console.error("[password-reset] admin role lookup failed", roleError);
      throw new Error("Unable to process the request.");
    }

    let adminEmailMatches = false;
    for (const role of adminRoles ?? []) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(role.user_id);
      if (userError) {
        console.error("[password-reset] admin user lookup failed", userError);
        throw new Error("Unable to process the request.");
      }
      if (userData.user?.email?.trim().toLowerCase() === data.email) {
        adminEmailMatches = true;
        break;
      }
    }

    if (!adminEmailMatches) return { success: false as const, reason: "invalid_email" as const };

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const publishableKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) throw new Error("Supabase server configuration is incomplete.");

    const { createClient } = await import("@supabase/supabase-js");
    const userClient = createClient(supabaseUrl, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });

    const { error } = await userClient.auth.resetPasswordForEmail(data.email, {
      redirectTo: "https://codeforgedev.vercel.app/reset-password",
    });

    if (error) throw new Error("Unable to process the request.");

    return { success: true as const };
  });
