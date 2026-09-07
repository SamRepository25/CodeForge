import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Code2,
  FileText,
  FolderKanban,
  Home,
  Info,
  KeyRound,
  LayoutDashboard,
  Mail,
  Network,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

const SITE_URL = "https://codeforgedev.vercel.app";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Sitemap — CodeForge" },
      {
        name: "description",
        content: "Explore the pages, projects, technical blogs, tools, and resources available on CodeForge.",
      },
      { property: "og:title", content: "Sitemap — CodeForge" },
      {
        property: "og:description",
        content: "Explore the complete CodeForge website structure.",
      },
      { property: "og:url", content: `${SITE_URL}/sitemap` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/sitemap` }],
  }),
  component: SitemapPage,
});

type SitemapLink = {
  label: string;
  to: "/" | "/about" | "/projects" | "/blog" | "/auth";
  description?: string;
};

type SitemapSectionProps = {
  title: string;
  icon: typeof Home;
  links: SitemapLink[];
};

function SitemapSection({ title, icon: Icon, links }: SitemapSectionProps) {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm transition hover:border-violet/30">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet/20 to-electric/20 text-electric">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
      </div>

      <ul className="mt-5 space-y-3">
        {links.map((item) => (
          <li key={item.to + item.label}>
            <Link
              to={item.to}
              className="group flex items-start justify-between gap-4 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04]"
            >
              <span>
                <span className="flex items-center gap-2 font-medium text-foreground group-hover:text-electric">
                  {item.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </span>
                {item.description && (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SitemapPage() {
  const corePages: SitemapLink[] = [
    { label: "Home", to: "/", description: "CodeForge portfolio, projects, writing, and tools." },
    { label: "About", to: "/about", description: "Learn about the developer behind CodeForge." },
    { label: "Projects", to: "/projects", description: "Explore selected projects and technical work." },
    { label: "Blog", to: "/blog", description: "Read technical articles and learning notes." },
  ];

  const blogTopics: SitemapLink[] = [
    { label: "Technical Blog", to: "/blog", description: "Networking, Linux, Git, web development, databases, and operating systems." },
    { label: "Latest Articles", to: "/blog", description: "Browse the newest published CodeForge posts." },
  ];

  const tools: SitemapLink[] = [
    { label: "AI Tools", to: "/", description: "AI-powered tools are available from the CodeForge home page." },
    { label: "Resume Builder", to: "/", description: "Create an ATS-friendly resume with AI assistance." },
    { label: "Study Notes Generator", to: "/", description: "Turn topics into structured study notes." },
    { label: "Quiz Generator", to: "/", description: "Generate practice MCQs for learning and revision." },
    { label: "Code Explainer", to: "/", description: "Understand code with AI-powered explanations." },
    { label: "Interview Q Generator", to: "/", description: "Generate targeted interview preparation questions." },
    { label: "Text Improver", to: "/", description: "Improve clarity, tone, and grammar with AI." },
  ];

  const admin: SitemapLink[] = [
    { label: "Admin Login", to: "/auth", description: "Secure entry point for CodeForge administration." },
  ];

  return (
    <SiteLayout>
      <div className="relative overflow-hidden">
        <section className="relative mx-auto max-w-7xl px-4 pt-16 md:pt-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-violet/20 via-transparent to-electric/10 blur-3xl" />
          <div className="glass-strong gradient-border overflow-hidden rounded-3xl px-6 py-16 md:px-12 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-violet/10 px-3 py-1.5 text-xs font-medium text-electric">
                <Network className="h-3.5 w-3.5" />
                CodeForge navigation
              </div>
              <h1 className="mt-6 font-display text-5xl font-bold tracking-tight md:text-7xl">
                <span className="gradient-text">Sitemap</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                A complete, easy-to-scan guide to the pages, projects, technical writing, AI tools, and administration area of CodeForge.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SitemapSection title="Main Navigation" icon={Home} links={corePages} />
            <SitemapSection title="Writing & Blog" icon={BookOpen} links={blogTopics} />
            <SitemapSection title="AI Tools" icon={Brain} links={tools} />
            <SitemapSection title="Projects" icon={FolderKanban} links={[{ label: "All Projects", to: "/projects", description: "View CodeForge projects and case studies." }]} />
            <SitemapSection title="About & Contact" icon={Info} links={[{ label: "About CodeForge", to: "/about", description: "Background, skills, and developer information." }, { label: "Contact", to: "/", description: "Contact information is available on the CodeForge home page." }]} />
            <SitemapSection title="Administration" icon={ShieldCheck} links={admin} />
          </div>

          <div className="mt-12 rounded-2xl border border-border/50 bg-card/30 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Wrench className="h-4 w-4 text-electric" />
                  Website resources
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  CodeForge also publishes machine-readable site information for search engines through its XML sitemap.
                </p>
              </div>
              <a
                href="/sitemap.xml"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium transition hover:border-electric/50 hover:text-electric"
              >
                XML Sitemap
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5" /> Built with React & TypeScript</span>
            <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Technical writing</span>
            <span className="inline-flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Admin protected</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Open to connections</span>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
