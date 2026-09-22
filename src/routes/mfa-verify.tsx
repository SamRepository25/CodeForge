/**
 * /mfa-verify
 *
 * Shown after password login when the user has a verified TOTP factor.
 * The user must enter their 6-digit authenticator code to reach AAL2.
 */
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  clearMfaLockout,
  getMfaLockout,
  recordMfaFailure,
} from "@/lib/mfa.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/mfa-verify")({
  head: () => ({
    meta: [
      { title: "Two-Factor Verification — CodeForge" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw redirect({ to: "/auth" });

    const { data: factors } = await supabase.auth.mfa.listFactors();
    if ((factors?.totp ?? []).length === 0) {
      throw redirect({ to: "/mfa-setup" });
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") throw redirect({ to: "/dashboard" });
  },
  component: MfaVerify,
});

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function MfaVerify() {
  const navigate = useNavigate();
  const [factorId, setFactorId] = useState("");
  const [factorOptions, setFactorOptions] = useState<Array<{ id: string; friendly_name?: string | null }>>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const refreshLockout = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) return false;

    const result = await getMfaLockout({ data: { accessToken } });
    if (result.locked && result.lockedUntil) {
      setLockedUntil(result.lockedUntil);
      setRemainingSeconds(
        Math.max(
          0,
          Math.ceil((new Date(result.lockedUntil).getTime() - Date.now()) / 1000),
        ),
      );
      setFailedAttempts(4);
      return true;
    }

    setLockedUntil(null);
    setRemainingSeconds(0);
    setFailedAttempts(result.failedAttempts ?? 0);
    return false;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (error || !factors) {
        navigate({ to: "/auth" });
        return;
      }

      const totp = (factors.totp ?? [])[0];
      if (!totp) {
        navigate({ to: "/dashboard" });
        return;
      }

      setFactorId(totp.id);
      await refreshLockout();
      if (!cancelled) setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshLockout]);

  useEffect(() => {
    if (!lockedUntil) return;

    const timer = window.setInterval(() => {
      const seconds = Math.max(
        0,
        Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(seconds);

      if (seconds === 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
        setCode("");
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const verify = useCallback(async () => {
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter a valid 6-digit code.");
      return;
    }
    if (!factorId || verifying || lockedUntil) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      toast.error("Your session has expired. Please sign in again.");
      navigate({ to: "/auth" });
      return;
    }

    setVerifying(true);
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });

      if (!verifyError) {
        await clearMfaLockout({ data: { accessToken } });

        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.currentLevel !== "aal2") {
          toast.error("Verification did not complete. Please try again.");
          return;
        }

        navigate({ to: "/dashboard" });
        return;
      }

      if (verifyError.code === "mfa_challenge_expired") {
        setCode("");
        toast.error("Challenge expired — enter the current code again.");
        return;
      }

      const failure = await recordMfaFailure({ data: { accessToken } });
      setFailedAttempts(failure.failedAttempts);
      setCode("");

      if (failure.locked && failure.lockedUntil) {
        setLockedUntil(failure.lockedUntil);
        setRemainingSeconds(
          Math.max(
            0,
            Math.ceil((new Date(failure.lockedUntil).getTime() - Date.now()) / 1000),
          ),
        );
        toast.error("Security lockout. Please try again after 10 minutes.");
      } else {
        toast.error("Invalid code. Check your authenticator app.");
      }
    } catch (error) {
      console.error("[mfa] verification failed", error);
      toast.error("Unable to verify the code. Please try again.");
    } finally {
      setVerifying(false);
    }
  }, [code, factorId, verifying, lockedUntil, navigate]);

  useEffect(() => {
    if (code.length === 6 && factorId && !verifying && !lockedUntil) {
      void verify();
    }
  }, [code, factorId, verifying, lockedUntil, verify]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <SiteLayout>
      <section className="relative mx-auto flex min-h-[80vh] max-w-md items-center px-4">
        <div className="glass-strong gradient-border w-full rounded-3xl p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet to-electric glow-violet">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold">Two-Factor Verification</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
              <p className="text-sm text-muted-foreground">Preparing verification…</p>
            </div>
          ) : lockedUntil ? (
            <div className="space-y-4 text-center">
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-5">
                <p className="font-semibold text-red-300">Security lockout</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please try again after 10 minutes.
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-wider text-foreground" style={{ fontFamily: "Calibri, sans-serif" }}>
                  {formatRemaining(remainingSeconds)}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Cancel and sign out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {factorOptions.length > 1 && (
                <div>
                  <Label className="text-xs">Choose Authenticator</Label>
                  <div className="mt-1.5 grid gap-2">
                    {factorOptions.map((factor, index) => (
                      <Button
                        key={factor.id}
                        type="button"
                        variant={factorId === factor.id ? "default" : "outline"}
                        className="justify-start rounded-xl"
                        onClick={() => {
                          setFactorId(factor.id);
                          setCode("");
                        }}
                        disabled={verifying}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {factor.friendly_name || `Authenticator ${index + 1}`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="mfa-code" className="text-xs">Authenticator Code</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter") void verify(); }}
                  className="mt-1.5 rounded-xl text-center font-mono text-lg tracking-[0.5em]"
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={verifying}
                />
              </div>
              <Button
                onClick={() => void verify()}
                disabled={verifying || code.length !== 6}
                className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
              >
                {verifying ? "Verifying…" : "Verify & Continue"}
              </Button>
              {failedAttempts > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  {4 - failedAttempts} attempt{4 - failedAttempts === 1 ? "" : "s"} remaining
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Cancel and sign out
              </button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
