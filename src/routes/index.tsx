import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/edit/EditableText";

const SITE_URL = "https://codeforgedev.vercel.app";
const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeForge — Portfolio and Blog" },
      {
        name: "description",
        content: "Portfolio, technical writing, and software experiments by CodeForge.",
      },
      {
        name: "keywords",
        content: "developer portfolio, technical blog, React, TypeScript, TanStack",
      },
      { property: "og:title", content: "CodeForge — Portfolio and Blog" },
      { property: "og:description", content: "Portfolio · Blog." },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:title", content: "CodeForge — Portfolio and Blog" },
      { name: "twitter:description", content: "Portfolio · Blog." },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "CodeForge",
          url: SITE_URL,
          jobTitle: "Software Developer",
          sameAs: [SITE_URL],
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const qc = useQueryClient();
  const { editMode } = useEditMode();

  const featuredProjects = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("featured", true)
        .order("order_index");
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
      (data ?? []).forEach((row) => {
        map[row.key] = row.value ?? "";
      });
      return map;
    },
  });

  const posts = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,slug,title,excerpt,cover_image,category,reading_time,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveSetting = async (key: string, value: string) => {
    await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  const s = settings.data ?? {};
  const projects = featuredProjects.data ?? [];
  const leadProject = projects[0];
  const secondProject = projects[1];

  return (
    <SiteLayout>
      <section className="editorial-section hero-section" id="hero">
        <div className="page-shell">
          <div className="hero-meta editorial-grid">
            <span className="index-tag inverse">[ PORTFOLIO // 2025 EDITION ]</span>
            <span className="mono-label">
              FULL-STACK ENGINEERING &amp; MODERN WEB APPLICATIONS // CLEAN ARCHITECTURE &amp;
              APPLIED CS
            </span>
            <span className="status-text">SYS_STATUS: READY FOR NEW OPPORTUNITIES</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="display-heading hero-heading">
              {editMode ? (
                <EditableText
                  value={
                    s.hero_title ??
                    "Building purposeful full-stack applications & intuitive digital experiences."
                  }
                  onSave={(value) => saveSetting("hero_title", value)}
                  as="span"
                  className="display-heading"
                />
              ) : (
                (s.hero_title ??
                "Building purposeful full-stack applications & intuitive digital experiences.")
              )}
            </h1>
          </motion.div>
          <div className="hero-lower editorial-grid" id="technologies">
            <div className="thesis-block">
              <span className="index-tag">[ 00. THESIS STATEMENT ]</span>
              <p>
                <EditableText
                  value={
                    s.hero_description ??
                    "CodeForge is a personal software development portfolio and technical lab dedicated to crafting robust web applications, exploring networking and automation tools, and building software with clean modular code, performance awareness, and thoughtful interaction design."
                  }
                  onSave={(value) => saveSetting("hero_description", value)}
                  as="span"
                  multiline
                />
              </p>
            </div>
            <div className="taxonomy-block">
              <div className="taxonomy-grid">
                <Taxonomy title="FULL-STACK WEB" detail="Next.js, TypeScript & APIs" accent />
                <Taxonomy title="CORE LANGUAGES" detail="TypeScript, Python, Go, SQL" />
                <Taxonomy title="BOTS & AUTOMATION" detail="Telegram Bots & Security APIs" />
                <Taxonomy title="OPEN SOURCE" detail="CS Utilities & Study Tools" accent />
              </div>
              <div className="register-row">
                <span className="mono-label">REGISTER:</span>
                <Link className="filter-button active" to="/projects">
                  ALL PROJECTS
                </Link>
                <Link className="filter-button" to="/projects">
                  FULL-STACK APPS
                </Link>
                <Link className="filter-button" to="/projects">
                  BOTS &amp; AUTOMATION
                </Link>
                <Link className="filter-button" to="/projects">
                  STUDY TOOLS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProjectCaseFile
        project={leadProject}
        index="01"
        fallbackTitle="Featured project"
        tone="dark"
        loading={featuredProjects.isLoading}
      />
      <ProjectCaseFile
        project={secondProject}
        index="02"
        fallbackTitle="Systems project"
        loading={featuredProjects.isLoading}
      />

      <section className="editorial-section section-muted" id="projects">
        <div className="page-shell">
          <SectionIntro
            index="03"
            eyebrow="PROJECTS & EXPERIMENTS // ACTIVE LAB WORK"
            title="Open-source utilities & practical prototypes"
            aside={`${projects.length || 3} FEATURED WORKS REGISTERED`}
          />
          <div className="experiment-grid">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <article className="experiment-card" key={project.id}>
                  <div className="card-meta">
                    <span>[ PRJ // {String(index + 1).padStart(2, "0")} ]</span>
                    <span className="accent-text">{project.category ?? "SOFTWARE LAB"}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>
                    {project.description ??
                      "A practical software project developed with an emphasis on clear architecture and useful outcomes."}
                  </p>
                  <div className="card-specs">
                    <span>STACK:</span>
                    <strong>
                      {(project.tags ?? []).slice(0, 4).join(" // ") || "REACT // TYPESCRIPT"}
                    </strong>
                  </div>
                  <Link className="text-link" to="/projects">
                    VIEW PROJECT <ArrowUpRight size={14} />
                  </Link>
                </article>
              ))
            ) : (
              <div className="empty-state">FEATURED PROJECT REGISTER IS CURRENTLY EMPTY.</div>
            )}
          </div>
        </div>
      </section>

      <section className="editorial-section dossier-section" id="about">
        <div className="page-shell dossier-grid">
          <div className="dossier-placeholder" aria-label="CodeForge developer dossier">
            CODEFORGE
            <br />
            <span>SOFTWARE DEVELOPER &amp; CS STUDENT</span>
          </div>
          <div>
            <span className="index-tag accent-text">[ 04. DEVELOPER DOSSIER ]</span>
            <h2 className="display-heading dossier-heading">
              Passionate about scalable architecture &amp; thoughtful product design.
            </h2>
            <p className="lead-copy">
              I am a Computer Science student and software developer passionate about building
              reliable web systems, intuitive developer tools, and clean user interfaces.
            </p>
            <p className="body-copy">
              Whether developing full-stack platforms, scripting automation tools, or refining user
              interactions, I focus on performance, accessibility, and maintainable code with clear
              separation of concerns.
            </p>
          </div>
        </div>
      </section>

      <section className="editorial-section contact-section" id="contact">
        <div className="page-shell contact-grid">
          <div>
            <span className="index-tag accent-text">
              [ GET IN TOUCH // CONTACT &amp; COLLABORATION ]
            </span>
            <h2 className="display-heading contact-heading">Let's build something together.</h2>
            <p className="lead-copy">
              I am open to software engineering opportunities, junior developer roles, and
              open-source collaborations.
            </p>
            <div className="contact-registry">
              <span>EMAIL:</span>
              <a href="mailto:simakahmed@outlook.com">simakahmed@outlook.com</a>
              <span>GITHUB:</span>
              <a href="https://github.com/SamRepository25/" target="_blank" rel="noreferrer">
                github.com/SamRepository25
              </a>
              <span>LINKEDIN:</span>
              <a href="https://www.linkedin.com/in/simakahmed" target="_blank" rel="noreferrer">
                linkedin.com/in/simakahmed
              </a>
              <span>STATUS:</span>
              <strong>OPEN TO OPPORTUNITIES</strong>
            </div>
          </div>
          <div className="contact-panel">
            <div className="panel-heading">
              <span>[ TRANSMIT MESSAGE TO DEVELOPER ]</span>
              <span className="status-text">READY: INBOX ACTIVE</span>
            </div>
            <p>
              For collaboration, project discussions, or technical questions, use the direct
              channels listed here.
            </p>
            <div className="contact-actions">
              <a className="button-primary" href="mailto:simakahmed@outlook.com">
                [ SEND EMAIL -&gt; ]
              </a>
              <a
                className="button-secondary"
                href="https://github.com/SamRepository25/"
                target="_blank"
                rel="noreferrer"
              >
                [ <Github size={14} /> GITHUB ]
              </a>
              <a
                className="button-secondary"
                href="https://www.linkedin.com/in/simakahmed"
                target="_blank"
                rel="noreferrer"
              >
                [ <Linkedin size={14} /> LINKEDIN ]
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section blog-section" id="blog">
        <div className="page-shell">
          <SectionIntro
            index="05"
            eyebrow="ARTICLES & TECHNICAL NOTES"
            title="From the blog"
            aside="LATEST FIELD NOTES"
          />
          <div className="blog-grid">
            {posts.data?.length ? (
              posts.data.map((post) => (
                <article className="blog-item" key={post.id}>
                  <span className="index-tag accent-text">{post.category ?? "ARTICLE"}</span>
                  <h3>
                    <Link to="/blog/$slug" params={{ slug: post.slug }}>
                      {post.title}
                    </Link>
                  </h3>
                  <p>{post.excerpt}</p>
                  <span className="mono-label">
                    {post.reading_time} MIN READ <ArrowUpRight size={14} />
                  </span>
                </article>
              ))
            ) : (
              <div className="empty-state">NO PUBLISHED ARTICLES YET.</div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Taxonomy({
  title,
  detail,
  accent = false,
}: {
  title: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className="taxonomy-card">
      <h3 className={accent ? "accent-text" : undefined}>{title}</h3>
      <span>{detail}</span>
    </div>
  );
}

function SectionIntro({
  index,
  eyebrow,
  title,
  aside,
}: {
  index: string;
  eyebrow: string;
  title: string;
  aside: string;
}) {
  return (
    <div className="section-intro">
      <div>
        <span className="index-tag accent-text">
          [ {index}. {eyebrow} ]
        </span>
        <h2>{title}</h2>
      </div>
      <span className="mono-label">{aside}</span>
    </div>
  );
}

function ProjectCaseFile({
  project,
  index,
  fallbackTitle,
  tone = "light",
  loading,
}: {
  project?: any;
  index: string;
  fallbackTitle: string;
  tone?: "light" | "dark";
  loading: boolean;
}) {
  const title = project?.title ?? fallbackTitle;
  const description =
    project?.description ??
    "A featured CodeForge project focused on practical software engineering, modular design, and reliable delivery.";
  const image = project?.cover_image;
  return (
    <section className={`editorial-section case-section ${tone === "dark" ? "section-paper" : ""}`}>
      <div className="page-shell">
        <div className="case-heading">
          <div>
            <span className="index-tag accent-text">[ CASE FILE // CF-PRJ-{index} ]</span>
            <h2>{loading ? "LOADING PROJECT REGISTER..." : title}</h2>
          </div>
          <span className="mono-label">
            APPLICATION TYPE: SOFTWARE PROJECT
            <br />
            DISCIPLINE: FULL-STACK ENGINEERING
          </span>
        </div>
        <div className="case-artifact">
          <div className="artifact-bar">
            <span>
              <i /> {title.toUpperCase()} // CODEFORGE PROJECT REGISTER
            </span>
            <span>ENGINEERING SYSTEM // CURRENT</span>
          </div>
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <div className="artifact-placeholder">
              <span>NO PROJECT ARTIFACT AVAILABLE</span>
              <strong>{title.toUpperCase()}</strong>
            </div>
          )}
          <div className="artifact-meta">
            <span>
              <strong>TECH STACK:</strong>{" "}
              {(project?.tags ?? []).join(", ") || "REACT, TYPESCRIPT, SUPABASE"}
            </span>
            <span className="accent-text">
              <strong>STATUS:</strong> FEATURED PROJECT
            </span>
          </div>
        </div>
        <div className="breakdown-grid">
          <Breakdown title="OVERVIEW & PURPOSE" text={description} />
          <Breakdown
            title="TECHNICAL ARCHITECTURE"
            text="Modular implementation with a focus on readable interfaces, reusable systems, and dependable data flow."
          />
          <Breakdown
            title="KEY FEATURES & IMPACT"
            text="Built to solve a practical problem with thoughtful interaction design and a clear path from idea to usable software."
          />
        </div>
        <div className="case-actions">
          <Link className="button-primary" to="/projects">
            [ VIEW PROJECT REPOSITORY -&gt; ]
          </Link>
          <Link className="button-secondary" to="/projects">
            [ BROWSE ALL PROJECTS ]
          </Link>
          <span className="mono-label">STATUS: ACTIVE // CODEFORGE REGISTER</span>
        </div>
      </div>
    </section>
  );
}

function Breakdown({ title, text }: { title: string; text: string }) {
  return (
    <div className="breakdown-card">
      <span className="index-tag">[ {title} ]</span>
      <p>{text}</p>
    </div>
  );
}
