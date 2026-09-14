import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Mail, Send, Paperclip, X, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/contact.functions";
import { toast } from "sonner";

const URL_CONTACT = "https://codeforgedev.vercel.app/contact";
const OG_IMAGE = "https://codeforgedev.vercel.app/og-image.png";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CodeForge" },
      {
        name: "description",
        content: "Get in touch about a project, opportunity, or just to say hi.",
      },
      { property: "og:title", content: "Contact — CodeForge" },
      {
        property: "og:description",
        content: "Get in touch about a project, opportunity, or just to say hi.",
      },
      { property: "og:url", content: URL_CONTACT },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_CONTACT }],
  }),
  component: ContactPage,
});

const MAX_FILES = 3;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function ContactPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const loadedAtRef = useRef(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFileError("");
    const combined = [...files, ...Array.from(newFiles)];
    if (combined.length > MAX_FILES) {
      setFileError(`You can attach up to ${MAX_FILES} files.`);
      return;
    }
    for (const f of newFiles) {
      if (f.size > MAX_FILE_BYTES) {
        setFileError(`"${f.name}" is larger than 8MB.`);
        return;
      }
    }
    setFiles(combined);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const nextErrors: Record<string, string> = {};

    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    if (!name) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Please enter a valid email address.";
    if (!message) nextErrors.message = "Please enter a message.";
    if (message.length > 5000) nextErrors.message = "Message is too long (5000 characters max).";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    fd.set("formLoadedAt", String(loadedAtRef.current));
    fd.set("turnstileToken", turnstileToken);
    fd.delete("attachments");
    files.forEach((f) => fd.append("attachments", f));

    setBusy(true);
    try {
      await submitContactForm({ data: fd });
      void navigate({ to: "/thank-you" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Couldn't send your message. Please try again.";
      toast.error(msg);
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-electric">Contact</div>
          <h1 className="mt-2 font-display text-4xl font-bold gradient-text sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-3 text-muted-foreground">
            Have a project, opportunity, or question? Send a message below — I usually reply within
            a few days.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass mt-10 space-y-5 rounded-2xl p-6 sm:p-8"
          noValidate
        >
          {/* Honeypot — hidden from real visitors, bots tend to fill every field */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                className="mt-1.5"
                maxLength={200}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-xs text-red-400">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="mt-1.5"
                maxLength={320}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-400">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" className="mt-1.5" maxLength={200} />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={6}
              className="mt-1.5"
              maxLength={5000}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
            />
            {errors.message && (
              <p id="message-error" className="mt-1 text-xs text-red-400">
                {errors.message}
              </p>
            )}
          </div>

          <div>
            <Label>Attachments (optional)</Label>
            <div className="mt-1.5 space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-4 text-sm text-muted-foreground hover:border-electric/50 hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" />
                Add files — images, PDF, DOC/PPT/XLS, TXT (up to {MAX_FILES}, 8MB each)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              {fileError && <p className="text-xs text-red-400">{fileError}</p>}
              {files.length > 0 && (
                <ul className="space-y-1.5">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm"
                    >
                      <span className="truncate">
                        {f.name}{" "}
                        <span className="text-muted-foreground">({formatBytes(f.size)})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label={`Remove ${f.name}`}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <TurnstileWidget onToken={setTurnstileToken} />

          <Button
            type="submit"
            disabled={busy}
            className="w-full gap-2 bg-gradient-to-r from-violet to-electric text-white"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {busy ? "Sending…" : "Send message"}
          </Button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          Prefer email?{" "}
          <a
            href="mailto:simakahmed@outlook.com"
            className="text-violet underline underline-offset-2"
          >
            simakahmed@outlook.com
          </a>
        </p>
      </section>
    </SiteLayout>
  );
}
