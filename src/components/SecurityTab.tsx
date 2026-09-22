/**
 * SecurityTab
 *
 * Administrator MFA management. MFA is mandatory for CodeForge admin access.
 * A second TOTP factor can be enrolled on another trusted device as the
 * recovery mechanism; the application deliberately does not implement a
 * weaker password-only MFA reset path.
 */
import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, ShieldOff, Shield, KeyRound, Eye, EyeOff, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type Step = "idle" | "enable-password" | "enable-qr" | "enable-complete";

export function SecurityTab({
  requiredSetup = false,
  onRequiredComplete,
}: {
  requiredSetup?: boolean;
  onRequiredComplete?: () => void;
}) {
  const { user } = useAuth();
  const [mfaCount, setMfaCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("idle");
  const [enrollFactorId, setEnrollFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setMfaCount(0);
    } else {
      setMfaCount((data?.totp ?? []).filter((factor) => factor.status === "verified").length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const reset = () => {
    setStep("idle");
    setPassword("");
    setTotpCode("");
    setQrCode("");
    setSecret("");
    setEnrollFactorId("");
    setShowPassword(false);
    setSecretCopied(false);
    setBusy(false);
  };

  const verifyPassword = async (pw: string): Promise<boolean> => {
    if (!user?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: pw,
    });
    return !error;
  };

  const handleEnablePassword = async () => {
    if (!password) {
      toast.error("Enter your password.");
      return;
    }

    setBusy(true);
    const ok = await verifyPassword(password);
    if (!ok) {
      toast.error("Incorrect password.");
      setBusy(false);
      return;
    }

    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const factor of existing?.all ?? []) {
      if (factor.status === "unverified") {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "CodeForge",
      friendlyName: mfaCount === 0 ? "CodeForge Admin" : `CodeForge Backup ${mfaCount + 1}`,
    });

    if (error || !data) {
      toast.error("Failed to start enrollment: " + (error?.message ?? "unknown error"));
      setBusy(false);
      return;
    }

    setEnrollFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setPassword("");
    setBusy(false);
    setStep("enable-qr");
  };

  const handleEnableVerify = async () => {
    if (!/^\d{6}$/.test(totpCode)) {
      toast.error("Enter a valid 6-digit code.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollFactorId,
      code: totpCode,
    });

    if (error) {
      toast.error(
        error.message.toLowerCase().includes("expired")
          ? "Code expired — wait for the next one."
          : "Invalid code. Try again.",
      );
      setBusy(false);
      return;
    }

    setTotpCode("");
    setBusy(false);
    await loadStatus();
    setStep("enable-complete");
    toast.success("Authenticator enabled successfully.");
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    window.setTimeout(() => setSecretCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {mfaCount > 0 ? (
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10">
                <ShieldOff className="h-5 w-5 text-red-400" />
              </div>
            )}
            <div>
              <div className="font-semibold">Two-Step Verification</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm">
                {mfaCount > 0 ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400">
                      Enabled{mfaCount > 1 ? ` · ${mfaCount} authenticators` : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-red-400">Required — not configured</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant={mfaCount > 0 ? "outline" : "default"}
            className={
              mfaCount > 0
                ? "rounded-xl"
                : "rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            }
            onClick={() => setStep("enable-password")}
          >
            {mfaCount > 0 ? (
              <>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Backup Authenticator
              </>
            ) : (
              <>
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Enable 2FA
              </>
            )}
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          TOTP is mandatory for the CodeForge administrator. For recovery, keep a second
          authenticator on another trusted device instead of using a weaker bypass path.
        </p>
      </div>

      {step === "enable-password" && (
        <StepCard
          icon={<KeyRound className="h-5 w-5 text-violet" />}
          title={mfaCount > 0 ? "Add Backup Authenticator" : "Verify Your Password"}
          description="Re-enter your current password before creating a new TOTP factor."
          onClose={reset}
        >
          <PasswordField
            value={password}
            show={showPassword}
            onChange={setPassword}
            onToggle={() => setShowPassword((visible) => !visible)}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => void handleEnablePassword()}
              disabled={busy || !password}
              className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            >
              {busy ? "Verifying…" : "Continue"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={reset}>
              Cancel
            </Button>
          </div>
        </StepCard>
      )}

      {step === "enable-qr" && (
        <StepCard
          icon={<ShieldCheck className="h-5 w-5 text-electric" />}
          title="Scan QR Code"
          description="Use Microsoft Authenticator, Google Authenticator, Authy, or another TOTP authenticator."
          onClose={reset}
        >
          <div className="flex justify-center">
            <img
              src={qrCode}
              alt="TOTP QR Code"
              className="h-48 w-48 rounded-xl border border-border/40 bg-white p-2"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Can't scan? Enter this key manually
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2">
              <span className="flex-1 break-all font-mono text-xs tracking-widest">{secret}</span>
              <button
                type="button"
                onClick={() => void copySecret()}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                {secretCopied ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="totp-enable-code" className="text-xs">
              Enter the 6-digit code from your app
            </Label>
            <Input
              id="totp-enable-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={(event) =>
                setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleEnableVerify();
              }}
              className="mt-1.5 rounded-xl text-center font-mono text-lg tracking-[0.5em]"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => void handleEnableVerify()}
              disabled={busy || totpCode.length !== 6}
              className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            >
              {busy ? "Activating…" : "Activate 2FA"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={reset}>
              Cancel
            </Button>
          </div>
        </StepCard>
      )}

      {step === "enable-complete" && (
        <StepCard
          icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
          title="Authenticator Enabled"
          description="This authenticator can now be used for administrator sign-in."
          onClose={reset}
        >
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            Your authenticator is active. If this is your primary device, add a second
            authenticator on another trusted device for recovery.
          </div>
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            onClick={() => {
              reset();
              onRequiredComplete?.();
            }}
          >
            Done
          </Button>
        </StepCard>
      )}

      {requiredSetup && mfaCount === 0 && step === "idle" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          Administrator access remains locked until you finish TOTP enrollment.
        </div>
      )}
    </div>
  );
}

function StepCard({
  icon,
  title,
  description,
  children,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="glass gradient-border rounded-2xl p-6">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">{icon}</div>
          <div>
            <div className="font-display font-semibold">{title}</div>
            {description && <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PasswordField({
  value,
  show,
  onChange,
  onToggle,
}: {
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <Label htmlFor="security-password" className="text-xs">
        Current Password
      </Label>
      <div className="relative mt-1.5">
        <Input
          id="security-password"
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl pr-10"
          autoComplete="current-password"
          autoFocus
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
