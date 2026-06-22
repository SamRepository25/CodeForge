import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PostEditor } from "@/components/PostEditor";

export const Route = createFileRoute("/_authenticated/dashboard/new")({
  head: () => ({ meta: [{ title: "New post — CodeForge" }] }),
  component: NewPost,
});

function NewPost() {
  const navigate = useNavigate();
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 pt-12 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">Write a new article</h1>
        <PostEditor onSaved={() => navigate({ to: "/dashboard" })} />
      </section>
    </SiteLayout>
  );
}
