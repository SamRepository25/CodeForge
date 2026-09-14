import { useEffect, useState } from "react";
import { X, Mail } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

const DISMISS_KEY = "cf_sticky_cta_dismissed";

export function StickyMobileCta() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Only decide visibility on the client — avoids SSR/client markup mismatch.
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-lg sm:hidden"
          role="complementary"
          aria-label="Contact call to action"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-electric px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet/25"
            >
              <Mail className="h-4 w-4" />
              Get in touch
            </Link>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/60 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
