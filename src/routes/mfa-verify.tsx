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
import { toast } from "sonner";

export const Route = createFileRoute("/mfa-verify")({
  head: () => ({
    meta: [
      { title: "Two-Factor Verification — CodeForge" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    // Must be logged in
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });

    // Must have a verified TOTP factor to be here
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if ((factors?.totp ?? []).length === 0) {
      // No MFA enrolled — go straight to dashboard
      throw redirect({ to: "/dashboard" });
    }

    // Already at AAL2? Skip verify
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") throw redirect({ to: "/dashboard" });
  },
  component: MfaVerify,
});

function MfaVerify() {
  const navigate = useNavigate();
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const createChallenge = useCallback(async (fId: string) => {
    const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId: fId });
    if (error) {
      toast.error("Failed to start verification. Please try again.");
      return;
    }
    setChallengeId(challenge.id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (error || !factors) { navigate({ to: "/auth" }); return; }

      const totp = (factors.totp ?? [])[0];
      if (!totp) { navigate({ to: "/dashboard" }); return; }

      setFactorId(totp.id);
      await createChallenge(totp.id);
      setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [navigate, createChallenge]);

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter a valid 6-digit code.");
      return;
    }
    setVerifying(true);
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error) {
      if (error.message.toLowerCase().includes("expired")) {
        toast.error("Challenge expired — refreshing…");
        await createChallenge(factorId);
      } else {
        toast.error("Invalid code. Check your authenticator app.");
      }
      setCode("");
      setVerifying(false);
      return;
    }
    navigate({ to: "/dashboard" });
  };

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
          ) : (
            <div className="space-y-4">
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
                  onKeyDown={(e) => { if (e.key === "Enter") verify(); }}
                  className="mt-1.5 rounded-xl text-center font-mono text-lg tracking-[0.5em]"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
              <Button
                onClick={verify}
                disabled={verifying || code.length !== 6}
                className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
              >
                {verifying ? "Verifying…" : "Verify & Continue"}
              </Button>
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
