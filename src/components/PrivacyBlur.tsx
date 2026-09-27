import { useEffect, useState, type ReactNode } from "react";

/**
 * PrivacyBlur
 *
 * Blurs its children when the browser tab is hidden or loses visibility
 * (tab switch, minimize, app switch), and restores them when the tab
 * becomes visible again.
 *
 * This is a privacy convenience for inactive tabs — e.g. keeping an
 * admin panel from being visible in a screen-share or over someone's
 * shoulder while you're on another tab. It is NOT screenshot detection
 * and cannot be, since the Page Visibility API only fires on tab/window
 * focus changes, not on OS-level or external capture.
 */
export function PrivacyBlur({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setHidden(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div
      className={hidden ? "privacy-blur-active" : undefined}
      aria-hidden={hidden ? "true" : undefined}
    >
      {children}
    </div>
  );
}
