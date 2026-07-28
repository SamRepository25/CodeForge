import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Clock, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const URL_BLOG = "https://codeforgedev.vercel.app/blog";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — CodeForge" },
      { name: "description", content: "Technical articles, tutorials and reflections on building modern web apps." },
      { property: "og:title", content: "Blog — CodeForge" },
      { property: "og:description", content: "Technical articles & tutorials on React, TypeScript and modern web development." },
      { property: "og:url", content: URL_BLOG },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_BLOG }],
  }),
  component: Blog,
});


function Blog() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["posts", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,slug,title,excerpt,category,tags,reading_time,created_at,cover_image,featured")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((p) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return p.title.toLowerCase().includes(s) || (p.excerpt ?? "").toLowerCase().includes(s) || (p.tags ?? []).join(" ").toLowerCase().includes(s);
  });
  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.18em] text-electric">Writing</div>
            <h1 className="mt-2 font-display text-5xl font-bold tracking-tight md:text-6xl">The blog</h1>
            <p className="mt-4 text-lg text-muted-foreground">Long-form notes on building, shipping & learning in public.</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles..." className="rounded-xl pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass h-56 rounded-2xl shimmer" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="glass mt-12 rounded-2xl p-16 text-center">
            <p className="text-muted-foreground">No posts found{q ? ` matching “${q}”` : " yet"}.</p>
            <Link to="/dashboard" className="mt-4 inline-block text-sm text-electric">Write the first one →</Link>
          </div>
        ) : (
          <>
            {featured && (
              <Link to="/blog/$slug" params={{ slug: featured.slug }} className="glass gradient-border mt-12 block overflow-hidden rounded-3xl p-8 transition hover:-translate-y-1 md:p-12">
                <div className="text-xs uppercase tracking-wider text-electric">Featured · {featured.category}</div>
                <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{featured.title}</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm text-electric">
                  Read article <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            )}
            <div className="mt-10 grid gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="glass group flex flex-col rounded-2xl p-6 transition hover:-translate-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-electric">{p.category ?? "Article"}</div>
                  <h3 className="mt-2 font-display text-lg font-semibold group-hover:gradient-text">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.reading_time} min</span>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
