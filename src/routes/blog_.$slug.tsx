import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Heart, Bookmark, Clock, ArrowLeft, Send } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("posts")
      .select("title,excerpt,cover_image,created_at,updated_at,tags,reading_time")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    return { meta: data };
  },
  head: ({ params, loaderData }) => {
    const url = `https://codeforgedev.vercel.app/blog/${params.slug}`;
    const m = loaderData?.meta;
    const title = m?.title ? `${m.title} — CodeForge` : "Article — CodeForge";
    const description = m?.excerpt ?? "Technical article on the CodeForge blog.";
    const image = m?.cover_image ?? "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:image", content: image },
        ...(m?.created_at ? [{ property: "article:published_time", content: m.created_at } as const] : []),
        ...(m?.updated_at ? [{ property: "article:modified_time", content: m.updated_at } as const] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: m
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: m.title,
                description,
                image,
                url,
                datePublished: m.created_at,
                dateModified: m.updated_at ?? m.created_at,
                keywords: (m.tags ?? []).join(", "),
                author: { "@type": "Person", name: "CodeForge" },
                publisher: { "@type": "Organization", name: "CodeForge" },
                mainEntityOfPage: url,
              }),
            },
          ]
        : [],
    };
  },
  component: PostPage,
});


function PostPage() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = "codeforge_visitor_id";
    const existingVisitorId = window.localStorage.getItem(storageKey);
    if (existingVisitorId) {
      setVisitorId(existingVisitorId);
      return;
    }

    const newVisitorId = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(storageKey, newVisitorId);
    setVisitorId(newVisitorId);
  }, []);


const post = useQuery({
  queryKey: ["post", slug],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error(error);
      throw error;
    }

    if (!data) throw notFound();

    return data;
  },
});
  const likes = useQuery({
    queryKey: ["likes", post.data?.id],
    enabled: !!post.data?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("guest_likes")
        .select("id", { count: "exact", head: true })
        .eq("post_id", post.data!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const myLike = useQuery({
    queryKey: ["my-like", post.data?.id, visitorId],
    enabled: !!post.data?.id && !!visitorId,
    queryFn: async () => {
      const { data } = await supabase
        .from("guest_likes")
        .select("id")
        .eq("post_id", post.data!.id)
        .eq("visitor_id", visitorId!)
        .maybeSingle();
      return !!data;
    },
  });

  const myBookmark = useQuery({
    queryKey: ["my-bookmark", post.data?.id, visitorId],
    enabled: !!post.data?.id && !!visitorId,
    queryFn: async () => {
      const { data } = await supabase
        .from("guest_bookmarks")
        .select("id")
        .eq("post_id", post.data!.id)
        .eq("visitor_id", visitorId!)
        .maybeSingle();
      return !!data;
    },
  });

  const comments = useQuery({
    queryKey: ["comments", post.data?.id],
    enabled: !!post.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guest_comments")
        .select("id,name,content,created_at")
        .eq("post_id", post.data!.id)
        .eq("approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const related = useQuery({
    queryKey: ["related", post.data?.category, post.data?.id],
    enabled: !!post.data?.id,
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("id,slug,title,reading_time").eq("published", true).neq("id", post.data!.id).limit(3);
      return data ?? [];
    },
  });

  // bump views
  useEffect(() => {
    if (post.data?.id) {
      supabase.rpc as never; // no rpc, do raw update
      supabase.from("posts").update({ views: (post.data.views ?? 0) + 1 }).eq("id", post.data.id).then(() => {});
    }
     
  }, [post.data?.id]);

  if (post.isLoading) return <SiteLayout><div className="mx-auto max-w-3xl px-4 py-20"><div className="glass h-96 rounded-2xl shimmer" /></div></SiteLayout>;
  if (!post.data) return null;
  const p = post.data;

  const toggleLike = async () => {
    if (!visitorId) {
      toast.error("Please try again in a moment.");
      return;
    }

    let error = null;
    if (myLike.data) {
      const result = await supabase.from("guest_likes").delete().eq("post_id", p.id).eq("visitor_id", visitorId);
      error = result.error;
    } else {
      const result = await supabase.from("guest_likes").insert({ post_id: p.id, visitor_id: visitorId });
      error = result.error;
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    await Promise.all([likes.refetch(), myLike.refetch()]);
  };

  const toggleBookmark = async () => {
    if (!visitorId) {
      toast.error("Please try again in a moment.");
      return;
    }

    let error = null;
    if (myBookmark.data) {
      const result = await supabase.from("guest_bookmarks").delete().eq("post_id", p.id).eq("visitor_id", visitorId);
      error = result.error;
    } else {
      const result = await supabase.from("guest_bookmarks").insert({ post_id: p.id, visitor_id: visitorId });
      error = result.error;
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(myBookmark.data ? "Bookmark removed" : "Bookmarked");
    await myBookmark.refetch();
  };

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 pt-12 pb-20">
        <button onClick={() => router.history.back()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back</button>

        <div className="mt-6 text-xs uppercase tracking-wider text-electric">{p.category}</div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{p.title}</h1>
        {p.excerpt && <p className="mt-4 text-lg text-muted-foreground">{p.excerpt}</p>}

        <div className="mt-6 flex items-center gap-3 border-b border-border/40 pb-6">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet to-electric text-sm font-bold text-white">
            {"C"}
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium">{p.profiles?.display_name ?? p.profiles?.username ?? "Author"}</div>
            <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()} · <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.reading_time} min read</span></div>
          </div>
          <button onClick={toggleLike} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${myLike.data ? "border-violet text-violet" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>
            <Heart className={`h-3.5 w-3.5 ${myLike.data ? "fill-violet" : ""}`} />{likes.data ?? 0}
          </button>
          <button onClick={toggleBookmark} aria-label="Bookmark article" className={`grid h-8 w-8 place-items-center rounded-full border transition ${myBookmark.data ? "border-electric text-electric" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>
            <Bookmark className={`h-3.5 w-3.5 ${myBookmark.data ? "fill-electric" : ""}`} />
          </button>
        </div>

        <div className="prose-content mt-10 whitespace-pre-wrap text-base leading-relaxed">
          {p.content}
        </div>

        <div className="mt-8 flex flex-wrap gap-1.5">
          {(p.tags ?? []).map((t) => (
            <span key={t} className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">#{t}</span>
          ))}
        </div>

        {/* Comments */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Comments</h2>
          <CommentForm postId={p.id} onPosted={() => comments.refetch()} />
          <div className="mt-6 space-y-4">
            {(comments.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No approved comments yet. Be the first to comment.</p>}
            {(comments.data ?? []).map((c) => (
              <div key={c.id} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet to-electric text-[10px] font-bold text-white">
                    {(c.name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="font-medium">{c.name ?? "Guest"}</div>
                  <span className="text-muted-foreground">· {new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm">{c.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        {(related.data ?? []).length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold">Related articles</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {related.data!.map((r) => (
                <Link key={r.id} to="/blog/$slug" params={{ slug: r.slug }} className="glass rounded-xl p-4 transition hover:-translate-y-0.5">
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <div className="mt-2 text-xs text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{r.reading_time} min</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}

function CommentForm({ postId, onPosted }: { postId: string; onPosted: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !text.trim()) {
      toast.error("Name, email, and comment are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("guest_comments").insert({
      name: name.trim(),
      email: email.trim(),
      content: text.trim(),
      post_id: postId,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setName("");
    setEmail("");
    setText("");
    toast.success("Comment submitted for review.");
    onPosted();
  };
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl"
          maxLength={100}
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Your email"
          className="rounded-xl"
          maxLength={255}
        />
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a thoughtful comment..." className="mt-3 rounded-xl" rows={3} maxLength={1000} />
      <div className="mt-2 flex justify-end">
        <Button onClick={submit} disabled={busy || !name.trim() || !email.trim() || !text.trim()} className="rounded-lg bg-gradient-to-r from-violet to-electric text-white">
          <Send className="mr-1.5 h-3.5 w-3.5" />Post comment
        </Button>
      </div>
    </div>
  );
}
