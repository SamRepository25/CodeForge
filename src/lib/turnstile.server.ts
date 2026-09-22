import { getRequest } from "@tanstack/react-start/server";

export function getClientIp(): string {
  const req = getRequest();
  const vercelForwarded = req?.headers?.get("x-vercel-forwarded-for");
  if (vercelForwarded) return vercelForwarded.trim();
  const fwd = req?.headers?.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req?.headers?.get("x-real-ip") ?? "unknown";
}

export async function verifyTurnstile(token: string, ip: string, expectedAction: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Turnstile not configured — fail closed in production, but don't hard-block local dev.
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping Turnstile verification");
    return process.env.NODE_ENV !== "production";
  }
  try {
    if (!token || token.length > 2048) return false;

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      success: boolean;
      hostname?: string;
      action?: string;
    };
    if (!data.success || data.action !== expectedAction) return false;

    const requestHost = getRequest()?.headers?.get("host")?.split(":")[0]?.toLowerCase();
    const configuredHostnames = (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean);
    const expectedHostnames = configuredHostnames.length > 0
      ? configuredHostnames
      : requestHost
        ? [requestHost]
        : [];

    if (!data.hostname || expectedHostnames.length === 0) return false;
    if (!expectedHostnames.includes(data.hostname.toLowerCase())) return false;

    return true;
  } catch (e) {
    console.error("[turnstile] verification failed", e);
    return false;
  }
}
