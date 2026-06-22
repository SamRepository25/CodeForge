import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, FileText, Briefcase, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — CodeForge" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  component: Admin,
});

function Admin() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [posts, comments, projects, profiles] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      return { posts: posts.count ?? 0, comments: comments.count ?? 0, projects: projects.count ?? 0, profiles: profiles.count ?? 0 };
    },
  });

  const recentPosts = useQuery({
    queryKey: ["admin-recent-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("id,title,slug,published,views,created_at").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-electric">Admin</div>
            <h1 className="mt-2 font-display text-4xl font-bold">Site overview</h1>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: "Posts", v: stats.data?.posts ?? 0, icon: FileText },
            { l: "Comments", v: stats.data?.comments ?? 0, icon: MessageCircle },
            { l: "Projects", v: stats.data?.projects ?? 0, icon: Briefcase },
            { l: "Users", v: stats.data?.profiles ?? 0, icon: Users },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-5">
              <s.icon className="h-4 w-4 text-electric" />
              <div className="mt-3 font-display text-3xl font-bold gradient-text">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Recent posts</h2>
          <div className="glass mt-4 divide-y divide-border/40 rounded-2xl">
            {(recentPosts.data ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.published ? "Published" : "Draft"} · {p.views} views · {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                {p.published && <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-xs text-electric">View →</Link>}
              </div>
            ))}
            {(recentPosts.data ?? []).length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No posts yet.</div>}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
