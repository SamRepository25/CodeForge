import { getRequest } from "@tanstack/react-start/server";

export function getClientIp(): string {
  const req = getRequest();
  const fwd = req?.headers?.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req?.headers?.get("x-real-ip") ?? "unknown";
}

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Turnstile not configured — fail closed in production, but don't hard-block local dev.
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping Turnstile verification");
    return process.env.NODE_ENV !== "production";
  }
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[turnstile] verification failed", e);
    return false;
  }
}
