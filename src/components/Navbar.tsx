import { Link, useRouterState } from "@tanstack/react-router";
import { Code2, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/projects", label: "PROJECTS", index: "01" },
  { to: "/", label: "TECHNOLOGIES", index: "02", hash: "technologies" },
  { to: "/blog", label: "ARTICLES & BLOG", index: "03" },
  { to: "/about", label: "ABOUT / BIO", index: "04" },
  { to: "/", label: "CONTACT", index: "05", hash: "contact" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="telemetry-ribbon">
        <div className="page-shell telemetry-inner">
          <span className="status-text">
            <i /> SYS_STATUS: AVAILABLE FOR OPPORTUNITIES
          </span>
          <span className="mono-label">CORE: TYPESCRIPT / PYTHON / GO</span>
          <span className="mono-label telemetry-extra">STACK: REACT / NODE / SUPABASE</span>
          <span className="telemetry-links">
            <a href="https://github.com/SamRepository25/" target="_blank" rel="noreferrer">
              GITHUB
            </a>
            <a href="https://www.linkedin.com/in/simakahmed" target="_blank" rel="noreferrer">
              LINKEDIN
            </a>
            <Link to="/blog">BLOG</Link>
          </span>
        </div>
      </div>
      <div className="page-shell nav-shell">
        <Link to="/" className="brand-mark">
          <span className="brand-icon">
            <Code2 size={21} />
          </span>
          <span>
            <strong>CODEFORGE</strong>
            <small>SOFTWARE LAB</small>
          </span>
        </Link>
        <span className="nav-status">
          <i /> STATUS: OPEN TO OPPORTUNITIES
        </span>
        <nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
          {NAV.map((item) => {
            const active = item.to !== "/" && pathname.startsWith(item.to);
            return (
              <Link
                key={`${item.index}-${item.label}`}
                to={item.to}
                hash={item.hash}
                className={active ? "nav-item active" : "nav-item"}
                onClick={() => setOpen(false)}
              >
                <span>{item.index}.</span>
                {item.label}
              </Link>
            );
          })}
          {user && (
            <Link
              to="/dashboard"
              className="nav-item dashboard-link"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={14} /> DASHBOARD
            </Link>
          )}
        </nav>
        <button
          className="menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
