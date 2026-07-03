import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, ExternalLink, Plus, Trash, Edit, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useEditMode } from "@/contexts/EditModeContext";
import { toast } from "sonner";

const URL_PROJECTS = "https://codeforgedev.vercel.app/projects";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cb2daafa-ef7b-443c-91ff-56bf8bc32259";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — CodeForge" },
      { name: "description", content: "Selected projects, experiments and open-source work by the CodeForge developer." },
      { property: "og:title", content: "Projects — CodeForge" },
      { property: "og:description", content: "Selected projects and case studies." },
      { property: "og:url", content: URL_PROJECTS },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_PROJECTS }],
  }),
  component: Projects,
});

type Project = {
  id: string;
  title: string;
  category: string | null;
  description: string;
  tags: string[];
  github_url: string | null;
  live_url: string | null;
  coming_soon: boolean | null;
  featured: boolean;
  order_index: number;
  slug: string;
};

const EMPTY: Partial<Project> = {
  title: "", category: "", description: "", tags: [],
  github_url: "", live_url: "", coming_soon: true, featured: false, order_index: 99,
};

function Projects() {
  const qc = useQueryClient();
  const { editMode } = useEditMode();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Project>>(EMPTY);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("order_index");
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["projects"] });

  const startAdd = () => { setDraft({ ...EMPTY, order_index: projects.length }); setAdding(true); setEditingId(null); };
  const startEdit = (p: Project) => { setDraft(p); setEditingId(p.id); setAdding(false); };
  const cancelForm = () => { setAdding(false); setEditingId(null); setDraft(EMPTY); };

  const saveProject = async () => {
    if (!draft.title || !draft.description) return toast.error("Title and description are required.");
    const payload = {
      title: draft.title!,
      category: draft.category ?? null,
      description: draft.description!,
      tags: typeof draft.tags === "string"
        ? (draft.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
        : (draft.tags ?? []),
      github_url: draft.github_url || null,
      live_url: draft.live_url || null,
      coming_soon: draft.coming_soon ?? true,
      featured: draft.featured ?? false,
      order_index: draft.order_index ?? 99,
      slug: draft.slug || draft.title!.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    };
    if (adding) {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Project added");
    } else {
      const { error } = await supabase.from("projects").update(payload).eq("id", editingId!);
      if (error) return toast.error(error.message);
      toast.success("Project updated");
    }
    refresh();
    cancelForm();
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    refresh();
  };

  const showForm = adding || editingId !== null;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-24">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.18em] text-electric">Portfolio</div>
            <h1 className="mt-2 font-display text-5xl font-bold tracking-tight md:text-6xl">Projects & case studies</h1>
            <p className="mt-4 text-lg text-muted-foreground">A curated portfolio of web applications, AI-powered tools, and software solutions built with modern technologies and best development practices.</p>
          </div>
          {editMode && (
            <button
              onClick={startAdd}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet to-electric px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Project
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {editMode && showForm && (
          <div className="mt-8 glass gradient-border rounded-2xl p-6">
            <h3 className="mb-5 font-display text-lg font-semibold">{adding ? "Add New Project" : "Edit Project"}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Title *", key: "title", type: "text" },
                { label: "Category", key: "category", type: "text" },
                { label: "GitHub URL", key: "github_url", type: "url" },
                { label: "Live URL", key: "live_url", type: "url" },
                { label: "Order Index", key: "order_index", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    type={type}
                    value={(draft as Record<string, unknown>)[key] as string ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(draft.tags) ? draft.tags.join(", ") : (draft.tags ?? "")}
                  onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value as unknown as string[] }))}
                  className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description *</label>
                <textarea
                  value={draft.description ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.coming_soon ?? true} onChange={(e) => setDraft((d) => ({ ...d, coming_soon: e.target.checked }))} className="h-4 w-4 rounded" />
                  Coming Soon
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.featured ?? false} onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))} className="h-4 w-4 rounded" />
                  Featured on Home
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={saveProject} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet to-electric px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                <Check className="h-4 w-4" /> {adding ? "Add Project" : "Save Changes"}
              </button>
              <button onClick={cancelForm} className="flex items-center gap-1.5 rounded-xl border border-border/60 px-4 py-2 text-sm font-medium hover:bg-white/5">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass h-56 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`group glass relative flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-1 ${editMode ? "outline-dashed outline-1 outline-violet/20 hover:outline-violet/50" : ""}`}
              >
                <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-violet to-transparent opacity-40" />

                {editMode && (
                  <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => startEdit(p)} className="rounded-lg bg-violet/20 p-1.5 text-violet hover:bg-violet/30">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteProject(p.id)} className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20">
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.category ?? "Project"}
                  {editMode && p.featured && <span className="ml-1 text-electric">★</span>}
                </div>
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(p.tags ?? []).map((t) => (
                    <span key={t} className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-electric transition hover:opacity-80">
                      <Github className="h-4 w-4" />GitHub
                    </a>
                  )}
                  {p.coming_soon || !p.live_url ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground/60 cursor-default select-none">
                      <ExternalLink className="h-3 w-3" />Coming Soon
                    </span>
                  ) : (
                    <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-electric transition hover:opacity-80">
                      <ExternalLink className="h-4 w-4" />Live Demo
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}