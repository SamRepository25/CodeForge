import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export interface PostDraft {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  published: boolean;
  featured: boolean;
  reading_time: number;
}

const empty: PostDraft = { title: "", slug: "", excerpt: "", content: "", cover_image: "", category: "", tags: [], published: false, featured: false, reading_time: 1 };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export function PostEditor({ existing, onSaved }: { existing?: PostDraft; onSaved: () => void }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState<PostDraft>(existing ?? empty);
  const [tagsInput, setTagsInput] = useState((existing?.tags ?? []).join(", "));
  const [busy, setBusy] = useState(false);

  const update = <K extends keyof PostDraft>(k: K, v: PostDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async (publish?: boolean) => {
    if (!user) return;
    if (!draft.title.trim()) return toast.error("Title is required");
    if (!draft.content.trim()) return toast.error("Content is required");
    setBusy(true);
    const slug = draft.slug.trim() || slugify(draft.title);
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const reading_time = Math.max(1, Math.round(draft.content.split(/\s+/).length / 200));
    const payload = { ...draft, slug, tags, reading_time, published: publish ?? draft.published, author_id: user.id };
    const res = draft.id
      ? await supabase.from("posts").update(payload).eq("id", draft.id)
      : await supabase.from("posts").insert(payload);
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(draft.id ? "Post updated" : "Post created");
    onSaved();
  };

  return (
    <div className="glass mt-6 space-y-5 rounded-2xl p-6">
      <Field label="Title">
        <Input value={draft.title} onChange={(e) => update("title", e.target.value)} placeholder="A bold title..." className="rounded-xl text-lg" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug (URL)">
          <Input value={draft.slug} onChange={(e) => update("slug", slugify(e.target.value))} placeholder={slugify(draft.title) || "auto-from-title"} className="rounded-xl font-mono text-sm" />
        </Field>
        <Field label="Category">
          <Input value={draft.category ?? ""} onChange={(e) => update("category", e.target.value)} placeholder="e.g. React, AI" className="rounded-xl" />
        </Field>
      </div>
      <Field label="Excerpt">
        <Textarea value={draft.excerpt ?? ""} onChange={(e) => update("excerpt", e.target.value)} placeholder="A short summary..." className="rounded-xl" rows={2} maxLength={300} />
      </Field>
      <Field label="Cover image URL (optional)">
        <Input value={draft.cover_image ?? ""} onChange={(e) => update("cover_image", e.target.value)} placeholder="https://..." className="rounded-xl" />
      </Field>
      <Field label="Tags (comma-separated)">
        <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="react, typescript, ai" className="rounded-xl" />
      </Field>
      <Field label="Content">
        <Textarea value={draft.content} onChange={(e) => update("content", e.target.value)} rows={18} placeholder="Write your article in plain text or markdown..." className="rounded-xl font-mono text-sm" />
        <div className="mt-1 text-xs text-muted-foreground">{draft.content.split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.round(draft.content.split(/\s+/).length / 200))} min read</div>
      </Field>
      <div className="flex flex-wrap items-center gap-6 border-t border-border/40 pt-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <Switch checked={draft.published} onCheckedChange={(v) => update("published", v)} />Published
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <Switch checked={draft.featured} onCheckedChange={(v) => update("featured", v)} />Featured
        </label>
        <div className="ml-auto flex gap-2">
          <Button onClick={() => save(false)} variant="outline" disabled={busy} className="rounded-xl">Save draft</Button>
          <Button onClick={() => save(true)} disabled={busy} className="rounded-xl bg-gradient-to-r from-violet to-electric text-white">
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
