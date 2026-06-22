import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PostEditor, type PostDraft } from "@/components/PostEditor";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/edit/$id")({
  head: () => ({ meta: [{ title: "Edit post — CodeForge" }] }),
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDraft | null>(null);

  useEffect(() => {
    supabase.from("posts").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (!data) { toast.error("Post not found"); navigate({ to: "/dashboard" }); return; }
      setPost(data as PostDraft);
    });
  }, [id, navigate]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 pt-12 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">Edit article</h1>
        {post && <PostEditor existing={post} onSaved={() => navigate({ to: "/dashboard" })} />}
      </section>
    </SiteLayout>
  );
}
