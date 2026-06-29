import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Sparkles, Code2, Download, Github, Linkedin, Mail, Plus, Trash, Edit, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/edit/EditableText";
import { toast } from "sonner";

type Entry = { id: string; year: string; title: string; org: string; description: string; order_index: number };
const EMPTY_ENTRY: Partial<Entry> = { year: "", title: "", org: "", description: "", order_index: 0 };

function useEntries(table: "experience" | "education") {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("order_index");
      if (error) throw error;
      return (data ?? []) as Entry[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: [table] });
  return { ...query, refresh };
}

function EntryForm({ table, entry, onDone }: { table: "experience" | "education"; entry: Partial<Entry> | null; onDone: () => void }) {
  const [draft, setDraft] = useState<Partial<Entry>>(entry ?? EMPTY_ENTRY);
  const qc = useQueryClient();

  const save = async () => {
    if (!draft.title || !draft.description) return toast.error("Title and description required.");
    const payload = { year: draft.year!, title: draft.title!, org: draft.org!, description: draft.description!, order_index: draft.order_index ?? 0 };
    const { error } = draft.id
      ? await supabase.from(table).update(payload).eq("id", draft.id)
      : await supabase.from(table).insert(payload);
    if (error) return toast.error(error.message);
    toast.success(draft.id ? "Updated" : "Added");
    qc.invalidateQueries({ queryKey: [table] });
    onDone();
  };

  return (
    <div className="glass gradient-border mt-4 rounded-2xl p-5">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { label: "Year", key: "year" }, { label: "Title *", key: "title" },
          { label: "Organization", key: "org" }, { label: "Order Index", key: "order_index", type: "number" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
            <input
              type={type ?? "text"}
              value={(draft as Record<string, unknown>)[key] as string ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
              className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none focus:border-violet/60"
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Description *</label>
          <textarea value={draft.description ?? ""} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={3}
            className="w-full resize-none rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm outline-none focus:border-violet/60" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={save} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet to-electric px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          <Check className="h-4 w-4" /> Save
        </button>
        <button onClick={onDone} className="flex items-center gap-1.5 rounded-xl border border-border/60 px-4 py-2 text-sm hover:bg-white/5">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

function EntrySection({ table, icon: Icon, title, gradient }: { table: "experience" | "education"; icon: React.ComponentType<{ className?: string }>; title: string; gradient: string }) {
  const { editMode } = useEditMode();
  const { data: entries = [], refresh } = useEntries(table);
  const [form, setForm] = useState<{ open: boolean; entry: Partial<Entry> | null }>({ open: false, entry: null });
  const qc = useQueryClient();

  const deleteEntry = async (id: string) => {
    if (!confirm(`Delete this ${title.toLowerCase()} entry?`)) return;
    await supabase.from(table).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: [table] });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        {editMode && (
          <button onClick={() => setForm({ open: true, entry: null })}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet to-electric px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> Add
          </button>
        )}
      </div>
      {editMode && form.open && <EntryForm table={table} entry={form.entry} onDone={() => { setForm({ open: false, entry: null }); refresh(); }} />}
      <div className="mt-8 space-y-4">
        {entries.map((e) => (
          <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className={`group glass flex gap-5 rounded-2xl p-5 ${editMode ? "outline-dashed outline-1 outline-violet/20 hover:outline-violet/50" : ""}`}>
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{e.title} <span className="text-muted-foreground">· {e.org}</span></h3>
                <span className="text-xs text-electric">{e.year}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
            </div>
            {editMode && (
              <div className="flex shrink-0 flex-col gap-1.5 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => setForm({ open: true, entry: e })} className="rounded-lg bg-violet/20 p-1.5 text-violet hover:bg-violet/30"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => deleteEntry(e.id)} className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"><Trash className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function AboutPage() {
  const { editMode } = useEditMode();
  const qc = useQueryClient();

  const settings = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((r) => { map[r.key] = r.value ?? ""; });
      return map;
    },
  });

  const saveSetting = async (key: string, value: string) => {
    await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  const s = settings.data ?? {};

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-12">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-violet" /> About me
            </div>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-tight md:text-6xl">
              Hi, I'm{" "}
              <EditableText
                value={s.about_name ?? "B SIMAK AHMED"}
                onSave={(v) => saveSetting("about_name", v)}
                as="span"
                className="gradient-text font-display text-5xl font-bold md:text-6xl"
              />.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              <EditableText
                value={s.about_headline ?? "B.E. CSE Student | Tech Enthusiast | Exploring Software, AI, Cybersecurity & Digital Systems"}
                onSave={(v) => saveSetting("about_headline", v)}
                as="span"
                multiline
              />
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-gradient-to-r from-violet to-electric text-white">
                <a href={s.resume_url || "#"} download><Download className="mr-1.5 h-4 w-4" />Download Resume</a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href={`mailto:${s.email || "simakahmed@outlook.com"}`}><Mail className="mr-1.5 h-4 w-4" />Contact</a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href={s.github_url || "https://github.com/SamRepository25/"} target="_blank" rel="noreferrer"><Github className="mr-1.5 h-4 w-4" />GitHub</a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href={s.linkedin_url || "https://www.linkedin.com/in/simakahmed?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"} target="_blank" rel="noreferrer"><Linkedin className="mr-1.5 h-4 w-4" />LinkedIn</a>
              </Button>
            </div>
            {editMode && (
              <p className="mt-3 text-xs text-violet/70">
                ✏️ Update email, GitHub, LinkedIn & resume URL in Site Settings via the dashboard.
              </p>
            )}
          </div>
          <div className="float-slow glass-strong gradient-border relative grid h-56 w-56 place-items-center rounded-[2.5rem] glow-violet">
            <Code2 className="h-24 w-24 text-electric" />
          </div>
        </div>
      </section>

      <EntrySection table="experience" icon={Briefcase} title="Experience" gradient="from-violet to-electric" />
      <EntrySection table="education" icon={GraduationCap} title="Education" gradient="from-electric to-violet" />

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="glass gradient-border rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold">Let's build something together</h2>
          <p className="mt-2 text-muted-foreground">Open to collaborations, freelance work and conversations.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="rounded-xl bg-gradient-to-r from-violet to-electric text-white">
              <a href={`mailto:${s.email || "simakahmed@outlook.com"}`}>Get in touch</a>
            </Button>
            <Button asChild variant="outline" className="rounded-xl"><Link to="/projects">See my work</Link></Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}