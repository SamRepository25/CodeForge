import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Code2, Cpu, FileText, Github, GraduationCap, Layers, Linkedin, MessageSquareCode, Rocket, Sparkles, Wand2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/edit/EditableText";

const SITE_URL = "https://codeforgedev.vercel.app";
const OG_IMAGE = "https://codeforgedev.vercel.app/og-image.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeForge — Developer Portfolio & Technical Blog" },
      { name: "description", content: "A personal portfolio for software projects, cybersecurity experiments, networking work, and technical notes." },
      { name: "keywords", content: "developer portfolio, software projects, cybersecurity, networking, Python, React, TypeScript, technical blog" },
      { property: "og:title", content: "CodeForge — Developer Portfolio & Technical Blog" },
      { property: "og:description", content: "Projects, experiments, technical notes, and things worth building." },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:title", content: "CodeForge — Developer Portfolio & Technical Blog" },
      { name: "twitter:description", content: "Projects, experiments, technical notes, and things worth building." },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "CodeForge",
        url: SITE_URL,
        jobTitle: "Computer Science Student & Developer",
        sameAs: ["https://github.com/SamRepository25", "https://linkedin.com/in/simakahmed"],
      }),
    }],
  }),
  component: Home,
});

const AI_TOOLS = [
  { slug: "resume-builder", title: "AI Resume Builder", desc: "Craft ATS-ready resumes from your raw experience.", icon: FileText },
  { slug: "study-notes", title: "Study Notes Generator", desc: "Turn any topic into structured notes and summaries.", icon: BookOpen },
  { slug: "quiz-generator", title: "Quiz Generator", desc: "Create focused MCQ practice for any subject.", icon: GraduationCap },
  { slug: "code-explainer", title: "Code Explainer", desc: "Break down unfamiliar code into understandable pieces.", icon: MessageSquareCode },
  { slug: "interview-questions", title: "Interview Q Generator", desc: "Generate targeted questions for technical interview practice.", icon: Cpu },
  { slug: "text-improver", title: "Text Improver", desc: "Clean up clarity, grammar, and tone while keeping your voice.", icon: Wand2 },
];

function Home() {
  const qc = useQueryClient();
  const { editMode } = useEditMode();

  const featuredProjects = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("featured", true).order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });

  const settings = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((r) => { map[r.key] = r.value ?? ""; });
      return map;
    },
  });

  const saveSetting = async (key: string, value: string) => {
    await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  const s = settings.data ?? {};

  const posts = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("id,slug,title,excerpt,cover_image,category,reading_time,created_at").eq("published", true).order("created_at", { ascending: false }).limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-violet" />
              <span className="text-muted-foreground">CSE student • developer • builder</span>
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              {editMode ? (
                <EditableText value={s.hero_title ?? "I build things, learn from them, and share what works."} onSave={(v) => saveSetting("hero_title", v)} as="span" className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl" />
              ) : (() => {
                const title = s.hero_title ?? "I build things, learn from them, and share what works.";
                const spaceIdx = title.indexOf(" ");
                const first = spaceIdx === -1 ? title : title.slice(0, spaceIdx);
                const rest = spaceIdx === -1 ? "" : title.slice(spaceIdx);
                return <><span className="gradient-text">{first}</span>{rest}</>;
              })()}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              <EditableText value={s.hero_description ?? "A personal space for projects, experiments, technical notes, and the things I'm learning along the way."} onSave={(v) => saveSetting("hero_description", v)} as="span" multiline />
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-violet to-electric text-white shadow-lg shadow-violet/30 hover:opacity-95">
                <Link to="/projects">See what I've built <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl"><Link to="/about">A little about me</Link></Button>
            </div>
            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-muted-foreground">
              <span>Software development</span><span>Cybersecurity</span><span>Networking</span><span>Always learning</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { title: "Build", text: "Useful projects that solve a real problem or teach me something new.", icon: Code2 },
              { title: "Learn", text: "Python, networking, cybersecurity, and the fundamentals behind the tools I use.", icon: Layers },
              { title: "Share", text: "Technical notes and practical write-ups from things I've actually worked through.", icon: BookOpen },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6 text-left">
                <item.icon className="h-5 w-5 text-electric" />
                <h2 className="mt-4 font-display text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading eyebrow="Selected work" title="Projects I'm proud of" cta={{ to: "/projects", label: "All projects" }} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {(featuredProjects.data ?? []).map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group glass relative flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet to-transparent opacity-40" />
              <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</div>
              <h3 className="font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{(p.tags ?? []).map((t: string) => <span key={t} className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{t}</span>)}</div>
              <Link to="/projects" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-electric group-hover:gap-2">View project <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>
            </motion.div>
          ))}
          {featuredProjects.isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass h-56 rounded-2xl animate-pulse" />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading eyebrow="Writing" title="Notes from the journey" cta={{ to: "/blog", label: "Read all posts" }} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.data && posts.data.length > 0 ? posts.data.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-wider text-electric">{p.category ?? "Article"}</div>
              <h3 className="mt-2 font-display text-lg font-semibold"><Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:gradient-text">{p.title}</Link></h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{p.excerpt}</p>
              <div className="mt-4 text-xs text-muted-foreground">{p.reading_time} min read</div>
            </motion.div>
          )) : <div className="glass md:col-span-3 rounded-2xl p-10 text-center text-sm text-muted-foreground">No published posts yet.</div>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading eyebrow="Tools I use" title="A stack built around learning" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { title: "Web", icon: Layers, items: ["React", "TypeScript", "Tailwind CSS", "TanStack Router", "Framer Motion"] },
            { title: "Backend & Data", icon: Code2, items: ["Python", "Flask", "Supabase", "PostgreSQL", "REST APIs"] },
            { title: "Developer Tools", icon: Cpu, items: ["Git", "GitHub", "VS Code", "Linux", "Vercel"] },
          ].map((g) => (
            <div key={g.title} className="glass gradient-border rounded-2xl p-6">
              <div className="flex items-center gap-2"><g.icon className="h-4 w-4 text-electric" /><h3 className="font-display text-base font-semibold">{g.title}</h3></div>
              <ul className="mt-4 flex flex-wrap gap-2">{g.items.map((it) => <li key={it} className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-mono">{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="glass-strong gradient-border relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
          <div className="absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-violet/30 blur-[120px]" aria-hidden />
          <div className="relative">
            <Rocket className="mx-auto mb-4 h-8 w-8 text-electric" />
            <h2 className="font-display text-3xl font-bold md:text-5xl">Have a project in mind?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">I'm interested in useful problems, interesting technical conversations, and things worth building.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-violet to-electric text-white"><a href="mailto:simakahmed@outlook.com">Get in touch</a></Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl"><a href="https://github.com/SamRepository25" target="_blank" rel="noreferrer"><Github className="mr-1.5 h-4 w-4" />GitHub</a></Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl"><a href="https://linkedin.com/in/simakahmed" target="_blank" rel="noreferrer"><Linkedin className="mr-1.5 h-4 w-4" />LinkedIn</a></Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeading({ eyebrow, title, cta }: { eyebrow: string; title: string; cta?: { to: string; label: string } }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.18em] text-electric">{eyebrow}</div><h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{title}</h2></div>{cta && <Link to={cta.to} className="group inline-flex items-center gap-1 rounded-lg border border-border/60 bg-white/5 px-3 py-1.5 text-sm hover:border-violet/60">{cta.label} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>}</div>;
}
