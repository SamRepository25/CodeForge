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

  // Keep the existing site available while the maintenance setting is checked.
  // Admin and authentication routes continue to bypass the maintenance screen.
  if (bypass || maintenance.isError || maintenance.isLoading || !maintenance.data) {
    return children;
  }

  return (
    <main className="maintenance-screen relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-16 text-white sm:px-8">
      <style>{`
        .maintenance-screen {
          background:
            radial-gradient(ellipse at 50% 34%, rgba(37, 99, 235, .16), transparent 42%),
            radial-gradient(ellipse at 12% 88%, rgba(99, 102, 241, .10), transparent 34%),
            #070b16;
        }
        .maintenance-screen::before {
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image: linear-gradient(rgba(148, 163, 184, .035) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, .035) 1px, transparent 1px);
          background-size: 48px 48px;
          content: "";
          mask-image: linear-gradient(to bottom, transparent, black 22%, black 78%, transparent);
        }
        .maintenance-orbit {
          animation: maintenance-orbit 12s linear infinite;
          transform-origin: center;
        }
        .maintenance-pulse {
          animation: maintenance-pulse 2.4s ease-in-out infinite;
        }
        @keyframes maintenance-orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes maintenance-pulse {
          0%, 100% { opacity: .55; transform: scale(.92); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .maintenance-orbit, .maintenance-pulse { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(76vw,680px)] w-[min(76vw,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/[0.07]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(58vw,500px)] w-[min(58vw,500px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-300/[0.08]" />

      <section className="w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-slate-950/65 px-6 py-12 text-center shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-x-1/4 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="maintenance-orbit absolute inset-0 rounded-full border border-blue-300/25 border-t-blue-300/90" />
            <div className="absolute inset-2 rounded-full border border-indigo-300/15" />
            <img
              src="/Firefly_RemoveBackground.png"
              alt="CodeForge official logo"
              className="relative h-[4.25rem] w-[4.25rem] rounded-2xl object-cover shadow-[0_0_38px_rgba(59,130,246,0.2)]"
            />
            <span className="maintenance-pulse absolute -right-1 top-3 h-2.5 w-2.5 rounded-full bg-blue-300 shadow-[0_0_16px_rgba(96,165,250,0.95)]" />
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/[0.07] px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="maintenance-pulse absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-300" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200 sm:text-[11px]">
              System maintenance
            </span>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
            CodeForge
          </p>
          <h1 className="mx-auto max-w-xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Something better is on its way.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-300/80 sm:text-base">
            CodeForge is temporarily unavailable while we make improvements. We’re working behind
            the scenes and will be back as soon as maintenance is complete.
          </p>

          <div className="mx-auto mt-9 flex w-fit items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10 text-blue-200">
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-slate-200">We’re working on it</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Thanks for your patience</p>
            </div>
          </div>

          <div className="mt-11 border-t border-white/[0.07] pt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">
              CodeForge - Developer Portfolio and Technical Blog
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
