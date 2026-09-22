import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { getClientIp, verifyTurnstile } from "@/lib/turnstile.server";

const MIN_SUBMIT_MS = 2000;

function hashIp(ip: string): string {
  const salt = process.env.CONTACT_IP_HASH_SALT ?? "codeforge-comments";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export const submitGuestComment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid submission.");
    const value = data as Record<string, unknown>;
    return {
      postId: String(value.postId ?? ""),
      name: String(value.name ?? ""),
      email: String(value.email ?? ""),
      content: String(value.content ?? ""),
      turnstileToken: String(value.turnstileToken ?? ""),
      formLoadedAt: Number(value.formLoadedAt ?? 0),
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const name = data.name.trim();
    const email = data.email.trim();
    const content = data.content.trim();

    if (!/^[0-9a-f-]{36}$/i.test(data.postId)) throw new Error("Invalid article.");
    if (name.length < 1 || name.length > 100) throw new Error("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      throw new Error("Please enter a valid email address.");
    }
    if (content.length < 1 || content.length > 1000) {
      throw new Error("Comment must be between 1 and 1000 characters.");
    }
    if (!data.formLoadedAt || Date.now() - data.formLoadedAt < MIN_SUBMIT_MS) {
      throw new Error("Please take a moment before submitting.");
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("id", data.postId)
      .eq("published", true)
      .maybeSingle();
    if (postError || !post) throw new Error("Article not found.");

    const ipHash = hashIp(getClientIp());
    const turnstileOk = await verifyTurnstile(data.turnstileToken, getClientIp());
    if (!turnstileOk) throw new Error("Spam check failed. Please try again.");

    const { error } = await supabaseAdmin.rpc("submit_guest_comment", {
      p_post_id: data.postId,
      p_name: name,
      p_email: email,
      p_content: content,
      p_ip_hash: ipHash,
    });

    if (error) {
      if (error.message.includes("rate limit")) {
        throw new Error("You've submitted several comments recently. Please try again later.");
      }
      console.error("[comments] insert failed", error);
      throw new Error("Couldn't submit your comment. Please try again.");
    }

    return { success: true };
  });
