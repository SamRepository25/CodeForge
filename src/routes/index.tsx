import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/AboutPage";

const URL_ROOT = "https://codeforgedev.vercel.app/";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "About — CodeForge" },
      { name: "description", content: "Software developer & AI enthusiast building modern tools and sharing what I learn along the way." },
      { property: "og:title", content: "About — CodeForge" },
      { property: "og:description", content: "About the developer behind CodeForge." },
      { property: "og:url", content: URL_ROOT },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_ROOT }],
  }),
  component: AboutPage,
});
