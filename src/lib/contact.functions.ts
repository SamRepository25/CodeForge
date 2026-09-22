import { createServerFn } from "@tanstack/react-start";
import { createHash, randomUUID } from "node:crypto";
import { getClientIp, verifyTurnstile } from "@/lib/turnstile.server";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAX_FILES = 3;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per file
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20MB per submission
const MIN_SUBMIT_MS = 2000; // reject if the form was "filled" faster than this
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // max submissions per IP per window

const ALLOWED_TYPES: Record<string, { exts: string[]; magic: (buf: Uint8Array) => boolean }> = {
  "image/jpeg": {
    exts: ["jpg", "jpeg"],
    magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  "image/png": {
    exts: ["png"],
    magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  "image/webp": {
    exts: ["webp"],
    magic: (b) => b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  "application/pdf": {
    exts: ["pdf"],
    magic: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
  "text/plain": { exts: ["txt"], magic: () => true }, // no reliable magic number; extension + MIME gate it
  // Legacy OLE-based Office formats (.doc/.ppt/.xls) share one binary container signature
  "application/msword": {
    exts: ["doc"],
    magic: (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
  },
  "application/vnd.ms-powerpoint": {
    exts: ["ppt"],
    magic: (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
  },
  "application/vnd.ms-excel": {
    exts: ["xls"],
    magic: (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
  },
  // Modern Office formats are zip containers ("PK\x03\x04")
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    exts: ["docx"],
    magic: (b) => b[0] === 0x50 && b[1] === 0x4b,
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    exts: ["pptx"],
    magic: (b) => b[0] === 0x50 && b[1] === 0x4b,
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    exts: ["xlsx"],
    magic: (b) => b[0] === 0x50 && b[1] === 0x4b,
  },
};

function hashIp(ip: string): string {
  const salt = process.env.CONTACT_IP_HASH_SALT ?? "codeforge-contact";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function fileExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Invalid submission");
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // -- honeypot + timing --------------------------------------------------
    const honeypot = String(data.get("company") ?? "");
    if (honeypot.trim().length > 0) {
      // Silently "succeed" so the bot doesn't learn its submission was rejected.
      return { success: true };
    }
    const formLoadedAt = Number(data.get("formLoadedAt") ?? 0);
    if (!formLoadedAt || Date.now() - formLoadedAt < MIN_SUBMIT_MS) {
      throw new Error("Please try submitting again.");
    }

    // -- field validation -----------------------------------------------------
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const turnstileToken = String(data.get("turnstileToken") ?? "");

    if (name.length < 1 || name.length > 200) throw new Error("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320)
      throw new Error("Please enter a valid email address.");
    if (subject.length > 200) throw new Error("Subject is too long.");
    if (message.length < 1 || message.length > 5000)
      throw new Error("Message must be between 1 and 5000 characters.");

    const ip = getClientIp();
    const ipHash = hashIp(ip);

    // -- spam check -----------------------------------------------------------
    const turnstileOk = await verifyTurnstile(turnstileToken, ip, "contact");
    if (!turnstileOk) throw new Error("Spam check failed. Please try again.");

    // -- attachments ------------------------------------------------------------
    const files = data
      .getAll("attachments")
      .filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_FILES) throw new Error(`You can attach up to ${MAX_FILES} files.`);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_BYTES) throw new Error("Total attachment size is too large.");

    const validatedFiles: { file: File; buffer: Buffer; mime: string }[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" is larger than 8MB.`);
      const spec = ALLOWED_TYPES[file.type];
      const ext = fileExt(file.name);
      if (!spec || !spec.exts.includes(ext)) {
        throw new Error(`"${file.name}" is not an allowed file type.`);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!spec.magic(buffer)) {
        throw new Error(`"${file.name}" doesn't match its declared file type.`);
      }
      validatedFiles.push({ file, buffer, mime: file.type });
    }

    // -- insert message row -------------------------------------------------------
    const { data: insertedRows, error: insertError } = await supabaseAdmin.rpc("submit_contact_message", {
      p_name: name,
      p_email: email,
      p_subject: subject || null,
      p_message: message,
      p_ip_hash: ipHash,
    });
    const inserted = insertedRows ? { id: insertedRows as string } : null;
    if (insertError || !inserted) {
      if (insertError?.message.includes("rate limit")) {
        throw new Error("You've sent several messages recently. Please try again later.");
      }
      console.error("[contact] insert failed", insertError);
      throw new Error("Couldn't send your message. Please try again.");
    }

    // -- upload attachments ----------------------------------------------------------
    for (const { file, buffer, mime } of validatedFiles) {
      const ext = fileExt(file.name);
      const storagePath = `${inserted.id}/${randomUUID()}${ext ? `.${ext}` : ""}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("contact-attachments")
        .upload(storagePath, buffer, { contentType: mime, upsert: false });
      if (uploadError) {
        console.error("[contact] attachment upload failed", uploadError);
        continue; // don't fail the whole submission over one bad attachment
      }
      const { error: attachmentInsertError } = await supabaseAdmin
        .from("contact_attachments")
        .insert({
          message_id: inserted.id,
          storage_path: storagePath,
          file_name: file.name.slice(0, 255),
          mime_type: mime,
          size_bytes: file.size,
        });
      if (attachmentInsertError) {
        console.error("[contact] attachment metadata insert failed", attachmentInsertError);
        await supabaseAdmin.storage.from("contact-attachments").remove([storagePath]);
        throw new Error("Couldn't save your attachment. Please try again.");
      }
    }

    // -- notify (best-effort) --------------------------------------------------------
    try {
      const { sendContactNotification } = await import("@/lib/email.server");
      await sendContactNotification({
        name,
        email,
        subject,
        message,
        attachmentCount: validatedFiles.length,
      });
    } catch (e) {
      console.error("[contact] notification email failed", e);
    }

    return { success: true };
  });
