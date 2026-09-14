import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Users,
  FileText,
  Briefcase,
  MessageCircle,
  Mail,
  MailOpen,
  Archive,
  Trash,
  Paperclip,
  Reply,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — CodeForge" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  component: Admin,
});

type ContactAttachment = {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
};
type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  contact_attachments: ContactAttachment[];
};

function Admin() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const contactMessages = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select(
          "id,name,email,subject,message,status,created_at,contact_attachments(id,file_name,mime_type,size_bytes,storage_path)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContactMessage[];
    },
  });

  const unreadCount = (contactMessages.data ?? []).filter((m) => m.status === "unread").length;

  const toggleExpand = async (m: ContactMessage) => {
    const next = expandedId === m.id ? null : m.id;
    setExpandedId(next);
    if (next && m.status === "unread") {
      await supabase.from("contact_messages").update({ status: "read" }).eq("id", m.id);
      await contactMessages.refetch();
    }
  };

  const archiveMessage = async (id: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: "archived" })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Message archived");
    await contactMessages.refetch();
  };

  const deleteMessage = async (m: ContactMessage) => {
    if (!window.confirm("Delete this message and its attachments? This can't be undone.")) return;
    if (m.contact_attachments.length > 0) {
      await supabase.storage
        .from("contact-attachments")
        .remove(m.contact_attachments.map((a) => a.storage_path));
    }
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Message deleted");
    await contactMessages.refetch();
  };

  const downloadAttachment = async (a: ContactAttachment) => {
    const { data, error } = await supabase.storage
      .from("contact-attachments")
      .createSignedUrl(a.storage_path, 60);
    if (error || !data?.signedUrl) {
      toast.error("Couldn't generate a download link");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [posts, comments, projects, profiles] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      return {
        posts: posts.count ?? 0,
        comments: comments.count ?? 0,
        projects: projects.count ?? 0,
        profiles: profiles.count ?? 0,
      };
    },
  });

  const recentPosts = useQuery({
    queryKey: ["admin-recent-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id,title,slug,published,views,created_at")
        .order("created_at", { ascending: false })
        .limit(10);
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

    const { error } = await supabase.from("guest_comments").delete().eq("id", commentId);
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
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-electric">Admin</div>
            <h1 className="mt-2 font-display text-4xl font-bold">Site overview</h1>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { l: "Posts", v: stats.data?.posts ?? 0, icon: FileText },
            { l: "Comments", v: stats.data?.comments ?? 0, icon: MessageCircle },
            { l: "Projects", v: stats.data?.projects ?? 0, icon: Briefcase },
            { l: "Users", v: stats.data?.profiles ?? 0, icon: Users },
            { l: "Unread messages", v: unreadCount, icon: Mail },
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
                  <div className="text-xs text-muted-foreground">
                    {p.published ? "Published" : "Draft"} · {p.views} views ·{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
                {p.published && (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="text-xs text-electric"
                  >
                    View →
                  </Link>
                )}
              </div>
            ))}
            {(recentPosts.data ?? []).length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No posts yet.</div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Messages</h2>
          <div className="glass mt-4 divide-y divide-border/40 rounded-2xl">
            {(contactMessages.data ?? []).map((m) => (
              <div key={m.id} className="p-4">
                <button
                  type="button"
                  onClick={() => void toggleExpand(m)}
                  className="flex w-full items-start justify-between gap-3 text-left text-sm"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {m.status === "unread" ? (
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
                    ) : (
                      <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <div
                        className={`truncate font-medium ${m.status === "unread" ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {m.subject || "(no subject)"}{" "}
                        <span className="font-normal text-muted-foreground">— {m.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.email} · {new Date(m.created_at).toLocaleString()}
                        {m.contact_attachments.length > 0 && (
                          <>
                            {" "}
                            · <Paperclip className="inline h-3 w-3" />{" "}
                            {m.contact_attachments.length}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {m.status === "archived" && (
                    <span className="shrink-0 rounded-full border border-border/60 px-2 py-1 text-[11px] text-muted-foreground">
                      Archived
                    </span>
                  )}
                </button>

                {expandedId === m.id && (
                  <div className="mt-3 space-y-3 border-t border-border/30 pt-3">
                    <p className="whitespace-pre-wrap text-sm text-foreground">{m.message}</p>
                    {m.contact_attachments.length > 0 && (
                      <ul className="space-y-1.5">
                        {m.contact_attachments.map((a) => (
                          <li key={a.id}>
                            <button
                              type="button"
                              onClick={() => void downloadAttachment(a)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 py-1.5 text-xs text-electric hover:bg-electric/10"
                            >
                              <Paperclip className="h-3 w-3" />
                              {a.file_name}{" "}
                              <span className="text-muted-foreground">
                                ({(a.size_bytes / 1024).toFixed(0)} KB)
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`}
                      >
                        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg">
                          <Reply className="h-3.5 w-3.5" />
                          Reply
                        </Button>
                      </a>
                      {m.status !== "archived" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-lg"
                          onClick={() => void archiveMessage(m.id)}
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Archive
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 rounded-lg text-red-400"
                        onClick={() => void deleteMessage(m)}
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(contactMessages.data ?? []).length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No messages yet.</div>
            )}
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
                  <tr
                    key={comment.id}
                    className="border-b border-border/30 align-top last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium">{comment.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{comment.email}</td>
                    <td className="max-w-md px-4 py-3">
                      <p className="line-clamp-3 whitespace-pre-wrap text-foreground">
                        {comment.content}
                      </p>
                    </td>
                    <td className="px-4 py-3">{comment.postTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </td>
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
              <div className="p-6 text-center text-sm text-muted-foreground">
                No guest comments found.
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
