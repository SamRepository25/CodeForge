import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Filter } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

const URL_PROJECTS = "https://https://codeforgedev.vercel.app/projects";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — CodeForge" },
      { name: "description", content: "Selected projects, experiments and open-source work by the CodeForge developer." },
      { property: "og:title", content: "Projects — CodeForge" },
      { property: "og:description", content: "Selected projects and case studies." },
      { property: "og:url", content: URL_PROJECTS },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_PROJECTS }],
  }),
  component: Projects,
});


function Projects() {
  const [filter, setFilter] = useState<string>("All");
  const { data, isLoading } = useQuery({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(() => ["All", ...Array.from(new Set((data ?? []).map((d) => d.category).filter(Boolean) as string[]))], [data]);
  const filtered = (data ?? []).filter((p) => filter === "All" || p.category === filter);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.18em] text-electric">Portfolio</div>
          <h1 className="mt-2 font-display text-5xl font-bold tracking-tight md:text-6xl">Projects & case studies</h1>
          <p className="mt-4 text-lg text-muted-foreground">A selection of work spanning AI products, developer tools and SaaS experiments.</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                filter === c
                  ? "bg-gradient-to-r from-violet to-electric text-white"
                  : "border border-border/60 bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass h-64 rounded-2xl shimmer" />)}
          {filtered.map((p, i) => (
            <motion.article key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group glass relative flex flex-col overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1 hover:glow-violet">
              {p.featured && (
                <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-violet to-electric px-2 py-0.5 text-[10px] font-medium text-white">Featured</span>
              )}
              <div className="mb-3 text-[10px] uppercase tracking-wider text-electric">{p.category}</div>
              <h2 className="font-display text-xl font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              {p.long_description && <p className="mt-3 text-xs text-muted-foreground/80">{p.long_description}</p>}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{t}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm">
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Github className="h-3.5 w-3.5" />Code</a>
                )}
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-electric"><ExternalLink className="h-3.5 w-3.5" />Live</a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
