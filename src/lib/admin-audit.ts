import { supabase } from "@/integrations/supabase/client";

export async function recordAdminAudit(
  action: string,
  resource: string,
  resourceId?: string,
): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!accessToken || !url || !key) return;

  try {
    await fetch(`${url}/rest/v1/admin_audit_log`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        actor_id: data.session?.user.id,
        action: action.slice(0, 64),
        resource: resource.slice(0, 64),
        resource_id: resourceId?.slice(0, 200) ?? null,
      }),
    });
  } catch {
    // Audit recording must never break the primary admin action.
  }
}

export type AdminAuditEntry = {
  id: string;
  actor_id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  created_at: string;
};

export async function getAdminAuditEntries(limit = 100): Promise<AdminAuditEntry[]> {
  const { data, error } = await supabase
    .from("admin_audit_log" as never)
    .select("id,actor_id,action,resource,resource_id,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AdminAuditEntry[];
}
