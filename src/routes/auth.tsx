/**
 * /auth — Admin Login
 *
 * Flow after successful password login:
 *   - If user has a verified TOTP factor → /mfa-verify (must pass MFA before dashboard)
 *   - If user has NO TOTP factor → /dashboard (MFA is optional, enrolled via Security tab)
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Code2, Mail, Lock, Info } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login — CodeForge" },
      { name: "description", content: "Secure access to the CodeForge administration dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://codeforgedev.vercel.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });

    if (error) {
      setBusy(false);
      toast.info("Only admins can access this page");
      return;
    }

    // Check if user has MFA enrolled
    // data.totp only contains VERIFIED factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasTotp = (factors?.totp ?? []).length > 0;

    setBusy(false);

    if (hasTotp) {
      // Must verify MFA before accessing dashboard
      navigate({ to: "/mfa-verify" });
    } else {
      // No MFA enrolled → go straight to dashboard
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <SiteLayout>
      <section className="relative mx-auto flex min-h-[80vh] max-w-md items-center px-4">
        <div className="glass-strong gradient-border w-full rounded-3xl p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet to-electric glow-violet">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold">Admin Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Secure access to the CodeForge administration dashboard.
            </p>
          </div>
          <form onSubmit={signIn} className="space-y-4">
            <Field name="email" label="Email" type="email" icon={Mail} required />
            <Field name="password" label="Password" type="password" icon={Lock} required />
            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            >
              {busy ? "Signing in…" : "Login"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  name, label, type, icon: Icon, required,
}: {
  name: string; label: string; type: string;
  icon: React.ComponentType<{ className?: string }>; required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={name} name={name} type={type} required={required} className="rounded-xl pl-9" />
      </div>
    </div>
  );
}
