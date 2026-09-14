// Server-only. Never import this from a route file or a *.functions.ts module
// that ships to the client bundle — only from inside server function handlers.
import { Resend } from "resend";

function stripNewlines(s: string): string {
  return s.replace(/[\r\n]+/g, " ");
}

export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachmentCount: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "CodeForge <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn(
      "[contact] RESEND_API_KEY or CONTACT_NOTIFY_EMAIL not set — skipping notification email",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const dashboardUrl = "https://codeforgedev.vercel.app/admin";

  await resend.emails.send({
    from,
    to,
    replyTo: params.email,
    subject: `New message: ${stripNewlines(params.subject) || "(no subject)"} — from ${stripNewlines(params.name)}`,
    text: [
      `New contact form submission on CodeForge.`,
      ``,
      `From: ${params.name} <${params.email}>`,
      `Subject: ${params.subject || "(no subject)"}`,
      `Attachments: ${params.attachmentCount}`,
      ``,
      `Message:`,
      params.message,
      ``,
      `View in dashboard: ${dashboardUrl}`,
    ].join("\n"),
  });
}
