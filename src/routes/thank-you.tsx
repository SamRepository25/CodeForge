import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thanks — CodeForge" },
      { name: "description", content: "Your message was sent successfully." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-r from-violet to-electric">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold gradient-text sm:text-4xl">
          Message sent
        </h1>
        <p className="mt-3 text-muted-foreground">
          Thanks for reaching out — I usually reply within a few days. In the meantime, feel free to
          look around.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-gradient-to-r from-violet to-electric px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to home
          </Link>
          <Link
            to="/projects"
            className="rounded-xl border border-border/60 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            View projects
          </Link>
          <Link
            to="/blog"
            className="rounded-xl border border-border/60 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Read the blog
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
