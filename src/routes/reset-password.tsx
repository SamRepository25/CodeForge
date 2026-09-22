/**
 * /reset-password — Recovery-session password update.
 *
 * Supabase establishes a recovery session from the email link. We only allow
 * the password update when a valid authenticated recovery session exists, then
 * sign out and send the administrator through the normal MFA login flow.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Code2, Eye, EyeOff, Info, Lock } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — CodeForge" },
      { name: "description", content: "Set a new password for CodeForge administrator access." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://codeforgedev.vercel.app/reset-password" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      setValid(!error && !!data.session);
      setReady(true);
    };

    void checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setValid(true);
        setReady(true);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 12) {
      toast.error("Use a password with at least 12 characters.", { icon: <Info className="h-4 w-4" /> });
      return;
    }

    if (password !== confirmation) {
      toast.error("Passwords do not match.", { icon: <Info className="h-4 w-4" /> });
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      toast.error("Unable to reset the password. The recovery link may have expired.", {
        icon: <Info className="h-4 w-4" />,
      });
      return;
    }

    await supabase.auth.signOut();
    setPassword("");
    setConfirmation("");
    setComplete(true);
  };

  return (
    <SiteLayout>
      <section className="relative mx-auto flex min-h-[80vh] max-w-md items-center px-4">
        <div className="glass-strong gradient-border w-full rounded-3xl p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet to-electric glow-violet">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold">Reset Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set a new password for your CodeForge administrator account.
            </p>
          </div>

          {!ready ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Verifying recovery link…</div>
          ) : complete ? (
            <div className="space-y-5 text-center">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                <p className="mt-3 font-semibold">Password updated</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your password has been changed. Sign in again and complete two-step verification to access the administrator dashboard.
                </p>
              </div>
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
                onClick={() => void navigate({ to: "/auth" })}
              >
                Return to Admin Login
              </Button>
            </div>
          ) : !valid ? (
            <div className="space-y-5 text-center">
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                <p className="font-semibold text-red-300">Invalid or expired link</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Request a new password reset link and try again.
                </p>
              </div>
              <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Request another reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <PasswordField
                id="new-password"
                label="New Password"
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
              />
              <PasswordField
                id="confirm-password"
                label="Confirm New Password"
                value={confirmation}
                onChange={setConfirmation}
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 12 characters. After resetting, administrator access still requires TOTP verification.
              </p>
              <Button
                type="submit"
                disabled={busy || password.length < 12 || confirmation.length < 12}
                className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
              >
                {busy ? "Updating…" : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-13 rounded-xl border-border/80 bg-background/60 pl-11 pr-11"
          autoComplete={id === "new-password" ? "new-password" : "new-password"}
          minLength={12}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
