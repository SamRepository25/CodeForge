import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Sparkles, Code2, Download, Github, Linkedin, Mail } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

const URL_ABOUT = "https://codeforgedev.lovable.app/about";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CodeForge" },
      { name: "description", content: "Software developer & AI enthusiast building modern tools and sharing what I learn along the way." },
      { property: "og:title", content: "About — CodeForge" },
      { property: "og:description", content: "About the developer behind CodeForge." },
      { property: "og:url", content: URL_ABOUT },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_ABOUT }],
  }),
  component: About,
});


const EDU = [
  { year: "2024 — present", title: "B.E. Computer Science", org: "Independent Study & Online Programs", desc: "Focus on systems, AI/ML and modern web architecture." },
  { year: "2022 — 2024", title: "Foundations", org: "Self-taught + bootcamps", desc: "Full-stack web, TypeScript, design systems, databases." },
];

const EXP = [
  { year: "2025", title: "Indie Developer", org: "CodeForge", desc: "Building portfolio, blog & AI productivity tools as a public-build project." },
  { year: "2024", title: "Open Source Contributor", org: "Various", desc: "Contributing to React, Tailwind ecosystem libraries and AI tooling." },
  { year: "2023", title: "Freelance Web Developer", org: "Remote", desc: "Shipped marketing sites, dashboards and SaaS MVPs for early-stage teams." },
];

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-12">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-violet" /> About me
            </div>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-tight md:text-6xl">
              Hi, I'm the <span className="gradient-text">CodeForge</span> builder.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Software Developer & AI Enthusiast. I build modern web applications, AI-powered tools and write about everything I learn for developers and students.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-gradient-to-r from-violet to-electric text-white">
                <a href="#" download><Download className="mr-1.5 h-4 w-4" />Download Resume</a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href="mailto:hello@codeforge.dev"><Mail className="mr-1.5 h-4 w-4" />Contact</a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href="https://github.com/placeholder" target="_blank" rel="noreferrer"><Github className="mr-1.5 h-4 w-4" />GitHub</a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href="https://linkedin.com/in/placeholder" target="_blank" rel="noreferrer"><Linkedin className="mr-1.5 h-4 w-4" />LinkedIn</a>
              </Button>
            </div>
          </div>
          <div className="float-slow glass-strong gradient-border relative grid h-56 w-56 place-items-center rounded-[2.5rem] glow-violet">
            <Code2 className="h-24 w-24 text-electric" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-3xl font-bold">Experience</h2>
        <div className="mt-8 space-y-4">
          {EXP.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass flex gap-5 rounded-2xl p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet to-electric"><Briefcase className="h-4 w-4 text-white" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{e.title} <span className="text-muted-foreground">· {e.org}</span></h3>
                  <span className="text-xs text-electric">{e.year}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-3xl font-bold">Education</h2>
        <div className="mt-8 space-y-4">
          {EDU.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass flex gap-5 rounded-2xl p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-electric to-violet"><GraduationCap className="h-4 w-4 text-white" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{e.title} <span className="text-muted-foreground">· {e.org}</span></h3>
                  <span className="text-xs text-electric">{e.year}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="glass gradient-border rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold">Let's build something together</h2>
          <p className="mt-2 text-muted-foreground">Open to collaborations, freelance work and conversations.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"><a href="mailto:hello@codeforge.dev">Get in touch</a></Button>
            <Button asChild variant="outline" className="rounded-xl"><Link to="/projects">See my work</Link></Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
