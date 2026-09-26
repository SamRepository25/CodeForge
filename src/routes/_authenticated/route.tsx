import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  registerCurrentAdminSession,
  touchCurrentAdminSession,
} from "@/lib/admin-sessions";
import { PrivacyBlur } from "@/components/PrivacyBlur";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user) throw redirect({ to: "/auth" });

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = (factors?.totp ?? []).length > 0;
    if (!hasVerifiedFactor) throw redirect({ to: "/mfa-setup" });

    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel !== "aal2") throw redirect({ to: "/mfa-verify" });

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

  return <PrivacyBlur><Outlet /></PrivacyBlur>;
}
