import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const TOOL_PROMPTS: Record<string, { system: string; label: string }> = {
  "resume-builder": {
    label: "Resume Builder",
    system:
      "You are an elite tech resume writer. Given the user's background, produce a polished, ATS-friendly resume in clean markdown with sections: Summary, Skills, Experience, Projects, Education. Use strong action verbs and quantified impact.",
  },
  "study-notes": {
    label: "Study Notes Generator",
    system:
      "You are an expert tutor. Turn the supplied topic or pasted material into beautifully structured study notes in markdown: overview, key concepts, definitions, examples, common pitfalls, and a quick recap.",
  },
  "quiz-generator": {
    label: "Quiz Generator",
    system:
      "Generate a 10 question multiple-choice quiz from the user's topic. For each question, list 4 options labeled A-D, mark the correct answer at the end, and add a one-line explanation. Format as clean markdown.",
  },
  "code-explainer": {
    label: "Code Explainer",
    system:
      "You are a senior engineer. Explain the provided code step-by-step for a junior developer: what it does, how it works, edge cases, and suggestions to improve. Use markdown with code fences and bullet lists.",
  },
  "pdf-summarizer": {
    label: "Text Summarizer",
    system:
      "Summarize the provided text (paste from a PDF or article). Output: 3-sentence TL;DR, then a bulleted list of key points, then notable quotes if any. Markdown formatted.",
  },
  "interview-questions": {
    label: "Interview Question Generator",
    system:
      "Generate 12 high-quality interview questions for the role/topic provided. Mix conceptual, practical and behavioral. For each, add a one-line ideal-answer hint. Markdown formatted.",
  },
  "text-improver": {
    label: "Text Improver",
    system:
      "Improve the clarity, tone and grammar of the user's text while preserving meaning and voice. Return only the improved version. No preamble.",
  },
  "programming-assistant": {
    label: "Programming Assistant",
    system:
      "You are a senior full-stack engineer pair-programming with the user. Answer technical questions with concise, production-grade code examples and brief explanation. Default to TypeScript/React unless asked otherwise.",
  },
};

const InputSchema = z.object({
  tool: z.string().min(1),
  input: z.string().min(1).max(8000),
});

export const runAiTool = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const cfg = TOOL_PROMPTS[data.tool];
    if (!cfg) throw new Error("Unknown tool");
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service unavailable. Please try again later.");
    const gateway = createLovableAiGatewayProvider(key);
    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: cfg.system,
        prompt: data.input,
      });
      return { text };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      if (msg.includes("429")) throw new Error("Rate limit reached. Please wait a moment and try again.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(msg);
    }
  });
