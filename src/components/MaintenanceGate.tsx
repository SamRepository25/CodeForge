import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MAINTENANCE_SETTING_KEY = "site.maintenance_mode";

function isAdminOrAuthPath(pathname: string) {
  return /^\/(?:auth|mfa-setup|mfa-verify|forgot-password|reset-password|dashboard|admin)(?:\/|$)/.test(
    pathname,
  );
}

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const bypass = isAdminOrAuthPath(pathname);
  const maintenance = useQuery({
    queryKey: ["site-maintenance-mode"],
    enabled: !bypass,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", MAINTENANCE_SETTING_KEY)
        .maybeSingle();
      if (error) throw error;
      return data?.value === "true";
    },
    refetchInterval: 15_000,
    retry: 1,
  });

  if (bypass || maintenance.isError) return children;
  if (maintenance.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b14] px-6 text-sm text-white/60">
        Checking CodeForge status…
      </main>
    );
  }
  if (!maintenance.data) return children;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b14] px-6 text-white">
      <section className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
          <Wrench className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          CodeForge
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">We’ll be back soon</h1>
        <p className="mt-4 text-sm leading-6 text-white/65">
          CodeForge is temporarily unavailable while maintenance is in progress. Please check back
          shortly.
        </p>
      </section>
    </main>
  );
}
