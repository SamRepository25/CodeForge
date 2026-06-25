import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { motion } from "framer-motion";
import { FileText, BookOpen, GraduationCap, MessageSquareCode, Brain, Wand2, Code2, Sparkles, ArrowRight } from "lucide-react";

const URL_AI = "https://codeforgedev.vercel.app/ai-tools";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({
    meta: [
      { title: "AI Tools Hub — CodeForge" },
      { name: "description", content: "AI-powered productivity tools: resume builder, study notes, quizzes, code explainer, interview prep, and more." },
      { property: "og:title", content: "AI Tools Hub — CodeForge" },
      { property: "og:description", content: "AI productivity tools for developers and students." },
      { property: "og:url", content: URL_AI },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_AI }],
  }),
  component: Hub,
});


const TOOLS = [
  { slug: "resume-builder", title: "AI Resume Builder", desc: "ATS-ready resumes from your raw experience.", icon: FileText, accent: "from-violet to-fuchsia-500" },
  { slug: "study-notes", title: "Study Notes Generator", desc: "Topics → structured study material.", icon: BookOpen, accent: "from-sky-500 to-electric" },
  { slug: "quiz-generator", title: "Quiz Generator", desc: "10-question MCQ quiz from any topic.", icon: GraduationCap, accent: "from-emerald-500 to-electric" },
  { slug: "code-explainer", title: "Code Explainer", desc: "Senior-dev clarity on any snippet.", icon: MessageSquareCode, accent: "from-violet to-pink-500" },
  { slug: "pdf-summarizer", title: "Text / PDF Summarizer", desc: "Paste any text, get a clean summary.", icon: Sparkles, accent: "from-fuchsia-500 to-violet" },
  { slug: "interview-questions", title: "Interview Question Generator", desc: "Targeted interview prep for any role.", icon: Brain, accent: "from-amber-500 to-rose-500" },
  { slug: "text-improver", title: "Text Improver", desc: "Refine tone, clarity & grammar.", icon: Wand2, accent: "from-electric to-violet" },
  { slug: "programming-assistant", title: "Programming Assistant", desc: "Pair-program with a senior engineer.", icon: Code2, accent: "from-violet to-electric" },
];

function Hub() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass gradient-border inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-electric">
            🚧 AI Tools Are Currently Under Development!
          </div>
          <div className="mt-12 text-xs uppercase tracking-[0.18em] text-electric">AI Hub</div>
          <h1 className="mt-2 font-display text-5xl font-bold tracking-tight md:text-6xl">A toolbelt powered by AI</h1>
          <p className="mt-4 text-lg text-muted-foreground">Eight focused tools — to help you build, learn and ship faster.</p>
        </div>
        <div className="mt-12 grid gap-5 pb-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map((t, i) => (
            <motion.div key={t.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to="/ai-tools/$tool" params={{ tool: t.slug }} className="group glass relative block h-full overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1 hover:glow-violet">
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${t.accent} text-white`}>
                  <t.icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-lg font-semibold">{t.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-electric">Launch <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
