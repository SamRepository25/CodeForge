
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { SiteLayout } from "@/components/SiteLayout";
import {
  BookOpen,
  CalendarDays,
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — CodeForge" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw redirect({ to: "/auth" });
    }

    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    if (roleError) throw roleError;

    if (!(roles ?? []).some((role) => role.role === "admin")) {
      return { workspaceAuthorized: false };
    }

    return { workspaceAuthorized: true };
  },
  component: Workspace,
});

const modules = [
  {
    title: "Academics",
    description:
      "Semester subjects, syllabus, CIEs, labs, end-semester exams and academic records.",
    icon: GraduationCap,
  },
  {
    title: "Backlogs",
    description:
      "Track arrears, attempts, exam dates, preparation and cleared subjects.",
    icon: BookOpen,
  },
  {
    title: "Attendance",
    description:
      "Subject-wise attendance, target percentage, shortage warnings and attendance planning.",
    icon: ClipboardList,
  },
  {
    title: "Planner & Today Brief",
    description:
      "Priorities, deadlines, revision tasks, timetable and upcoming exams in one view.",
    icon: CalendarDays,
  },
  {
    title: "Projects & Skills",
    description:
      "Projects, practical learning, progress, evidence and skill development.",
    icon: Lightbulb,
  },
  {
    title: "Career & Placement",
    description:
      "Internships, applications, certifications, interview preparation and placement tracking.",
    icon: BriefcaseBusiness,
  },
  {
    title: "IT Toolbox",
    description:
      "A curated collection of useful networking, Linux and IT utilities.",
    icon: Wrench,
  },
  {
    title: "Knowledge Base",
    description:
      "Keep searchable troubleshooting notes, commands, solutions and learning resources.",
    icon: BookOpen,
  },
];

function Workspace() {
  const { workspaceAuthorized } = Route.useRouteContext();
  const { user, signOut } = useAuth();

  if (!workspaceAuthorized) {
    return (
      <SiteLayout>
        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16">
          <section className="glass w-full rounded-2xl border border-destructive/30 p-8 text-center">
            <ShieldCheck
              className="mx-auto h-10 w-10 text-destructive"
              aria-hidden="true"
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-destructive">
              403 Forbidden
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold">
              Access denied
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your account is not authorized to access the private CodeForge
              Workspace.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Return to CodeForge
            </a>
          </section>
        </main>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <main className="mx-auto max-w-7xl px-4 py-12">
        <header className="glass relative overflow-hidden rounded-3xl border border-blue-400/15 p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Private workspace
              </div>

              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Workspace
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Your private command center for academics, learning, projects and
                career planning.
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={() => signOut().then(() => location.assign("/"))}
              className="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-secondary"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Personal modules
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Workspace foundation. Modules will be introduced in stages.
              </p>
            </div>

            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {modules.length} modules
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <article
                  key={module.title}
                  className="glass group rounded-2xl border border-border/70 p-5 transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-400/[0.03]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl border border-blue-400/15 bg-blue-400/5 p-3">
                      <Icon
                        className="h-5 w-5 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>

                    <span className="rounded-full border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                      Planned
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-base font-semibold">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {module.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="mt-8 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            CodeForge Workspace · Private environment
          </p>
        </footer>
      </main>
    </SiteLayout>
  );
}
