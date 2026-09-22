/**
 * _authenticated layout — guards /dashboard and /admin
 *
 * Logic:
 *   1. No session → /auth
 *   2. No verified TOTP factor → /mfa-setup
 *   3. Has verified TOTP factor BUT session is only AAL1 → /mfa-verify
 *   4. AAL2 session → allow through
 *
 * MFA is mandatory for the admin account.
 *
 * Device-session monitoring:
 *   - Registers the current admin browser/device.
 *   - Periodically asks Supabase Auth whether the session still exists.
 *   - A session revoked from Admin → Devices is therefore detected and the
 *     remote browser is signed out through the normal local logout flow.
 */
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  registerCurrentAdminSession,
  touchCurrentAdminSession,
} from "@/lib/admin-sessions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1. Require a valid session. getUser() performs a network check against
    // Supabase Auth, so revoked remote sessions are not treated as valid.
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user) throw redirect({ to: "/auth" });

    // 2. Check if this user has MFA enrolled
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = (factors?.totp ?? []).length > 0;

    if (!hasVerifiedFactor) {
      throw redirect({ to: "/mfa-setup" });
    }

    {
      // User has MFA — enforce AAL2 for this session
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== "aal2") {
        // Session is password-only — redirect to MFA verification
        throw redirect({ to: "/mfa-verify" });
      }
    }

    return { user: userData.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const monitorSession = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (userError || !userData.user) {
        await supabase.auth.signOut({ scope: "local" });
        if (!cancelled) navigate({ to: "/auth" });
        return;
      }

      // Only admin accounts are registered in the Devices panel. Failure to
      // register must not block the existing authenticated route.
      await registerCurrentAdminSession();
      await touchCurrentAdminSession();
    };

    void monitorSession();
    const timer = window.setInterval(() => void monitorSession(), 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [navigate]);

  return <Outlet />;
}
