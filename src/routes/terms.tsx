import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

const URL_TERMS = "https://codeforgedev.vercel.app/terms";
const OG_IMAGE = "https://codeforgedev.vercel.app/og-image.png";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — CodeForge" },
      { name: "description", content: "The terms that apply to using the CodeForge website." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Terms & Conditions — CodeForge" },
      {
        property: "og:description",
        content: "The terms that apply to using the CodeForge website.",
      },
      { property: "og:url", content: URL_TERMS },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_TERMS }],
  }),
  component: TermsPage,
});

const LAST_UPDATED = "September 14, 2026";

function TermsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <h1 className="font-display text-4xl font-bold gradient-text">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="glass mt-10 space-y-8 rounded-2xl p-6 text-sm leading-7 text-muted-foreground sm:p-10">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. About this site</h2>
            <p className="mt-2">
              CodeForge (codeforgedev.vercel.app) is a personal developer portfolio and technical
              blog. By using this site, you agree to these terms. This page is written in plain
              language and is not a substitute for legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. Content</h2>
            <p className="mt-2">
              Projects, blog posts, and other written content on this site reflect the personal
              views and work of the site owner and are provided for informational purposes. Code
              samples and project write-ups are shared as-is, without warranty, unless a specific
              project states otherwise (for example, via its own open-source license on GitHub).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Intellectual property</h2>
            <p className="mt-2">
              Unless otherwise noted, the design, branding, and written content on CodeForge belong
              to the site owner. Open-source project code is governed by the license published in
              that project's own repository. Please don't reproduce written content from this site
              without permission or attribution.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              4. No professional guarantees
            </h2>
            <p className="mt-2">
              CodeForge does not sell subscriptions, offer paid services, or guarantee outcomes of
              any kind through this site. Any AI-assisted tools shown on the site that are still in
              development are labeled as such and are not yet available for use.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Acceptable use</h2>
            <p className="mt-2">
              Please don't attempt to disrupt the site, probe it for vulnerabilities without
              permission, scrape it at high volume, or use the admin login for anything other than
              legitimate site administration by its owner.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. External links</h2>
            <p className="mt-2">
              This site links to third-party platforms such as GitHub, LinkedIn, and X. CodeForge is
              not responsible for the content or practices of those external sites.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">7. Changes</h2>
            <p className="mt-2">
              These terms may be updated from time to time as the site evolves. Continued use of the
              site after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
            <p className="mt-2">
              Questions about these terms can be sent to{" "}
              <a
                className="text-violet underline underline-offset-2"
                href="mailto:simakahmed@outlook.com"
              >
                simakahmed@outlook.com
              </a>
              .
            </p>
          </section>
        </div>

        <Link to="/" className="mt-8 inline-block text-sm text-violet hover:underline">
          ← Back to home
        </Link>
      </div>
    </SiteLayout>
  );
}
