/**
 * /auth — Admin Login
 *
 * Flow after successful password login:
 *   - Only the configured admin email can continue
 *   - Four invalid admin password attempts trigger a 10-minute server-side lockout
 *   - If the admin has a verified TOTP factor → /mfa-verify
 *   - Otherwise → /dashboard
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Code2, Mail, Lock, Eye, EyeOff, Info } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { getLoginLockout, loginWithProtection } from "@/lib/login.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_EMAIL = "simakahmed002@gmail.com";

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

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
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileResetKey((key) => key + 1);
  };

  useEffect(() => {
    let active = true;

    getLoginLockout({ data: {} })
      .then((result) => {
        if (active && result.locked && result.lockedUntil) {
          setLockedUntil(result.lockedUntil);
        }
      })
      .catch(() => {
        // Do not block the login screen if the initial lockout status check fails.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!lockedUntil) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      const seconds = Math.max(
        0,
        Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(seconds);
      if (seconds === 0) setLockedUntil(null);
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lockedUntil && remainingSeconds > 0) return;

    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    setBusy(true);

    try {
      const result = await loginWithProtection({
        data: {
          email,
          password,
          turnstileToken,
        },
      });

      resetTurnstile();

      if (!result.success) {
        setBusy(false);

        if (result.locked && result.lockedUntil) {
          setLockedUntil(result.lockedUntil);
        }

        toast.error(result.error, {
          icon: <Info className="h-4 w-4" />,
        });
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession(result.session);
      if (sessionError) {
        setBusy(false);
        toast.error("Unable to establish your session. Please try again.", {
          icon: <Info className="h-4 w-4" />,
        });
        return;
      }

      // Check if the authenticated admin has MFA enrolled.
      // data.totp only contains VERIFIED factors.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasTotp = (factors?.totp ?? []).length > 0;

      setBusy(false);

      if (hasTotp) {
        // Must verify MFA before accessing dashboard.
        navigate({ to: "/mfa-verify" });
      } else {
        // No MFA enrolled → go straight to dashboard.
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      resetTurnstile();
      setBusy(false);
      const message = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      toast.error(message, {
        icon: <Info className="h-4 w-4" />,
      });
    }
  };

  const isLocked = !!lockedUntil && remainingSeconds > 0;

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

          {isLocked && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-5 text-center">
              <p className="font-semibold text-red-300">Security lockout</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please try again after 10 minutes.
              </p>
              <p className="mt-3 font-mono text-2xl font-semibold tracking-wider text-foreground">
                {formatRemaining(remainingSeconds)}
              </p>
            </div>
          )}

          <form onSubmit={signIn} className="space-y-5">
            <Field
              name="email"
              label="Email / Username"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              required
              disabled={isLocked}
            />
            <Field
              name="password"
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              required
              disabled={isLocked}
            />
            {!isLocked && (
              <TurnstileWidget
                key={turnstileResetKey}
                onToken={setTurnstileToken}
              />
            )}
            <Button
              type="submit"
              disabled={busy || !turnstileToken || isLocked}
              className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            >
              {busy ? "Signing in…" : isLocked ? "Locked" : "Login"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  name,
  label,
  type,
  icon: Icon,
  placeholder,
  required,
  disabled,
}: {
  name: string;
  label: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <Label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={isPassword ? "current-password" : "username"}
          className={`h-13 rounded-xl border-border/80 bg-background/60 pl-11 ${
            isPassword ? "pr-11" : "pr-4"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            {showPassword ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
