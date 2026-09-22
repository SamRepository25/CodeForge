import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SecurityTab } from "@/components/SecurityTab";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mfa-setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set Up Two-Step Verification — CodeForge" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user) throw redirect({ to: "/auth" });

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!role) throw redirect({ to: "/auth" });

    const { data: factors } = await supabase.auth.mfa.listFactors();
    if ((factors?.totp ?? []).length > 0) throw redirect({ to: "/dashboard" });

    return { user: userData.user };
  },
  component: MfaSetupPage,
});

function MfaSetupPage() {
  const navigate = useNavigate();

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet to-electric glow-violet">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">Set Up Two-Step Verification</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            CodeForge requires TOTP two-step verification before the administration dashboard
            can be used. Scan the QR code, verify the six-digit code, and save your recovery codes.
          </p>
        </div>

        <SecurityTab requiredSetup onRequiredComplete={() => navigate({ to: "/dashboard" })} />
      </section>
    </SiteLayout>
  );
}
