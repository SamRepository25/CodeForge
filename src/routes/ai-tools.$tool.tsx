import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runAiTool, TOOL_PROMPTS } from "@/lib/ai.functions";
import { toast } from "sonner";

const PLACEHOLDERS: Record<string, string> = {
  "resume-builder": "Paste your raw experience, education, projects and skills. e.g. 'Junior dev, 2 years React, built X, Y...'",
  "study-notes": "Topic or paste material to study from. e.g. 'Big O notation' or paste your lecture text.",
  "quiz-generator": "Topic for the quiz. e.g. 'React hooks fundamentals'",
  "code-explainer": "Paste the code snippet you want explained.",
  "pdf-summarizer": "Paste the article or PDF text you want summarized.",
  "interview-questions": "Role or topic. e.g. 'Senior frontend engineer — React + TS'",
  "text-improver": "Paste the text you want improved.",
  "programming-assistant": "Ask a technical question or describe what you want to build.",
};

export const Route = createFileRoute("/ai-tools/$tool")({
  loader: ({ params }) => {
    if (!TOOL_PROMPTS[params.tool]) throw notFound();
    return { tool: params.tool, label: TOOL_PROMPTS[params.tool].label };
  },
  head: ({ loaderData, params }) => {
    const url = `https://codeforgedev.lovable.app/ai-tools/${params?.tool ?? ""}`;
    const label = loaderData?.label ?? "AI Tool";
    const og = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";
    return {
      meta: [
        { title: `${label} — CodeForge AI Tools` },
        { name: "description", content: `${label} powered by AI. Free, fast and built for developers and students.` },
        { property: "og:title", content: `${label} — CodeForge` },
        { property: "og:description", content: `${label} powered by AI.` },
        { property: "og:url", content: url },
        { property: "og:image", content: og },
        { name: "twitter:image", content: og },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ToolPage,
});


function ToolPage() {
  const { tool } = Route.useParams();
  const { label } = Route.useLoaderData();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const run = useServerFn(runAiTool);

  const submit = async () => {
    if (!input.trim()) return toast.error("Please enter some input first");
    setBusy(true); setOutput("");
    try {
      const r = await run({ data: { tool, input: input.trim() } });
      setOutput(r.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-20">
        <Link to="/ai-tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All AI tools</Link>
        <div className="mt-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet to-electric"><Sparkles className="h-6 w-6 text-white" /></div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-electric">AI tool</div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">{label}</h1>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-medium">Input</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDERS[tool] ?? "Enter your input..."}
              rows={14}
              maxLength={8000}
              className="mt-3 rounded-xl bg-background/50"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{input.length} / 8000</span>
              <Button onClick={submit} disabled={busy} className="rounded-lg bg-gradient-to-r from-violet to-electric text-white">
                {busy ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-1.5 h-4 w-4" />Generate</>}
              </Button>
            </div>
          </div>
          <div className="glass relative rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Output</label>
              {output && (
                <button onClick={copy} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="h-3 w-3 text-electric" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <div className="mt-3 min-h-[20rem] whitespace-pre-wrap rounded-xl bg-background/50 p-4 text-sm leading-relaxed">
              {busy ? (
                <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />The AI is forging your response...</div>
              ) : output ? (
                output
              ) : (
                <span className="text-muted-foreground">Your AI-generated result will appear here.</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
