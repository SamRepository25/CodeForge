import { Link } from "@tanstack/react-router";
import { Code2, Github, Linkedin, Mail } from "lucide-react";

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.29 19.5h2.039L6.486 3.24H4.298L17.61 20.653Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet to-electric">
                <Code2 className="h-5 w-5 text-white" />
              </div>

              <span className="font-display text-lg font-bold">
                CodeForge
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Forge ideas into reality. A personal portfolio, technical blog.
            </p>

            <div className="mt-4 flex items-center gap-2">
              {[
                {
                  icon: Github,
                  href: "https://github.com/SamRepository25/",
                  label: "Follow us on GitHub",
                },
                {
                  icon: Linkedin,
                  href: "https://www.linkedin.com/in/simakahmed",
                  label: "Follow us on LinkedIn",
                },
                {
                  icon: XLogo,
                  href: "https://x.com/X",
                  label: "Follow us on X",
                },
                {
                  icon: Mail,
                  href: "mailto:simakahmed@outlook.com",
                  label: "Email us",
                },
              ].map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 text-muted-foreground transition hover:border-violet/60 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Explore</h4>

            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/projects" className="hover:text-foreground">
                  Projects
                </Link>
              </li>

              <li>
                <Link to="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} CodeForge. All Rights Reserved.
          </span>

          <div className="flex flex-col items-start gap-2">
            <span className="font-medium text-foreground/80">
              Built with
            </span>

            <ul className="space-y-1">
              <li>React</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>TanStack Router / React Start</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}