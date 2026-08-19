# 🚀 CodeForge

> **Forge ideas into reality.**

A modern **personal developer portfolio and technical blog** built to showcase projects, technical work, learning, and AI-powered development.

CodeForge is built with **React, TypeScript, Tailwind CSS, TanStack, Supabase, and PostgreSQL**, with production deployment on **Vercel**.

🌐 **Live Website:** https://codeforgedev.vercel.app  

---

## ✨ Highlights

- 🌐 Personal developer portfolio
- 💼 Project showcase
- 📝 Technical blog
- 🤖 AI-powered development
- 🔐 Authentication
- 🛡️ Protected application areas
- 📱 Responsive modern UI
- ⚡ Modern frontend architecture
- ☁️ Vercel deployment
- 📚 Continuous learning and development

---

## 🏠 About CodeForge

CodeForge is a personal developer platform created to showcase software projects, technical interests, development work, and continuous learning.

The platform is built around three core ideas:

**Modern Stack · Fast Performance · AI Powered**

### Current Highlights

| Metric | Value |
|---|---:|
| 🚀 Projects Built | **6+** |
| 💻 Lines of Code | **15K+** |
| 🛠️ Technologies | **5+** |
| 📚 Learning | **24/7** |

---

## 💼 Projects

The Projects section showcases software projects and technical work.

Projects focus on:

- Project purpose
- Key features
- Technologies used
- Technical implementation
- Development approach
- Project outcomes

The goal is to showcase practical software engineering and real-world project development.

---

## 📝 Technical Blog

CodeForge includes a dedicated technical blog for sharing technical knowledge and development experiences.

### Blog Features

- Technical articles
- Individual article pages
- Search functionality
- Categories and tags
- Markdown-based content
- Comments
- Content management

The blog is designed to support technical writing, documentation, and knowledge sharing.

---

## 🤖 AI-Powered Development

AI is one of the core themes of CodeForge.

The project explores AI-powered development alongside traditional software engineering.

Areas of interest include:

- Artificial Intelligence
- Machine Learning
- Generative AI
- LLM-powered applications
- AI developer tools
- Prompt engineering
- Intelligent automation

---

## 🔐 Authentication & Security

CodeForge includes authentication and protected application functionality.

### Authentication

- Email and password authentication
- Supabase Authentication
- Protected routes
- Session-aware application flow
- Multi-factor authentication support

### Security

- Environment-based configuration
- Protected application areas
- PostgreSQL-backed data
- Authentication-aware application flows
- Sensitive credentials kept outside the repository

> ⚠️ Never commit production credentials, service-role keys, private API keys, or other secrets to the repository.

---

# 🛠️ Tech Stack

## Frontend

- **React 19**
- **TypeScript**
- **Vite**
- **TanStack Router**
- **TanStack Start**
- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **Framer Motion**
- **Lucide React**

## Backend & Database

- **Supabase**
- **PostgreSQL**
- **Supabase Authentication**

## AI

- **AI SDK**
- **AI integrations**

## Forms & Validation

- **React Hook Form**
- **Zod**

## Content

- **React Markdown**
- **remark-gfm**

## Data & UI

- **TanStack Query**
- **Recharts**
- **date-fns**
- **Sonner**

## Deployment

- **Vercel**

---

# 🏗️ Architecture

```text
                         ┌───────────────────────┐
                         │       CodeForge       │
                         │ Portfolio + Technical │
                         │         Blog          │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ React + TypeScript    │
                         │ TanStack + Tailwind   │
                         └───────────┬───────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │                                     │
                  ▼                                     ▼
           Public Experience                    Protected Areas
                  │                                     │
        ┌─────────┼─────────┐                    Authentication
        │         │         │                         │
        ▼         ▼         ▼                         ▼
     Portfolio Projects   Blog                    Admin
                                                      │
                                                      ▼
                                                 Supabase
                                                      │
                                                      ▼
                                                  PostgreSQL
                                                      │
                                                      ▼
                                                    Vercel
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
├── src/
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

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

- Node.js
- npm
- A Supabase project

### 1. Clone the Repository

```bash
git clone https://github.com/SamRepository25/CodeForge.git
cd CodeForge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your real credentials or private keys to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

The development server will provide a local URL.

---

# 🧪 Development Commands

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Development Build

```bash
npm run build:dev
```

### Preview Production Build

```bash
npm run preview
```

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

---

# 🌍 Deployment

CodeForge is deployed using **Vercel**.

### Production Website

https://codeforgedev.vercel.app

The production application is connected to the CodeForge GitHub repository.

---

# 📸 Screenshots

### 🏠 Home

<img width="1918" height="1078" alt="CodeForge Home" src="https://github.com/user-attachments/assets/3e1df4b1-59ca-4866-bf09-72c040ac0fa8" />

### 👨‍💻 About

<img width="1917" height="1078" alt="CodeForge About" src="https://github.com/user-attachments/assets/5e661a29-9e38-4d0a-95e3-258945605ca8" />

### 💼 Projects

<img width="1918" height="1078" alt="CodeForge Projects" src="https://github.com/user-attachments/assets/a251de55-e2b0-4261-a35b-fffdf37c0bf6" />

### 📝 Blog

<img width="1918" height="1078" alt="CodeForge Blog" src="https://github.com/user-attachments/assets/874fd185-8cd8-4461-8aec-1557dbe3be0d" />

---

# 🗺️ Future Improvements

Potential future improvements include:

- [ ] Expanded AI-powered features
- [ ] AI chat capabilities
- [ ] Portfolio analytics
- [ ] Advanced blog search
- [ ] Automated testing
- [ ] Performance optimization
- [ ] Progressive Web App support
- [ ] Additional security hardening
- [ ] More technical articles
- [ ] Expanded project case studies
- [ ] Accessibility improvements

---

# 🤝 Contributing

CodeForge is primarily a personal project, but feedback, suggestions, bug reports, and feature requests are welcome.

If you discover an issue:

1. Open a GitHub Issue.
2. Clearly describe the problem.
3. Include reproduction steps when possible.
4. Add screenshots or logs when useful.

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

---

# 👨‍💻 Author

## B SIMAK AHMED

**Computer Science & Engineering Student**

### Interests

- Software Development
- Artificial Intelligence
- Cybersecurity
- Full-Stack Development
- Developer Tools
- Modern Web Technologies

### Links

- **GitHub:** https://github.com/SamRepository25
- **CodeForge:** https://codeforgedev.vercel.app

---

# ⭐ Support

If you find CodeForge interesting or useful, consider giving the repository a ⭐.

> **Forge ideas into reality. 🚀**
