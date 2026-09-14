import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

const URL_PRIVACY = "https://codeforgedev.vercel.app/privacy-policy";
const OG_IMAGE = "https://codeforgedev.vercel.app/og-image.png";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CodeForge" },
      {
        name: "description",
        content: "How CodeForge collects, uses, and protects information across this site.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Privacy Policy — CodeForge" },
      {
        property: "og:description",
        content: "How CodeForge collects, uses, and protects information across this site.",
      },
      { property: "og:url", content: URL_PRIVACY },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_PRIVACY }],
  }),
  component: PrivacyPolicyPage,
});

const LAST_UPDATED = "September 14, 2026";

function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <h1 className="font-display text-4xl font-bold gradient-text">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="glass mt-10 space-y-8 rounded-2xl p-6 text-sm leading-7 text-muted-foreground sm:p-10">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Who this applies to</h2>
            <p className="mt-2">
              CodeForge (codeforgedev.vercel.app) is a personal developer portfolio and technical
              blog. This policy explains what information the site collects from visitors and how it
              is used. This is a website policy for informational purposes and is not legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. Information collected</h2>
            <p className="mt-2">
              CodeForge does not require visitors to create an account or submit personal
              information to read the site. Specifically:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Anonymous usage analytics.</strong> This site
                uses Vercel Web Analytics to understand page views and traffic trends. It is
                cookieless and does not track individual visitors across sites; it does not collect
                names, emails, or IP addresses in a form that identifies you.
              </li>
              <li>
                <strong className="text-foreground">Contact form.</strong> The{" "}
                <a href="/contact" className="text-violet underline underline-offset-2">
                  Contact page
                </a>{" "}
                lets you send a name, email, subject, message, and optional file attachments
                (images, PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, or TXT — up to 3 files, 8MB each). This
                is stored so the message can be read and responded to, and is only visible to the
                site owner. Attachments are kept in a private file store that is never publicly
                accessible. You can also email directly instead — see below.
              </li>
              <li>
                <strong className="text-foreground">Spam protection.</strong> The contact form uses
                Cloudflare Turnstile, a cookieless bot-check, to reduce spam submissions. A hashed
                (not plaintext) version of your IP address may be kept briefly to prevent abuse of
                the form.
              </li>
              <li>
                <strong className="text-foreground">Admin authentication.</strong> The dashboard
                area of this site is restricted to the site owner. Sign-in uses Supabase
                Authentication with email/password and two-factor (TOTP) verification. This only
                applies to the owner's admin account, not to public visitors.
              </li>
              <li>
                <strong className="text-foreground">Local/session storage.</strong> The browser may
                store a Supabase authentication session token locally on the device used to sign in
                to the admin dashboard. This is not used for visitor tracking.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Cookies</h2>
            <p className="mt-2">
              CodeForge does not set third-party advertising or tracking cookies, and the analytics
              tool in use does not rely on cookies. Because no cookie consent is required for
              cookieless analytics, this site does not display a cookie banner. If that changes in
              the future, this policy and the site will be updated accordingly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Data storage</h2>
            <p className="mt-2">
              Public content on this site (projects, blog posts) is stored and served via Supabase.
              This content is public by design. Admin credentials and authentication data are stored
              and managed by Supabase's authentication service and are not exposed to visitors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Third-party services</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Vercel</strong> — hosting and cookieless
                analytics.
              </li>
              <li>
                <strong className="text-foreground">Supabase</strong> — database, authentication,
                and private file storage for contact form attachments.
              </li>
              <li>
                <strong className="text-foreground">Cloudflare Turnstile</strong> — a cookieless
                bot-check used on the contact form to reduce spam. Turnstile may process your IP
                address and browser signals to assess whether the submission is automated; it does
                not use tracking cookies.
              </li>
              <li>
                <strong className="text-foreground">Resend</strong> — used to email the site owner a
                notification when a contact form message is received. The content of your message is
                included in that notification email so it can be read and replied to; it is not
                shared with anyone beyond the site owner.
              </li>
              <li>
                <strong className="text-foreground">Google Fonts</strong> — web font delivery for
                site typography.
              </li>
            </ul>
            <p className="mt-2">
              Each of these providers may process standard technical/server log data (such as IP
              address) as part of delivering the site, under their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. Your choices</h2>
            <p className="mt-2">
              You can browse CodeForge without providing any personal information. Since analytics
              on this site is anonymous and cookieless, there is no visitor account or tracking
              profile to request deletion of.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">7. Changes to this policy</h2>
            <p className="mt-2">
              This page may be updated as the site's features change. Check back periodically for
              the latest version.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
            <p className="mt-2">
              Questions about this policy can be sent to{" "}
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
