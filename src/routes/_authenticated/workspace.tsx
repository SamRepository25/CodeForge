
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { SiteLayout } from "@/components/SiteLayout";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
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
    live: true,
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
  const [activeModule, setActiveModule] = useState<"academics" | null>(null);

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

        {activeModule === "academics" ? (
          <Academics onBack={() => setActiveModule(null)} />
        ) : (
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
                    className="glass group relative rounded-2xl border border-border/70 p-5 transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-400/[0.03]"
                  >
                    {module.live && (
                      <button
                        type="button"
                        onClick={() => setActiveModule("academics")}
                        aria-label={`Open ${module.title}`}
                        className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                      />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl border border-blue-400/15 bg-blue-400/5 p-3">
                        <Icon
                          className="h-5 w-5 text-blue-400"
                          aria-hidden="true"
                        />
                      </div>

                      <span className="rounded-full border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                        {module.live ? "Available" : "Planned"}
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
        )}

        <footer className="mt-8 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            CodeForge Workspace · Private environment
          </p>
        </footer>
      </main>
    </SiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Academics module (private Workspace)                                       */
/* All data lives in this browser's localStorage. Nothing is sent anywhere.   */
/* -------------------------------------------------------------------------- */

type SubjectType = "Theory" | "Lab" | "Integrated" | "Elective";
type RevisionStatus = "none" | "needs" | "done";
type PrepStatus = "not-started" | "in-progress" | "almost-ready" | "ready";
type DetailTab = "syllabus" | "cie" | "lab" | "see";

interface Topic {
  id: string;
  name: string;
  done: boolean;
  revision: RevisionStatus;
  notes: string;
}

interface Experiment {
  id: string;
  name: string;
  done: boolean;
  notes: string;
}

interface Exam {
  date: string; // yyyy-mm-dd, or "" when not set
  max: number | null;
  obtained: number | null;
  notes: string;
}

interface SeeExam extends Exam {
  prep: PrepStatus;
}

interface LabMarks {
  max: number | null;
  obtained: number | null;
  notes: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number | null;
  type: SubjectType;
  topics: Topic[];
  cie1: Exam;
  cie2: Exam;
  experiments: Experiment[];
  labMarks: LabMarks;
  see: SeeExam;
}

interface AcademicsData {
  version: 1;
  semesters: Record<string, Subject[]>;
}

type SubjectValues = Pick<Subject, "name" | "code" | "credits" | "type">;
type SubjectUpdate = (update: (subject: Subject) => Subject) => void;

const ACADEMICS_STORAGE_KEY = "codeforge:workspace:academics:v1";
const DEFAULT_SEMESTER = 5;
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SUBJECT_TYPES: SubjectType[] = ["Theory", "Lab", "Integrated", "Elective"];

const REVISION_LABELS: Record<RevisionStatus, string> = {
  none: "Not revised",
  needs: "Needs revision",
  done: "Revised",
};

const PREP_LABELS: Record<PrepStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "almost-ready": "Almost ready",
  ready: "Ready",
};

const inputClass =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-blue-400/50 focus-visible:ring-2 focus-visible:ring-blue-400/30";
const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-sm font-medium text-blue-300 transition hover:bg-blue-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40";
const iconButtonClass =
  "rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40";
const panelClass = "glass rounded-2xl border border-border/70 p-5";

/* ------------------------------ data helpers ------------------------------ */

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createExam = (): Exam => ({ date: "", max: null, obtained: null, notes: "" });

const createEmptyData = (): AcademicsData => ({
  version: 1,
  semesters: Object.fromEntries(SEMESTERS.map((n) => [String(n), [] as Subject[]])),
});

function createSubject(values: SubjectValues): Subject {
  return {
    id: makeId(),
    ...values,
    topics: [],
    cie1: createExam(),
    cie2: createExam(),
    experiments: [],
    labMarks: { max: null, obtained: null, notes: "" },
    see: { ...createExam(), prep: "not-started" },
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isKeyOf = <T extends string>(labels: Record<T, string>, value: unknown): value is T =>
  typeof value === "string" && Object.keys(labels).includes(value);

const toText = (value: unknown, limit = 2000) =>
  typeof value === "string" ? value.slice(0, limit) : "";
const toId = (value: unknown) =>
  typeof value === "string" && value ? value.slice(0, 64) : makeId();
const toFlag = (value: unknown) => value === true;
const toMark = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
const toDate = (value: unknown) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";

function cleanList<T>(value: unknown, clean: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 500)
    .map(clean)
    .filter((item): item is T => item !== null);
}

function cleanTopic(value: unknown): Topic | null {
  if (!isRecord(value)) return null;
  const revision = value.revision;
  return {
    id: toId(value.id),
    name: toText(value.name, 200),
    done: toFlag(value.done),
    revision: isKeyOf(REVISION_LABELS, revision) ? revision : "none",
    notes: toText(value.notes),
  };
}

function cleanExperiment(value: unknown): Experiment | null {
  if (!isRecord(value)) return null;
  return {
    id: toId(value.id),
    name: toText(value.name, 200),
    done: toFlag(value.done),
    notes: toText(value.notes),
  };
}

function cleanExam(value: unknown): Exam {
  const source = isRecord(value) ? value : {};
  return {
    date: toDate(source.date),
    max: toMark(source.max),
    obtained: toMark(source.obtained),
    notes: toText(source.notes),
  };
}

function cleanSubject(value: unknown): Subject | null {
  if (!isRecord(value)) return null;
  const type = value.type;
  const labMarks = isRecord(value.labMarks) ? value.labMarks : {};
  const see = isRecord(value.see) ? value.see : {};
  const prep = see.prep;
  return {
    id: toId(value.id),
    name: toText(value.name, 120).trim() || "Untitled subject",
    code: toText(value.code, 40),
    credits: toMark(value.credits),
    type: SUBJECT_TYPES.includes(type as SubjectType) ? (type as SubjectType) : "Theory",
    topics: cleanList(value.topics, cleanTopic),
    cie1: cleanExam(value.cie1),
    cie2: cleanExam(value.cie2),
    experiments: cleanList(value.experiments, cleanExperiment),
    labMarks: {
      max: toMark(labMarks.max),
      obtained: toMark(labMarks.obtained),
      notes: toText(labMarks.notes),
    },
    see: { ...cleanExam(see), prep: isKeyOf(PREP_LABELS, prep) ? prep : "not-started" },
  };
}

/** Reads and validates saved data. Never throws; browser-only (call from an effect). */
function loadAcademics(): { data: AcademicsData; notice: string | null } {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(ACADEMICS_STORAGE_KEY);
  } catch {
    return {
      data: createEmptyData(),
      notice: "Browser storage is not available, so changes will not be saved.",
    };
  }
  if (!raw) return { data: createEmptyData(), notice: null };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.semesters)) throw new Error("Unexpected format");
    const semesters: Record<string, Subject[]> = {};
    for (const n of SEMESTERS)
      semesters[String(n)] = cleanList(parsed.semesters[String(n)], cleanSubject);
    return { data: { version: 1, semesters }, notice: null };
  } catch {
    try {
      window.localStorage.setItem(`${ACADEMICS_STORAGE_KEY}:corrupt-backup`, raw);
    } catch {
      // Nothing more we can do; continue with a clean slate.
    }
    return {
      data: createEmptyData(),
      notice:
        "Saved academics data could not be read, so you are starting fresh. The unreadable copy was kept as a backup in this browser.",
    };
  }
}

/* ----------------------------- display helpers ---------------------------- */

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

function parseMark(value: string): number | null {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value: string): string {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "No date set";
}

function daysUntil(value: string, today: Date): number | null {
  const date = parseDate(value);
  return date ? Math.round((date.getTime() - today.getTime()) / 86_400_000) : null;
}

function formatScore(obtained: number | null, max: number | null): string {
  if (obtained === null && max === null) return "Not recorded";
  const base = `${obtained ?? "—"} / ${max ?? "—"}`;
  return obtained !== null && max !== null && max > 0
    ? `${base} (${Math.round((obtained / max) * 100)}%)`
    : base;
}

const confirmDelete = (message: string) => typeof window !== "undefined" && window.confirm(message);

/* ------------------------------ small pieces ------------------------------ */

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-2 w-full overflow-hidden rounded-full bg-secondary"
    >
      <div
        className="h-full rounded-full bg-blue-400 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-xs font-medium text-muted-foreground ${className}`}>
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function MarkInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value ?? ""}
        onChange={(event) => onChange(parseMark(event.target.value))}
        className={inputClass}
      />
    </Field>
  );
}

function ExamCard({
  title,
  exam,
  onChange,
  children,
}: {
  title: string;
  exam: Exam;
  onChange: (patch: Partial<Exam>) => void;
  children?: ReactNode;
}) {
  const tooHigh = exam.obtained !== null && exam.max !== null && exam.obtained > exam.max;

  return (
    <section className={panelClass} aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {formatScore(exam.obtained, exam.max)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Exam date">
          <input
            type="date"
            value={exam.date}
            onChange={(event) => onChange({ date: toDate(event.target.value) })}
            className={inputClass}
          />
        </Field>
        <MarkInput label="Maximum marks" value={exam.max} onChange={(max) => onChange({ max })} />
        <MarkInput
          label="Obtained marks"
          value={exam.obtained}
          onChange={(obtained) => onChange({ obtained })}
        />
        {children}
      </div>

      {tooHigh && (
        <p role="alert" className="mt-2 text-xs text-amber-400">
          Obtained marks are higher than the maximum marks. Please check the values.
        </p>
      )}

      <Field label="Notes" className="mt-3">
        <textarea
          rows={2}
          value={exam.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          className={inputClass}
        />
      </Field>
    </section>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={panelClass}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ListCard({
  title,
  empty,
  extra,
  children,
}: {
  title: string;
  empty: string;
  extra?: string;
  children: ReactNode[];
}) {
  return (
    <section className={panelClass} aria-label={title}>
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      {children.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-0.5">{children}</ul>
      )}
      {extra && <p className="mt-2 text-xs text-muted-foreground">{extra}</p>}
    </section>
  );
}

function RowButton({
  title,
  meta,
  aside,
  onClick,
}: {
  title: string;
  meta: string;
  aside?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
      >
        <span className="min-w-0">
          <span className="block break-words text-sm font-medium">{title}</span>
          <span className="block break-words text-xs text-muted-foreground">{meta}</span>
        </span>
        {aside && <span className="shrink-0 text-xs text-blue-300">{aside}</span>}
      </button>
    </li>
  );
}

/* ---------------------------------- forms --------------------------------- */

function SubjectForm({
  subject,
  onSave,
  onCancel,
}: {
  subject: Subject | null;
  onSave: (values: SubjectValues) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(subject?.name ?? "");
  const [code, setCode] = useState(subject?.code ?? "");
  const [credits, setCredits] = useState<number | null>(subject?.credits ?? null);
  const [type, setType] = useState<SubjectType>(subject?.type ?? "Theory");
  const [error, setError] = useState("");

  return (
    <form
      className={`${panelClass} mb-4`}
      aria-label={subject ? "Edit subject" : "Add subject"}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
          setError("Please enter a subject name.");
          return;
        }
        onSave({ name: trimmed, code: code.trim(), credits, type });
      }}
    >
      <h3 className="font-display text-base font-semibold">
        {subject ? "Edit subject" : "Add subject"}
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Subject name" className="sm:col-span-2 lg:col-span-1">
          <input
            type="text"
            value={name}
            maxLength={120}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            aria-invalid={error ? true : undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Subject code">
          <input
            type="text"
            value={code}
            maxLength={40}
            onChange={(event) => setCode(event.target.value)}
            className={inputClass}
          />
        </Field>
        <MarkInput label="Credits" value={credits} onChange={setCredits} />
        <Field label="Subject type">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as SubjectType)}
            className={inputClass}
          >
            {SUBJECT_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className={primaryButtonClass}>
          {subject ? "Save changes" : "Add subject"}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ----------------------------- subject sections --------------------------- */

function SyllabusTab({ subject, onChange }: { subject: Subject; onChange: SubjectUpdate }) {
  const [newTopic, setNewTopic] = useState("");
  const done = subject.topics.filter((topic) => topic.done).length;
  const pct = percent(done, subject.topics.length);

  const updateTopic = (id: string, patch: Partial<Topic>) =>
    onChange((current) => ({
      ...current,
      topics: current.topics.map((topic) => (topic.id === id ? { ...topic, ...patch } : topic)),
    }));

  const removeTopic = (topic: Topic) => {
    if (!confirmDelete(`Remove "${topic.name || "this topic"}" from the syllabus?`)) return;
    onChange((current) => ({
      ...current,
      topics: current.topics.filter((item) => item.id !== topic.id),
    }));
  };

  return (
    <div className="space-y-4">
      <div className={panelClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-medium">Syllabus completion</span>
          <span className="text-muted-foreground">
            {done} of {subject.topics.length} topics · {pct}%
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={pct} label="Syllabus completion" />
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const name = newTopic.trim();
          if (!name) return;
          onChange((current) => ({
            ...current,
            topics: [
              ...current.topics,
              { id: makeId(), name, done: false, revision: "none", notes: "" },
            ],
          }));
          setNewTopic("");
        }}
      >
        <input
          type="text"
          value={newTopic}
          maxLength={200}
          onChange={(event) => setNewTopic(event.target.value)}
          placeholder="Add a unit or topic, e.g. Unit 1: Process Scheduling"
          aria-label="New unit or topic name"
          className={inputClass}
        />
        <button type="submit" className={primaryButtonClass}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </form>

      {subject.topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No topics yet. Add the units or topics of this subject to track your syllabus.
        </p>
      ) : (
        <ul className="space-y-3">
          {subject.topics.map((topic) => (
            <li key={topic.id} className="glass rounded-xl border border-border/70 p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={topic.done}
                  onChange={(event) => updateTopic(topic.id, { done: event.target.checked })}
                  aria-label={`Mark "${topic.name || "topic"}" as completed`}
                  className="mt-2 h-4 w-4 shrink-0 accent-blue-400"
                />
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={topic.name}
                    maxLength={200}
                    onChange={(event) => updateTopic(topic.id, { name: event.target.value })}
                    aria-label="Topic name"
                    className={`${inputClass} border-transparent bg-transparent font-medium ${
                      topic.done ? "text-muted-foreground line-through" : ""
                    }`}
                  />
                  <div className="mt-2 grid gap-2 sm:grid-cols-[12rem_1fr]">
                    <Field label="Revision status">
                      <select
                        value={topic.revision}
                        onChange={(event) =>
                          updateTopic(topic.id, {
                            revision: event.target.value as RevisionStatus,
                          })
                        }
                        className={inputClass}
                      >
                        {Object.entries(REVISION_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Notes">
                      <input
                        type="text"
                        value={topic.notes}
                        onChange={(event) => updateTopic(topic.id, { notes: event.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTopic(topic)}
                  aria-label={`Remove topic ${topic.name || ""}`.trim()}
                  className={iconButtonClass}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CieTab({ subject, onChange }: { subject: Subject; onChange: SubjectUpdate }) {
  return (
    <div className="space-y-4">
      <ExamCard
        title="CIE 1"
        exam={subject.cie1}
        onChange={(patch) => onChange((s) => ({ ...s, cie1: { ...s.cie1, ...patch } }))}
      />
      <ExamCard
        title="CIE 2"
        exam={subject.cie2}
        onChange={(patch) => onChange((s) => ({ ...s, cie2: { ...s.cie2, ...patch } }))}
      />
    </div>
  );
}

function LabTab({ subject, onChange }: { subject: Subject; onChange: SubjectUpdate }) {
  const [newExperiment, setNewExperiment] = useState("");
  const done = subject.experiments.filter((experiment) => experiment.done).length;
  const pct = percent(done, subject.experiments.length);
  const marks = subject.labMarks;

  const updateExperiment = (id: string, patch: Partial<Experiment>) =>
    onChange((current) => ({
      ...current,
      experiments: current.experiments.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));

  const removeExperiment = (experiment: Experiment) => {
    if (!confirmDelete(`Remove "${experiment.name || "this experiment"}" from the lab list?`))
      return;
    onChange((current) => ({
      ...current,
      experiments: current.experiments.filter((item) => item.id !== experiment.id),
    }));
  };

  const updateMarks = (patch: Partial<LabMarks>) =>
    onChange((current) => ({ ...current, labMarks: { ...current.labMarks, ...patch } }));

  return (
    <div className="space-y-4">
      <div className={panelClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-medium">Lab experiments completed</span>
          <span className="text-muted-foreground">
            {done} of {subject.experiments.length} · {pct}%
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={pct} label="Lab experiments completed" />
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const name = newExperiment.trim();
          if (!name) return;
          onChange((current) => ({
            ...current,
            experiments: [...current.experiments, { id: makeId(), name, done: false, notes: "" }],
          }));
          setNewExperiment("");
        }}
      >
        <input
          type="text"
          value={newExperiment}
          maxLength={200}
          onChange={(event) => setNewExperiment(event.target.value)}
          placeholder="Add an experiment, e.g. Experiment 1: Linux commands"
          aria-label="New lab experiment name"
          className={inputClass}
        />
        <button type="submit" className={primaryButtonClass}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </form>

      {subject.experiments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No experiments added yet.</p>
      ) : (
        <ul className="space-y-3">
          {subject.experiments.map((experiment) => (
            <li key={experiment.id} className="glass rounded-xl border border-border/70 p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={experiment.done}
                  onChange={(event) =>
                    updateExperiment(experiment.id, { done: event.target.checked })
                  }
                  aria-label={`Mark "${experiment.name || "experiment"}" as completed`}
                  className="mt-2 h-4 w-4 shrink-0 accent-blue-400"
                />
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={experiment.name}
                    maxLength={200}
                    onChange={(event) =>
                      updateExperiment(experiment.id, { name: event.target.value })
                    }
                    aria-label="Experiment name"
                    className={`${inputClass} border-transparent bg-transparent font-medium ${
                      experiment.done ? "text-muted-foreground line-through" : ""
                    }`}
                  />
                  <div className="mt-2">
                    <Field label="Notes">
                      <input
                        type="text"
                        value={experiment.notes}
                        onChange={(event) =>
                          updateExperiment(experiment.id, { notes: event.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExperiment(experiment)}
                  aria-label={`Remove experiment ${experiment.name || ""}`.trim()}
                  className={iconButtonClass}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className={panelClass} aria-label="Practical and internal marks">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-semibold">Practical / internal marks</h3>
          <span className="text-sm text-muted-foreground">
            {formatScore(marks.obtained, marks.max)}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MarkInput
            label="Maximum marks"
            value={marks.max}
            onChange={(max) => updateMarks({ max })}
          />
          <MarkInput
            label="Obtained marks"
            value={marks.obtained}
            onChange={(obtained) => updateMarks({ obtained })}
          />
        </div>
        {marks.obtained !== null && marks.max !== null && marks.obtained > marks.max && (
          <p role="alert" className="mt-2 text-xs text-amber-400">
            Obtained marks are higher than the maximum marks. Please check the values.
          </p>
        )}
        <Field label="Notes" className="mt-3">
          <textarea
            rows={2}
            value={marks.notes}
            onChange={(event) => updateMarks({ notes: event.target.value })}
            className={inputClass}
          />
        </Field>
      </section>
    </div>
  );
}

function SeeTab({ subject, onChange }: { subject: Subject; onChange: SubjectUpdate }) {
  return (
    <ExamCard
      title="Semester End Examination (SEE)"
      exam={subject.see}
      onChange={(patch) => onChange((s) => ({ ...s, see: { ...s.see, ...patch } }))}
    >
      <Field label="Preparation status" className="sm:col-span-3">
        <select
          value={subject.see.prep}
          onChange={(event) =>
            onChange((s) => ({ ...s, see: { ...s.see, prep: event.target.value as PrepStatus } }))
          }
          className={inputClass}
        >
          {Object.entries(PREP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
    </ExamCard>
  );
}

function SubjectDetail({
  subject,
  onChange,
  onBack,
}: {
  subject: Subject;
  onChange: SubjectUpdate;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("syllabus");
  const hasLab = subject.type === "Lab" || subject.type === "Integrated";
  const tabs: { id: DetailTab; label: string }[] = [
    { id: "syllabus", label: "Syllabus" },
    { id: "cie", label: "CIE" },
    ...(hasLab ? [{ id: "lab" as const, label: "Lab" }] : []),
    { id: "see", label: "SEE" },
  ];
  const activeTab = tabs.some((item) => item.id === tab) ? tab : "syllabus";
  const meta = [
    subject.code,
    subject.credits !== null ? `${subject.credits} credits` : "",
    subject.type,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={buttonClass}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to subjects
        </button>
      </div>

      <div>
        <h3 className="break-words font-display text-xl font-semibold">{subject.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
      </div>

      <nav aria-label="Subject sections" className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={activeTab === item.id ? "true" : undefined}
            className={
              activeTab === item.id ? primaryButtonClass : `${buttonClass} text-muted-foreground`
            }
          >
            {item.label}
          </button>
        ))}
      </nav>

      {activeTab === "syllabus" && <SyllabusTab subject={subject} onChange={onChange} />}
      {activeTab === "cie" && <CieTab subject={subject} onChange={onChange} />}
      {activeTab === "lab" && <LabTab subject={subject} onChange={onChange} />}
      {activeTab === "see" && <SeeTab subject={subject} onChange={onChange} />}
    </div>
  );
}

/* -------------------------------- overview -------------------------------- */

const MAX_LIST_ITEMS = 5;

function Overview({ subjects, onOpen }: { subjects: Subject[]; onOpen: (id: string) => void }) {
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const topics = subjects.flatMap((subject) =>
      subject.topics.map((topic) => ({ subject, topic })),
    );
    const pending = topics.filter(({ topic }) => !topic.done);

    const revision = subjects
      .map((subject) => ({
        subject,
        count: subject.topics.filter((topic) => topic.revision === "needs").length,
      }))
      .filter((item) => item.count > 0);

    const labs = subjects
      .filter((subject) => subject.experiments.length > 0)
      .map((subject) => ({
        subject,
        done: subject.experiments.filter((experiment) => experiment.done).length,
        total: subject.experiments.length,
      }));

    const exams = subjects
      .flatMap((subject) => [
        { subject, label: "CIE 1", date: subject.cie1.date },
        { subject, label: "CIE 2", date: subject.cie2.date },
        { subject, label: "SEE", date: subject.see.date },
      ])
      .flatMap((exam) => {
        const days = daysUntil(exam.date, today);
        return days !== null && days >= 0 ? [{ ...exam, days }] : [];
      })
      .sort((a, b) => a.days - b.days);

    return {
      pending,
      revision,
      labs,
      exams,
      syllabusPct: percent(topics.length - pending.length, topics.length),
      topicCount: topics.length,
      labDone: labs.reduce((sum, lab) => sum + lab.done, 0),
      labTotal: labs.reduce((sum, lab) => sum + lab.total, 0),
    };
  }, [subjects]);

  const more = (count: number) =>
    count > MAX_LIST_ITEMS ? `+ ${count - MAX_LIST_ITEMS} more` : undefined;

  return (
    <section aria-label="Academic overview" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total subjects" value={String(subjects.length)} />
        <StatTile
          label="Syllabus completed"
          value={`${stats.syllabusPct}%`}
          hint={`${stats.topicCount - stats.pending.length} of ${stats.topicCount} topics`}
        />
        <StatTile label="Pending topics" value={String(stats.pending.length)} />
        <StatTile
          label="Lab experiments"
          value={stats.labTotal > 0 ? `${stats.labDone}/${stats.labTotal}` : "—"}
          hint={
            stats.labTotal > 0
              ? `${percent(stats.labDone, stats.labTotal)}% completed`
              : "None added"
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard
          title="Upcoming CIE / SEE"
          empty="No upcoming exam dates. Add dates inside a subject."
          extra={more(stats.exams.length)}
        >
          {stats.exams.slice(0, MAX_LIST_ITEMS).map((exam) => (
            <RowButton
              key={`${exam.subject.id}-${exam.label}`}
              title={exam.subject.name}
              meta={`${exam.label} · ${formatDate(exam.date)}`}
              aside={
                exam.days === 0 ? "Today" : exam.days === 1 ? "Tomorrow" : `in ${exam.days} days`
              }
              onClick={() => onOpen(exam.subject.id)}
            />
          ))}
        </ListCard>

        <ListCard
          title="Needs revision"
          empty="No subjects are marked for revision."
          extra={more(stats.revision.length)}
        >
          {stats.revision.slice(0, MAX_LIST_ITEMS).map(({ subject, count }) => (
            <RowButton
              key={subject.id}
              title={subject.name}
              meta={`${count} ${count === 1 ? "topic" : "topics"} to revise`}
              onClick={() => onOpen(subject.id)}
            />
          ))}
        </ListCard>

        <ListCard
          title="Pending syllabus topics"
          empty={stats.topicCount === 0 ? "No topics added yet." : "All topics are completed."}
          extra={more(stats.pending.length)}
        >
          {stats.pending.slice(0, MAX_LIST_ITEMS).map(({ subject, topic }) => (
            <RowButton
              key={topic.id}
              title={topic.name || "Untitled topic"}
              meta={subject.name}
              onClick={() => onOpen(subject.id)}
            />
          ))}
        </ListCard>

        <ListCard
          title="Lab completion"
          empty="No lab experiments added yet."
          extra={more(stats.labs.length)}
        >
          {stats.labs.slice(0, MAX_LIST_ITEMS).map(({ subject, done, total }) => (
            <RowButton
              key={subject.id}
              title={subject.name}
              meta={`${done} of ${total} experiments`}
              aside={`${percent(done, total)}%`}
              onClick={() => onOpen(subject.id)}
            />
          ))}
        </ListCard>
      </div>
    </section>
  );
}

/* ------------------------------ module shell ------------------------------ */

function Academics({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<AcademicsData>(createEmptyData);
  const [ready, setReady] = useState(false);
  const [loadNotice, setLoadNotice] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [semester, setSemester] = useState(DEFAULT_SEMESTER);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<{ subjectId: string | null } | null>(null);

  // Load after mount so nothing touches localStorage during server rendering.
  useEffect(() => {
    const loaded = loadAcademics();
    setData(loaded.data);
    setLoadNotice(loaded.notice);
    setReady(true);
  }, []);

  // Save every change (only once the saved data has been loaded).
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(ACADEMICS_STORAGE_KEY, JSON.stringify(data));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [data, ready]);

  const semesterKey = String(semester);
  const subjects = data.semesters[semesterKey] ?? [];
  const openSubject = subjects.find((subject) => subject.id === openId) ?? null;
  const editingSubject = form?.subjectId
    ? (subjects.find((subject) => subject.id === form.subjectId) ?? null)
    : null;

  const updateSubjects = (update: (list: Subject[]) => Subject[]) =>
    setData((previous) => ({
      ...previous,
      semesters: {
        ...previous.semesters,
        [semesterKey]: update(previous.semesters[semesterKey] ?? []),
      },
    }));

  const updateSubject = (id: string, update: (subject: Subject) => Subject) =>
    updateSubjects((list) =>
      list.map((subject) => (subject.id === id ? update(subject) : subject)),
    );

  const saveSubject = (values: SubjectValues) => {
    if (form?.subjectId) {
      updateSubject(form.subjectId, (subject) => ({ ...subject, ...values }));
    } else {
      updateSubjects((list) => [...list, createSubject(values)]);
    }
    setForm(null);
  };

  const deleteSubject = (subject: Subject) => {
    const message = `Delete "${subject.name}" from Semester ${semester}? Its syllabus, CIE, lab and SEE data will be removed. This cannot be undone.`;
    if (!confirmDelete(message)) return;
    updateSubjects((list) => list.filter((item) => item.id !== subject.id));
    if (openId === subject.id) setOpenId(null);
    if (form?.subjectId === subject.id) setForm(null);
  };

  const changeSemester = (next: number) => {
    setSemester(next);
    setOpenId(null);
    setForm(null);
  };

  return (
    <section aria-labelledby="academics-heading" className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={buttonClass}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to modules
        </button>
        <span className="text-xs text-muted-foreground">Saved in this browser only</span>
      </div>

      <div className={panelClass}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-blue-400/15 bg-blue-400/5 p-3">
            <GraduationCap className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <h2 id="academics-heading" className="font-display text-xl font-semibold">
              Academics
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Subjects, syllabus, CIEs, labs and end-semester exams for Semester {semester}.
            </p>
          </div>
        </div>

        <div role="group" aria-label="Select semester" className="mt-4 flex flex-wrap gap-2">
          {SEMESTERS.map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => changeSemester(number)}
              aria-pressed={number === semester}
              aria-label={`Semester ${number}`}
              className={
                number === semester ? primaryButtonClass : `${buttonClass} text-muted-foreground`
              }
            >
              Sem {number}
            </button>
          ))}
        </div>
      </div>

      {(loadNotice || saveFailed) && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-300"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {saveFailed
              ? "Your latest changes could not be saved because browser storage is full or blocked."
              : loadNotice}
          </span>
        </p>
      )}

      {!ready ? (
        <p className="text-sm text-muted-foreground">Loading your academics…</p>
      ) : openSubject ? (
        <SubjectDetail
          key={openSubject.id}
          subject={openSubject}
          onChange={(update) => updateSubject(openSubject.id, update)}
          onBack={() => setOpenId(null)}
        />
      ) : (
        <>
          {subjects.length > 0 && <Overview subjects={subjects} onOpen={setOpenId} />}

          <section aria-labelledby="subjects-heading">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 id="subjects-heading" className="font-display text-lg font-semibold">
                Subjects · Semester {semester}
              </h3>
              {!form && (
                <button
                  type="button"
                  onClick={() => setForm({ subjectId: null })}
                  className={primaryButtonClass}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add subject
                </button>
              )}
            </div>

            {form && (
              <SubjectForm
                key={form.subjectId ?? "new"}
                subject={editingSubject}
                onSave={saveSubject}
                onCancel={() => setForm(null)}
              />
            )}

            {subjects.length === 0 ? (
              !form && (
                <div className={`${panelClass} text-center`}>
                  <p className="font-medium">No subjects in Semester {semester} yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your first subject to start tracking its syllabus, CIEs, labs and SEE.
                  </p>
                </div>
              )
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => {
                  const done = subject.topics.filter((topic) => topic.done).length;
                  const pct = percent(done, subject.topics.length);
                  const meta = [
                    subject.code,
                    subject.credits !== null ? `${subject.credits} credits` : "",
                    subject.type,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <article
                      key={subject.id}
                      className="glass rounded-2xl border border-border/70 p-5 transition-colors hover:border-blue-400/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setOpenId(subject.id)}
                          aria-label={`Open ${subject.name}`}
                          className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
                        >
                          <span className="block break-words font-display text-base font-semibold">
                            {subject.name}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">{meta}</span>
                        </button>
                        <div className="flex shrink-0 gap-0.5">
                          <button
                            type="button"
                            onClick={() => setForm({ subjectId: subject.id })}
                            aria-label={`Edit ${subject.name}`}
                            className={iconButtonClass}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubject(subject)}
                            aria-label={`Delete ${subject.name}`}
                            className={iconButtonClass}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                          <span>Syllabus</span>
                          <span>
                            {subject.topics.length === 0
                              ? "No topics yet"
                              : `${done}/${subject.topics.length} · ${pct}%`}
                          </span>
                        </div>
                        <ProgressBar value={pct} label={`${subject.name} syllabus completion`} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
