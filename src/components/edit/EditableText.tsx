import { useState, useRef, useEffect } from "react";
import { Check, X, Pencil } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";

interface EditableProps {
  value: string;
  onSave: (val: string) => Promise<void>;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  multiline?: boolean;
  placeholder?: string;
}

/** Wraps any text element — click to edit inline, Enter/✓ to save, Esc/✗ to cancel */
export function EditableText({
  value,
  onSave,
  className = "",
  as: Tag = "span",
  multiline = false,
  placeholder = "Click to edit…",
}: EditableProps) {
  const { editMode } = useEditMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  if (!editMode) return <Tag className={className}>{value}</Tag>;

  if (editing) {
    const save = async () => {
      if (draft === value) { setEditing(false); return; }
      setSaving(true);
      await onSave(draft);
      setSaving(false);
      setEditing(false);
    };
    const cancel = () => { setDraft(value); setEditing(false); };

    return (
      <span className="relative inline-block w-full">
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") cancel(); }}
            rows={4}
            className={`w-full resize-none rounded-lg border border-violet/60 bg-card/80 p-2 text-foreground outline-none ring-2 ring-violet/30 ${className}`}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
            className={`w-full rounded-lg border border-violet/60 bg-card/80 p-1 text-foreground outline-none ring-2 ring-violet/30 ${className}`}
          />
        )}
        <span className="mt-1 flex gap-1">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 hover:bg-emerald-500/30">
            <Check className="h-3 w-3" />{saving ? "Saving…" : "Save"}
          </button>
          <button onClick={cancel} className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/20">
            <X className="h-3 w-3" />Cancel
          </button>
        </span>
      </span>
    );
  }

  return (
    <Tag
      className={`group relative cursor-pointer rounded-md outline-dashed outline-1 outline-transparent transition hover:outline-violet/50 ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-muted-foreground/50 italic">{placeholder}</span>}
      <Pencil className="absolute -right-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet opacity-0 transition group-hover:opacity-100" />
    </Tag>
  );
}

/** Edit-mode wrapper that shows a dashed outline hint and a small edit badge */
export function EditZone({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  const { editMode } = useEditMode();
  if (!editMode) return <>{children}</>;
  return (
    <div className={`relative rounded-xl outline-dashed outline-1 outline-violet/30 transition hover:outline-violet/60 ${className}`}>
      <span className="absolute -top-3 left-3 z-10 rounded-full bg-violet/20 px-2 py-0.5 text-[10px] font-medium text-violet backdrop-blur">
        ✏️ {label}
      </span>
      {children}
    </div>
  );
}