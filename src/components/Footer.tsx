import { Link } from "@tanstack/react-router";
import { Code2, Github, Linkedin, Mail } from "lucide-react";

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.29 19.5h2.039L6.486 3.24H4.298L17.61 20.653Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <Link to="/" className="brand-mark">
            <span className="brand-icon">
              <Code2 size={21} />
            </span>
            <span>
              <strong>CODEFORGE</strong>
              <small>SOFTWARE LAB</small>
            </span>
          </Link>
          <p className="footer-copy">
            Personal software development portfolio and technical lab. Synthesizing formal systems
            thinking with practical, full-stack application development.
          </p>
          <div className="social-row">
            <a
              href="https://github.com/SamRepository25/"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/simakahmed"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a href="https://x.com/X" target="_blank" rel="noreferrer" aria-label="X">
              <XLogo className="icon-small" />
            </a>
            <a href="mailto:simakahmed@outlook.com" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
        <div>
          <span className="footer-heading">[ NAVIGATION ]</span>
          <Link to="/projects">/01_PROJECTS</Link>
          <a href="/#technologies">/02_TECHNOLOGIES</a>
          <Link to="/blog">/03_ARTICLES_AND_BLOG</Link>
          <Link to="/about">/04_ABOUT_AND_BIO</Link>
          <a href="/#contact">/05_CONTACT</a>
        </div>
        <div>
          <span className="footer-heading">[ CONNECT ]</span>
          <a href="https://github.com/SamRepository25/" target="_blank" rel="noreferrer">
            GITHUB <strong>@SamRepository25</strong>
          </a>
          <a href="https://www.linkedin.com/in/simakahmed" target="_blank" rel="noreferrer">
            LINKEDIN <strong>/in/simakahmed</strong>
          </a>
          <a href="mailto:simakahmed@outlook.com">
            EMAIL <strong>simakahmed@outlook.com</strong>
          </a>
          <span className="accent-text">
            STATUS <strong>OPEN TO OFFERS</strong>
          </span>
        </div>
        <div>
          <span className="footer-heading">[ COLOPHON &amp; SPECS ]</span>
          <span>STACK: REACT, TYPESCRIPT, TAILWIND, SUPABASE &amp; POSTGRESQL</span>
          <span>TYPOGRAPHY: INTER + JETBRAINS MONO</span>
          <span>GRID: SWISS CONSTRUCTIVIST SYSTEM</span>
          <span>FEED: RSS / SITEMAP AVAILABLE</span>
        </div>
      </div>
      <div className="footer-bottom page-shell">
        <span>© {new Date().getFullYear()} CODEFORGE. BUILT WITH MODERN WEB STANDARDS.</span>
        <span>
          <a href="https://github.com/SamRepository25/" target="_blank" rel="noreferrer">
            GITHUB
          </a>
          <a href="https://www.linkedin.com/in/simakahmed" target="_blank" rel="noreferrer">
            LINKEDIN
          </a>
          <a href="#hero">TOP ↑</a>
        </span>
      </div>
    </footer>
  );
}
