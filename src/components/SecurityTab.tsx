/**
 * SecurityTab
 *
 * Renders inside the Dashboard's <TabsContent value="security">.
 * Handles the complete MFA lifecycle:
 *   - Status display (enabled / disabled)
 *   - Enable flow: password → QR code → verify → recovery codes
 *   - Disable flow: password → TOTP code → unenroll
 *   - Recovery code generation and regeneration
 */
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, ShieldOff, Shield, Copy, Download, Check,
  KeyRound, Eye, EyeOff, RefreshCw, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateRecoveryCodes, hashRecoveryCode } from "@/lib/recovery-codes";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | "idle"
  | "enable-password"
  | "enable-qr"
  | "enable-codes"
  | "disable-password"
  | "disable-totp"
  | "regen-confirm";

// ─── Main Component ───────────────────────────────────────────────────────────

export function SecurityTab() {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("idle");

  // Enrollment state
  const [enrollFactorId, setEnrollFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Password inputs
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Disable-flow TOTP code
  const [disableTotpCode, setDisableTotpCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [codeCopied, setCopied] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  // ─── Load MFA status ──────────────────────────────────────────────────────

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = (data?.totp ?? [])[0];
    setMfaEnabled(!!verified);
    setFactorId(verified?.id ?? "");
    setLoading(false);
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const reset = () => {
    setStep("idle");
    setPassword("");
    setTotpCode("");
    setDisableTotpCode("");
    setQrCode("");
    setSecret("");
    setEnrollFactorId("");
    setRecoveryCodes([]);
    setShowPassword(false);
    setBusy(false);
  };

  /** Re-authenticate with password by signing in again */
  const verifyPassword = async (pw: string): Promise<boolean> => {
    if (!user?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: pw,
    });
    return !error;
  };

  // ─── ENABLE FLOW ──────────────────────────────────────────────────────────

  /** Step 1: verify password, then enroll TOTP factor */
  const handleEnablePassword = async () => {
    if (!password) { toast.error("Enter your password."); return; }
    setBusy(true);

    const ok = await verifyPassword(password);
    if (!ok) {
      toast.error("Incorrect password.");
      setBusy(false);
      return;
    }

    // Clean up any lingering unverified factors first
    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const f of existing?.all ?? []) {
      if (f.status === "unverified") {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }

    // Enroll new TOTP factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "CodeForge",
      friendlyName: "CodeForge Admin",
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

  /** Step 2: verify TOTP code to activate the factor */
  const handleEnableVerify = async () => {
    if (!/^\d{6}$/.test(totpCode)) { toast.error("Enter a valid 6-digit code."); return; }
    setBusy(true);

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollFactorId,
      code: totpCode,
    });

    if (error) {
      toast.error(error.message.toLowerCase().includes("expired")
        ? "Code expired — wait for the next one."
        : "Invalid code. Try again.");
      setBusy(false);
      return;
    }

    // Generate and store recovery codes
    const { plaintext, hashes } = await generateRecoveryCodes();

    // Delete old recovery codes first
    if (user?.id) {
      await supabase.from("recovery_codes").delete().eq("user_id", user.id);
      await supabase.from("recovery_codes").insert(
        hashes.map((code_hash) => ({ user_id: user.id, code_hash }))
      );
    }

    setRecoveryCodes(plaintext);
    setTotpCode("");
    setBusy(false);
    setStep("enable-codes");
    await loadStatus();
    toast.success("Two-factor authentication enabled!");
  };

  // ─── DISABLE FLOW ─────────────────────────────────────────────────────────

  /** Step 1: verify password */
  const handleDisablePassword = async () => {
    if (!password) { toast.error("Enter your password."); return; }
    setBusy(true);
    const ok = await verifyPassword(password);
    if (!ok) { toast.error("Incorrect password."); setBusy(false); return; }
    setPassword("");
    setBusy(false);
    setStep("disable-totp");
  };

  /** Step 2: verify TOTP, then unenroll */
  const handleDisableVerify = async () => {
    if (!/^\d{6}$/.test(disableTotpCode)) { toast.error("Enter a valid 6-digit code."); return; }
    setBusy(true);

    // Challenge + verify to confirm identity
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: disableTotpCode,
    });

    if (verifyError) {
      toast.error("Invalid code. MFA not disabled.");
      setBusy(false);
      return;
    }

    // Unenroll the factor
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    if (unenrollError) {
      toast.error("Failed to disable MFA: " + unenrollError.message);
      setBusy(false);
      return;
    }

    // Delete recovery codes
    if (user?.id) {
      await supabase.from("recovery_codes").delete().eq("user_id", user.id);
    }

    await loadStatus();
    reset();
    toast.success("Two-factor authentication disabled.");
  };

  // ─── RECOVERY CODE REGENERATION ───────────────────────────────────────────

  const handleRegen = async () => {
    if (!user?.id) return;
    setBusy(true);
    const { plaintext, hashes } = await generateRecoveryCodes();
    await supabase.from("recovery_codes").delete().eq("user_id", user.id);
    await supabase.from("recovery_codes").insert(
      hashes.map((code_hash) => ({ user_id: user.id, code_hash }))
    );
    setRecoveryCodes(plaintext);
    setBusy(false);
    setStep("enable-codes");
    toast.success("Recovery codes regenerated. Save them now.");
  };

  // ─── Clipboard & Download ─────────────────────────────────────────────────

  const copyAllCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const blob = new Blob(
      [`CodeForge Recovery Codes\nGenerated: ${new Date().toISOString()}\n\n${recoveryCodes.join("\n")}`],
      { type: "text/plain" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "codeforge-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Status Card ── */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {mfaEnabled ? (
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
                {mfaEnabled ? (
                  <><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-emerald-400">Enabled</span></>
                ) : (
                  <><span className="h-2 w-2 rounded-full bg-red-400" /><span className="text-red-400">Disabled</span></>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {mfaEnabled ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => { setStep("regen-confirm"); }}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Regenerate Codes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-red-500/40 text-red-400 hover:bg-red-500/10"
                  onClick={() => setStep("disable-password")}
                >
                  <ShieldOff className="mr-1.5 h-3.5 w-3.5" />Disable
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"
                onClick={() => setStep("enable-password")}
              >
                <Shield className="mr-1.5 h-3.5 w-3.5" />Enable 2FA
              </Button>
            )}
          </div>
        </div>
        {!mfaEnabled && (
          <p className="mt-4 text-sm text-muted-foreground">
            Add an extra layer of security to your account. After enabling, you'll need your
            authenticator app each time you sign in.
          </p>
        )}
      </div>

      {/* ══════════════ ENABLE FLOW ══════════════ */}

      {/* Step: Password verification */}
      {step === "enable-password" && (
        <StepCard
          icon={<KeyRound className="h-5 w-5 text-violet" />}
          title="Verify Your Password"
          description="Enter your current password to begin setting up two-factor authentication."
          onClose={reset}
        >
          <PasswordField
            value={password}
            show={showPassword}
            onChange={setPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleEnablePassword}
              disabled={busy || !password}
              className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            >
              {busy ? "Verifying…" : "Continue"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={reset}>Cancel</Button>
          </div>
        </StepCard>
      )}

      {/* Step: QR code */}
      {step === "enable-qr" && (
        <StepCard
          icon={<ShieldCheck className="h-5 w-5 text-electric" />}
          title="Scan QR Code"
          description="Scan this QR code with Microsoft Authenticator, Google Authenticator, or Authy."
          onClose={reset}
        >
          {/* QR code */}
          <div className="flex justify-center">
            <img
              src={qrCode}
              alt="TOTP QR Code"
              className="h-48 w-48 rounded-xl border border-border/40 bg-white p-2"
            />
          </div>

          {/* Manual secret */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Can't scan? Enter this key manually
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2">
              <span className="flex-1 break-all font-mono text-xs tracking-widest">{secret}</span>
              <button onClick={copySecret} className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground">
                {secretCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Verify first code */}
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
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => { if (e.key === "Enter") handleEnableVerify(); }}
              className="mt-1.5 rounded-xl text-center font-mono text-lg tracking-[0.5em]"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleEnableVerify}
              disabled={busy || totpCode.length !== 6}
              className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            >
              {busy ? "Activating…" : "Activate 2FA"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={reset}>Cancel</Button>
          </div>
        </StepCard>
      )}

      {/* Step: Recovery codes */}
      {step === "enable-codes" && (
        <StepCard
          icon={<KeyRound className="h-5 w-5 text-amber-400" />}
          title="Save Your Recovery Codes"
          description=""
          onClose={() => { reset(); }}
        >
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            ⚠️ Save these recovery codes in a safe place. They will not be shown again. Each code can only be used once.
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recoveryCodes.map((c) => (
              <div key={c} className="rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-center font-mono text-sm tracking-widest">
                {c}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl flex-1" onClick={copyAllCodes}>
              {codeCopied ? <><Check className="mr-1.5 h-4 w-4" />Copied!</> : <><Copy className="mr-1.5 h-4 w-4" />Copy All</>}
            </Button>
            <Button variant="outline" className="rounded-xl flex-1" onClick={downloadCodes}>
              <Download className="mr-1.5 h-4 w-4" />Download
            </Button>
          </div>
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            onClick={reset}
          >
            I've Saved My Codes — Done
          </Button>
        </StepCard>
      )}

      {/* ══════════════ DISABLE FLOW ══════════════ */}

      {step === "disable-password" && (
        <StepCard
          icon={<ShieldOff className="h-5 w-5 text-red-400" />}
          title="Disable Two-Factor Authentication"
          description="Enter your password to proceed. You will also need your authenticator code."
          onClose={reset}
        >
          <PasswordField
            value={password}
            show={showPassword}
            onChange={setPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleDisablePassword}
              disabled={busy || !password}
              className="rounded-xl border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              variant="outline"
            >
              {busy ? "Verifying…" : "Continue"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={reset}>Cancel</Button>
          </div>
        </StepCard>
      )}

      {step === "disable-totp" && (
        <StepCard
          icon={<ShieldOff className="h-5 w-5 text-red-400" />}
          title="Confirm with Authenticator Code"
          description="Enter the current 6-digit code from your authenticator app to disable 2FA."
          onClose={reset}
        >
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={disableTotpCode}
            onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => { if (e.key === "Enter") handleDisableVerify(); }}
            className="rounded-xl text-center font-mono text-lg tracking-[0.5em]"
            autoComplete="one-time-code"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={handleDisableVerify}
              disabled={busy || disableTotpCode.length !== 6}
              className="rounded-xl border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              variant="outline"
            >
              {busy ? "Disabling…" : "Disable 2FA"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={reset}>Cancel</Button>
          </div>
        </StepCard>
      )}

      {/* ══════════════ REGEN CODES ══════════════ */}

      {step === "regen-confirm" && (
        <StepCard
          icon={<RefreshCw className="h-5 w-5 text-amber-400" />}
          title="Regenerate Recovery Codes"
          description="Your old recovery codes will be permanently invalidated. New codes will be generated."
          onClose={reset}
        >
          <div className="flex gap-2">
            <Button
              onClick={handleRegen}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"
            >
              {busy ? "Generating…" : "Regenerate Codes"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={reset}>Cancel</Button>
          </div>
        </StepCard>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({
  icon, title, description, children, onClose,
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
        <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PasswordField({
  value, show, onChange, onToggle,
}: {
  value: string; show: boolean;
  onChange: (v: string) => void; onToggle: () => void;
}) {
  return (
    <div>
      <Label htmlFor="security-password" className="text-xs">Current Password</Label>
      <div className="relative mt-1.5">
        <Input
          id="security-password"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl pr-10"
          autoComplete="current-password"
          autoFocus
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
