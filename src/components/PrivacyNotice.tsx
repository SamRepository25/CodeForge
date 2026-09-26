import { ShieldAlert } from "lucide-react";

/**
 * Site-wide privacy & copyright notice.
 *
 * Intentionally honest about what this is: a legal/deterrence notice,
 * not a technical guarantee. It must never claim screenshots are
 * blocked or that every capture attempt is detected.
 */
export function PrivacyNotice() {
  return (
    <div
      role="note"
      aria-label="Privacy and copyright notice"
      className="border-b border-violet/20 bg-violet/5 px-4 py-2 text-center text-xs text-muted-foreground"
    >
      <span className="inline-flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-violet" aria-hidden="true" />
        Privacy &amp; Copyright Protection Enabled — content on this site is protected and
        unauthorized reproduction or redistribution is prohibited. See our{" "}
        <a href="/terms" className="text-violet underline underline-offset-2">
          Terms &amp; Conditions
        </a>
        .
      </span>
    </div>
  );
}
