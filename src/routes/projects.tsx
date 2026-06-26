import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

const URL_PROJECTS = "https://codeforgedev.vercel.app/projects";
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
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.18em] text-electric">Portfolio</div>
          <h1 className="mt-2 font-display text-5xl font-bold tracking-tight md:text-6xl">Projects & case studies</h1>
          <p className="mt-4 text-lg text-muted-foreground">A selection of work spanning AI products, developer tools and SaaS experiments.</p>
        </div>

        <div className="flex min-h-[50vh] items-center justify-center pb-20 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass gradient-border w-full max-w-2xl rounded-3xl p-12 text-center"
          >
            <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-violet/20 blur-[80px]" aria-hidden />
            <div className="relative">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet to-electric glow-violet">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-display text-3xl font-bold">🚀 Projects Coming Soon</h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                I'm currently building high-quality software development, AI, cybersecurity, and web development projects. They'll be published here soon as they are completed.
              </p>
              <p className="mt-4 text-sm font-medium text-electric">Check back soon for updates!</p>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
