import { Link, useRouterState } from "@tanstack/react-router";
import { Code2, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
  { to: "/ai-tools", label: "AI Tools" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <nav className="glass-strong grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl px-4 py-3 md:grid-cols-3">
          {/* Left — logo */}
          <Link to="/" className="group flex items-center gap-2.5 justify-self-start">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet to-electric glow-violet">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-tight">CodeForge</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Forge ideas</span>
            </div>
          </Link>

          {/* Center — nav links (desktop only) */}
          <div className="hidden items-center justify-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-violet to-electric" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right — Dashboard (admin only) or hamburger on mobile */}
          <div className="flex items-center justify-end gap-2">
            {user && (
              <Button asChild size="sm" className="hidden rounded-lg bg-gradient-to-r from-violet to-electric text-white hover:opacity-90 md:inline-flex">
                <Link to="/dashboard"><LayoutDashboard className="mr-1.5 h-4 w-4" />Dashboard</Link>
              </Button>
            )}
            <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="glass-strong mt-2 space-y-1 rounded-2xl p-3 md:hidden">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`block rounded-lg px-3 py-2 text-sm ${active ? "bg-secondary text-foreground" : "text-muted-foreground"}`} onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              );
            })}
            {user && (
              <Link to="/dashboard" className="block rounded-lg px-3 py-2 text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
