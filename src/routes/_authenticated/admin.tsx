import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, FileText, Briefcase, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const guestComments = useQuery({
    queryKey: ["admin-guest-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guest_comments")
        .select("id,name,email,content,approved,created_at,post_id")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const postIds = Array.from(new Set((data ?? []).map((c) => c.post_id)));
      if (postIds.length === 0) {
        return [];
      }

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id,title")
        .in("id", postIds);
      if (postsError) throw postsError;

      const titleByPostId = new Map((posts ?? []).map((p) => [p.id, p.title]));
      return (data ?? []).map((comment) => ({
        ...comment,
        postTitle: titleByPostId.get(comment.post_id) ?? "Unknown post",
      }));
    },
  });

  const approveComment = async (commentId: string) => {
    const { error } = await supabase
      .from("guest_comments")
      .update({ approved: true })
      .eq("id", commentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Comment approved");
    await guestComments.refetch();
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    const { error } = await supabase
      .from("guest_comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Comment deleted");
    await guestComments.refetch();
  };

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

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Guest Comment Moderation</h2>
          <div className="glass mt-4 overflow-x-auto rounded-2xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(guestComments.data ?? []).map((comment) => (
                  <tr key={comment.id} className="border-b border-border/30 align-top last:border-b-0">
                    <td className="px-4 py-3 font-medium">{comment.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{comment.email}</td>
                    <td className="max-w-md px-4 py-3">
                      <p className="line-clamp-3 whitespace-pre-wrap text-foreground">{comment.content}</p>
                    </td>
                    <td className="px-4 py-3">{comment.postTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-[11px] ${
                          comment.approved
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {comment.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {!comment.approved && (
                          <Button
                            onClick={() => void approveComment(comment.id)}
                            size="sm"
                            className="h-8 rounded-lg bg-gradient-to-r from-violet to-electric text-white"
                          >
                            ✅ Approve
                          </Button>
                        )}
                        <Button
                          onClick={() => void deleteComment(comment.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg"
                        >
                          {comment.approved ? "🗑 Delete" : "❌ Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(guestComments.data ?? []).length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No guest comments found.</div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
