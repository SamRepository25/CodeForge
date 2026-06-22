import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://codeforgedev.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/projects", changefreq: "weekly", priority: "0.8" },
          { path: "/blog", changefreq: "daily", priority: "0.9" },
          { path: "/ai-tools", changefreq: "weekly", priority: "0.8" },
        ];

        try {
          const { data: posts } = await supabase
            .from("posts")
            .select("slug, updated_at, created_at")
            .eq("published", true);
          for (const p of posts ?? []) {
            entries.push({
              path: `/blog/${p.slug}`,
              lastmod: (p.updated_at ?? p.created_at ?? "").slice(0, 10) || undefined,
              changefreq: "weekly",
              priority: "0.7",
            });
          }
        } catch (e) {
          console.error("[sitemap] posts fetch failed", e);
        }

        const AI_TOOL_SLUGS = [
          "resume-builder",
          "study-notes",
          "quiz-generator",
          "code-explainer",
          "pdf-summarizer",
          "interview-questions",
          "text-improver",
          "programming-assistant",
        ];
        for (const slug of AI_TOOL_SLUGS) {
          entries.push({ path: `/ai-tools/${slug}`, changefreq: "monthly", priority: "0.6" });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
