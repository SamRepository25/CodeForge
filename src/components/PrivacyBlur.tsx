import { useEffect, useState } from "react";

export function PrivacyBlur({ children }: { children: React.ReactNode }) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsHidden(document.visibilityState === "hidden");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return <div className={isHidden ? "privacy-blur" : undefined}>{children}</div>;
}
