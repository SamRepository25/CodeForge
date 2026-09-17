import { supabase } from "@/integrations/supabase/client";

export type AdminSession = {
  session_id: string;
  device_type: string;
  browser: string;
  operating_system: string;
  user_agent: string;
  created_at: string;
  last_seen_at: string;
  is_current: boolean;
};

const rpc = supabase.rpc as unknown as (
  fn: string,
  args?: Record<string, unknown>,
) => Promise<{ data: unknown; error: { message: string } | null }>;

function detectDeviceType(userAgent: string) {
  if (/iPad|Tablet/i.test(userAgent)) return "Tablet";
  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function detectBrowser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Brave/i.test(userAgent)) return "Brave";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Chrome\//i.test(userAgent)) return "Google Chrome";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  return "Unknown browser";
}

function detectOperatingSystem(userAgent: string) {
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/CrOS/i.test(userAgent)) return "ChromeOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown OS";
}

export async function getCurrentSessionId() {
  const { data, error } = await supabase.auth.getClaims();
  if (error) return null;
  const sessionId = data?.claims?.session_id;
  return typeof sessionId === "string" ? sessionId : null;
}

export async function registerCurrentAdminSession() {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return false;

  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const { data, error } = await rpc("admin_register_session", {
    p_session_id: sessionId,
    p_user_agent: userAgent,
    p_device_type: detectDeviceType(userAgent),
    p_browser: detectBrowser(userAgent),
    p_operating_system: detectOperatingSystem(userAgent),
  });

  return !error && data === true;
}

export async function touchCurrentAdminSession() {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return false;
  const { data, error } = await rpc("admin_touch_session", {
    p_session_id: sessionId,
  });
  return !error && data === true;
}

export async function listAdminSessions() {
  const { data, error } = await rpc("admin_list_sessions");
  if (error) throw new Error(error.message);
  return (Array.isArray(data) ? data : []) as AdminSession[];
}

export async function revokeAdminSession(sessionId: string) {
  const { data, error } = await rpc("admin_revoke_session", {
    p_session_id: sessionId,
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("The session could not be revoked.");
}

export function formatSessionDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
