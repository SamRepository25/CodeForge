import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://codeforgedev.vercel.app";
const OG_IMAGE = "https://codeforgedev.vercel.app/og-image.png";

export const Route = createFileRoute("/resume-access")({
  head: () => ({
    meta: [
      { title: "Resume Access Instructions — CodeForge" },
      { name: "description", content: "Instructions for requesting view-only access to the CodeForge resume." },
      { property: "og:title", content: "Resume Access Instructions — CodeForge" },
      { property: "og:url", content: SITE_URL + "/resume-access" },
      { property: "og:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/resume-access" }],
  }),
  component: ResumeAccessPage,
});

function ResumeAccessPage() {
  const settings = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((item) => [item.key, item.value ?? ""]));
    },
  });

  const resumeUrl = settings.data?.resume_url;

  return (
    <SiteLayout>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16">
        <section className="glass gradient-border w-full rounded-3xl p-7 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet/15 text-electric">
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">Access My Resume</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Please sign in to your Google Drive to request access to my resume.
          </p>
          <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-border/70 bg-card/50 p-5 text-left">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-electric" />
              Important Instructions
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              <li>Please select <strong className="text-foreground">Viewer</strong> when requesting access.</li>
              <li>Editor and Commenter access requests will not be approved.</li>
              <li>Access will be granted only with Viewer permissions.</li>
              <li>If you're not signed in to Google, please sign in when prompted.</li>
            </ul>
          </div>
          <Button asChild size="lg" disabled={!resumeUrl} className="mt-7 rounded-xl bg-gradient-to-r from-violet to-electric text-white">
            <a href={resumeUrl || undefined} target="_blank" rel="noreferrer">
              OK, Proceed <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          {!resumeUrl && (
            <p className="mt-3 text-xs text-muted-foreground">
              Resume link is currently unavailable. Please try again later.
            </p>
          )}
        </section>
      </main>
    </SiteLayout>
  );
}
