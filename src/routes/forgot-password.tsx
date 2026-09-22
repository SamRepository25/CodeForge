/**
 * /forgot-password — Admin password recovery request.
 *
 * Supabase sends the recovery email. The page deliberately returns the same
 * success message regardless of whether the address exists to avoid account
 * enumeration.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Code2, Info, KeyRound, Mail } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { requestPasswordReset } from "@/lib/password-reset.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — CodeForge" },
      { name: "description", content: "Request a secure password reset link for CodeForge administrator access." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://codeforgedev.vercel.app/forgot-password" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !turnstileToken) return;

    setBusy(true);
    try {
      await requestPasswordReset({
        data: {
          email: normalizedEmail,
          turnstileToken,
        },
      });

      setSent(true);
      setTurnstileToken("");
      setResetKey((key) => key + 1);
    } catch {
      toast.error("Unable to process the request. Please try again.", {
        icon: <Info className="h-4 w-4" />,
      });
    } finally {
      setBusy(false);
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
            <h1 className="mt-3 font-display text-2xl font-bold">Forgot Password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Request a secure password reset link for your CodeForge administrator account.
            </p>
          </div>

          {sent ? (
            <div className="space-y-5 text-center">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                <p className="mt-3 font-semibold">Check your email</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account uses that email address, a password reset link has been sent.
                  The link is time-limited and can only be used through CodeForge.
                </p>
              </div>
              <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin Email
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@domain.com"
                    autoComplete="email"
                    required
                    className="h-13 rounded-xl border-border/80 bg-background/60 pl-11"
                  />
                </div>
              </div>

              <TurnstileWidget
                key={resetKey}
                action="password_reset"
                onToken={setTurnstileToken}
              />

              <Button
                type="submit"
                disabled={busy || !turnstileToken}
                className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
              >
                {busy ? "Sending…" : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
