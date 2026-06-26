import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
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

const PROJECTS = [
  {
    id: "1",
    category: "Web Development",
    title: "Login Authentication System",
    description: "A secure login and registration system built with Python featuring user authentication, password validation, and session management.",
    tags: ["Python", "HTML", "CSS"],
    github: "https://github.com/yourusername/login-authentication-system",
  },
  {
    id: "2",
    category: "AI / Education",
    title: "AI Study Planner",
    description: "A Java-based study planner that helps students organize subjects, create study schedules, and improve productivity using Object-Oriented Programming concepts.",
    tags: ["Java", "OOP"],
    github: "https://github.com/yourusername/ai-study-planner",
  },
  {
    id: "3",
    category: "C Programming",
    title: "Rock Paper Scissors Game",
    description: "A console-based Rock Paper Scissors game developed in C featuring random computer moves, score tracking, input validation, and continuous gameplay.",
    tags: ["C", "Standard Library", "Random Number Generation"],
    github: "https://github.com/yourusername/rock-paper-scissors",
  },
  {
    id: "4",
    category: "Group Project",
    title: "Robotics and Automation",
    description: "Designed and developed a Water Sprinkler and Humidity Sensor Robot as part of a group project. The system monitors humidity levels and automatically activates a water sprinkler when required, demonstrating practical applications of sensors, automation, and embedded systems.",
    tags: ["C", "Arduino", "Embedded Systems", "Sensors", "Automation"],
    github: "https://github.com/yourusername/robotics-automation",
  },
];

function Projects() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-24">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.18em] text-electric">Portfolio</div>
          <h1 className="mt-2 font-display text-5xl font-bold tracking-tight md:text-6xl">Projects & case studies</h1>
          <p className="mt-4 text-lg text-muted-foreground">A selection of work spanning AI products, developer tools and SaaS experiments.</p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group glass relative flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-1"
            >
              {/* Top gradient line */}
              <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-violet to-transparent opacity-40" />

              {/* Category badge */}
              <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {p.category}
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-semibold">{p.title}</h3>

              {/* Description */}
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>

              {/* Tech tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex items-center gap-3">
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-electric transition hover:opacity-80"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground/60 cursor-default select-none">
                  <ExternalLink className="h-3 w-3" />
                  Coming Soon
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
