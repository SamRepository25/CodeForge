# 🚀 CodeForge

> **Forge ideas into reality.**

CodeForge is a modern personal developer platform built to showcase software projects, technical work, learning, technical writing, and AI-powered development.

It combines a developer portfolio, technical blog, AI-powered capabilities, authentication, protected application areas, and a modern full-stack architecture.

---

## ✨ Features

* 💼 Developer portfolio
* 🚀 Project showcase
* 📝 Technical blog
* 🔎 Blog search and discovery
* 🏷️ Categories and tags
* 💬 Blog comments
* 🤖 AI-powered developer features
* 🔐 Authentication
* 🛡️ Protected application areas
* 👤 Admin functionality
* 🔑 Password recovery
* 🔒 Multi-factor authentication support
* 📬 Contact functionality
* 📱 Responsive user interface
* ⚡ Modern application architecture
* 📊 Data visualization
* ☁️ Vercel deployment
* 📈 Vercel Analytics

---

## 🌐 Live Website

**CodeForge:** https://codeforgedev.vercel.app

---

# 🏠 About CodeForge

CodeForge is a personal developer platform created to bring together software projects, technical articles, development experiments, learning resources, and AI-powered tools in one place.

The platform focuses on:

* Building practical software
* Exploring modern technologies
* Learning through real projects
* Documenting technical knowledge
* Experimenting with AI
* Applying security-conscious development practices

### Core Philosophy

**Build · Learn · Experiment · Secure**

---

# 💼 Portfolio

The portfolio section showcases software projects and technical work.

Each project can highlight:

* Project purpose
* Key features
* Technologies used
* Technical implementation
* Development decisions
* Project status
* Relevant resources

The goal is to demonstrate practical software engineering rather than simply listing technologies.

---

# 📝 Technical Blog

CodeForge includes a technical blog for publishing development-related articles and technical knowledge.

### Blog Capabilities

* Technical articles
* Individual article pages
* Search
* Categories
* Tags
* Markdown content
* GitHub-flavored Markdown
* Comments
* Content management
* Responsive reading experience

### Topics

Blog content can cover areas such as:

* Programming
* Artificial Intelligence
* Cybersecurity
* Web Development
* Databases
* Cloud Computing
* Computer Networks
* Software Engineering
* Developer Tools
* Technical Learning

---

# 🤖 AI-Powered Development

AI is one of the major areas explored by CodeForge.

The project uses modern AI technologies to experiment with developer-focused and productivity-oriented workflows.

Areas of exploration include:

* Artificial Intelligence
* Generative AI
* Large Language Models
* AI-assisted development
* AI developer tools
* Prompt engineering
* Intelligent automation
* AI-powered applications
* AI-assisted learning

The AI capabilities of CodeForge are continuously evolving as new ideas and technologies are explored.

---

# 🔐 Authentication & Security

Security is an important part of the CodeForge architecture.

## Authentication

CodeForge uses Supabase Authentication and application-level access control.

Authentication functionality includes:

* Email and password authentication
* Session management
* Protected routes
* Password recovery
* Authentication-aware application flows
* Multi-factor authentication support
* Protected administrative functionality

## Security Practices

The project follows security-conscious development practices including:

* Environment-based configuration
* Protected application areas
* Authentication-aware access control
* Database-backed authorization
* Separation of public and privileged functionality
* Server-side handling of sensitive operations
* Secrets kept outside the repository

> ⚠️ Never commit production credentials, service-role keys, private API keys, access tokens, or other secrets to the repository.

---

# 🛠️ Tech Stack

## Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **TanStack Router**
* **TanStack Start**
* **Tailwind CSS**
* **shadcn/ui**
* **Radix UI**
* **Framer Motion**
* **Lucide React**

## Backend & Database

* **Supabase**
* **PostgreSQL**
* **Supabase Authentication**

## AI

* **Vercel AI SDK**
* **OpenAI-compatible AI integrations**

## Forms & Validation

* **React Hook Form**
* **Zod**

## Content

* **React Markdown**
* **remark-gfm**

## Data & Visualization

* **TanStack Query**
* **Recharts**
* **date-fns**

## UI & Utilities

* **Sonner**
* **Embla Carousel**
* **Tailwind Merge**
* **Class Variance Authority**

## Email

* **Resend**

## Deployment & Analytics

* **Vercel**
* **Vercel Analytics**

---

# 🏗️ Architecture

```text
                         ┌──────────────────────────┐
                         │        CodeForge         │
                         │ Portfolio + Blog + AI    │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │   React + TypeScript     │
                         │ TanStack + Tailwind CSS  │
                         └────────────┬─────────────┘
                                      │
                ┌─────────────────────┴─────────────────────┐
                │                                           │
                ▼                                           ▼
         Public Experience                         Protected Experience
                │                                           │
       ┌────────┼────────┐                         ┌─────────┴─────────┐
       │        │        │                         │                   │
       ▼        ▼        ▼                         ▼                   ▼
   Portfolio   Blog      AI                   Authentication         Admin
       │        │        │                         │                   │
       └────────┴────────┘                         └─────────┬─────────┘
                                                            │
                                                            ▼
                                                   ┌────────────────┐
                                                   │    Supabase    │
                                                   │ Auth + Database│
                                                   └───────┬────────┘
                                                           │
                                                           ▼
                                                   ┌────────────────┐
                                                   │   PostgreSQL   │
                                                   └───────┬────────┘
                                                           │
                                                           ▼
                                                   ┌────────────────┐
                                                   │     Vercel     │
                                                   └────────────────┘
```

---

# 📂 Project Structure

```text
CodeForge/
│
├── .main/
│   └── project.json
│
├── migration/
│
├── public/
│
├── scripts/
│
├── src/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   └── ...
│
├── supabase/
│   ├── migrations/
│   └── config.toml
│
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── AGENTS.md
├── components.json
├── eslint.config.js
├── LICENSE
├── MIGRATION.md
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

> The project structure may evolve as new features are added.

---

# 🚀 Getting Started

## Prerequisites

Before running CodeForge locally, make sure you have:

* Node.js
* npm
* A Supabase project

---

## 1. Clone the Repository

```bash
git clone https://github.com/SamRepository25/CodeForge.git
cd CodeForge
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Additional environment variables may be required for server-side, AI, email, or other integrations depending on the enabled features.

> ⚠️ Never commit your real `.env` file or production secrets.

---

## 4. Start the Development Server

```bash
npm run dev
```

The development server will provide a local URL.

---

# 🧪 Development Commands

## Start Development Server

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Development Build

```bash
npm run build:dev
```

## Preview Production Build

```bash
npm run preview
```

## Run ESLint

```bash
npm run lint
```

## Format Code

```bash
npm run format
```

---

# 🌍 Deployment

CodeForge is deployed using **Vercel**.

The production application is connected to the GitHub repository and is continuously maintained as the project evolves.

### Production Website

https://codeforgedev.vercel.app

---

# 🔒 Security Guidelines

When developing or deploying CodeForge:

* Never commit `.env` files containing secrets.
* Never expose Supabase service-role credentials to the browser.
* Never commit private API keys.
* Keep privileged operations on trusted server-side boundaries.
* Validate user-controlled input.
* Use appropriate authentication and authorization checks.
* Review database access policies before changing protected functionality.
* Avoid exposing sensitive application information through client-side code.
* Test authentication and authorization changes carefully.

Security changes should be treated as application-wide changes because authentication, database policies, protected routes, and administrative functionality can depend on one another.

---

# 🧠 Development Philosophy

CodeForge is built around four principles.

### 🚀 Build

Turn ideas into working software.

### 📚 Learn

Use real projects and experimentation to develop practical technical knowledge.

### 🤖 Explore

Experiment with emerging technologies, especially AI and modern developer tooling.

### 🔐 Secure

Treat security, privacy, authorization, and maintainability as part of the development process.

---

# 🗺️ Roadmap

CodeForge is an actively evolving project.

Potential future improvements include:

* [ ] Additional AI-powered tools
* [ ] AI chat capabilities
* [ ] Expanded developer utilities
* [ ] More technical articles
* [ ] Expanded project case studies
* [ ] Advanced blog search
* [ ] Portfolio analytics
* [ ] Automated testing
* [ ] Performance optimization
* [ ] Accessibility improvements
* [ ] Additional security hardening
* [ ] Progressive Web App capabilities
* [ ] Additional developer-focused features

The roadmap may change as the project evolves.

---

# 🤝 Contributing

CodeForge is primarily a personal project.

Feedback, suggestions, bug reports, and feature requests are welcome.

If you discover a problem:

1. Open a GitHub Issue.
2. Clearly describe the issue.
3. Include reproduction steps when possible.
4. Add screenshots or logs when useful.
5. Never include passwords, API keys, tokens, or other secrets.

---

# 📄 License

CodeForge is licensed under the **Proprietary License**.

See the [`LICENSE`](./LICENSE) file for the applicable terms.

---

# 👨‍💻 Author

## B SIMAK AHMED

**Computer Science & Engineering Student**

### Interests

* 💻 Software Development
* 🤖 Artificial Intelligence
* 🔐 Cybersecurity
* 🌐 Full-Stack Development
* 🛠️ Developer Tools
* ☁️ Cloud Technologies
* 🌍 Modern Web Technologies

---

# ⭐ Support

If you find CodeForge interesting or useful, consider giving the repository a ⭐.

> **Forge ideas into reality. 🚀**
