/**
 * _authenticated layout — guards /dashboard and /admin
 *
 * Logic:
 *   1. No session → /auth
 *   2. Has verified TOTP factor BUT session is only AAL1 → /mfa-verify
 *      (handles the case where the user has MFA enrolled but hasn't verified this session)
 *   3. Everything else → allow through
 *
 * MFA is OPTIONAL. If a user has no TOTP factor, they pass through normally.
 * MFA is enforced only when the user HAS enrolled it.
 */
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1. Require a valid session
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user) throw redirect({ to: "/auth" });

    // 2. Check if this user has MFA enrolled
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = (factors?.totp ?? []).length > 0;

    if (hasVerifiedFactor) {
      // User has MFA — enforce AAL2 for this session
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== "aal2") {
        // Session is password-only — redirect to MFA verification
        throw redirect({ to: "/mfa-verify" });
      }
    }
    // No MFA enrolled → pass through normally

    return { user: userData.user };
  },
  component: () => <Outlet />,
});
