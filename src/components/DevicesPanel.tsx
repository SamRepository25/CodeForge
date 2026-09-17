import { useQuery } from "@tanstack/react-query";
import { Monitor, Smartphone, Tablet, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  formatSessionDate,
  listAdminSessions,
  revokeAdminSession,
  type AdminSession,
} from "@/lib/admin-sessions";

function DeviceIcon({ type }: { type: string }) {
  if (type === "Mobile") return <Smartphone className="h-5 w-5" />;
  if (type === "Tablet") return <Tablet className="h-5 w-5" />;
  return <Monitor className="h-5 w-5" />;
}

function sessionLabel(session: AdminSession) {
  return `${session.browser} · ${session.operating_system}`;
}

export function DevicesPanel() {
  const sessions = useQuery({
    queryKey: ["admin-device-sessions"],
    queryFn: listAdminSessions,
    refetchInterval: 30_000,
  });

  const revoke = async (session: AdminSession) => {
    if (session.is_current) return;
    const confirmed = window.confirm(
      `Log out this ${session.device_type.toLowerCase()}?\n\n${sessionLabel(session)}\nLast active: ${formatSessionDate(session.last_seen_at)}`,
    );
    if (!confirmed) return;

    try {
      await revokeAdminSession(session.session_id);
      toast.success("Device logged out successfully");
      await sessions.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not log out the device.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Logged-in devices</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Active CodeForge admin sessions detected from your browsers and devices.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => void sessions.refetch()}
          disabled={sessions.isFetching}
        >
          <RefreshCw className={`mr-1.5 h-4 w-4 ${sessions.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {sessions.isLoading && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          Loading active devices…
        </div>
      )}

      {sessions.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
          Could not load active devices. {sessions.error instanceof Error ? sessions.error.message : "Please try again."}
        </div>
      )}

      {!sessions.isLoading && !sessions.isError && (sessions.data ?? []).length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No active device sessions are registered yet. Your current session will appear after the next authenticated refresh.
        </div>
      )}

      <div className="grid gap-4">
        {(sessions.data ?? []).map((session) => (
          <div
            key={session.session_id}
            className="glass rounded-2xl border border-border/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted/50 text-electric">
                  <DeviceIcon type={session.device_type} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{session.device_type}</h3>
                    {session.is_current && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                        <ShieldCheck className="h-3 w-3" /> This device
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{sessionLabel(session)}</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div>Signed in: {formatSessionDate(session.created_at)}</div>
                    <div>Last active: {formatSessionDate(session.last_seen_at)}</div>
                  </div>
                </div>
              </div>

              {session.is_current ? (
                <span className="rounded-xl border border-border/40 px-3 py-2 text-xs text-muted-foreground">
                  Current session
                </span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl text-destructive hover:text-destructive"
                  onClick={() => void revoke(session)}
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Log out
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/30 bg-muted/20 p-4 text-xs leading-5 text-muted-foreground">
        Logging out a device revokes that device's Supabase Auth session. The remote browser will be forced back through the normal authentication guard when it next checks its session, and it cannot refresh that revoked session.
      </div>
    </div>
  );
}
