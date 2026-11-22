import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage, renderMaintenancePage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const maintenanceSettingKey = "site.maintenance_mode";

function isAdminOrAuthPath(pathname: string) {
  return /^\/(?:auth|mfa-setup|mfa-verify|forgot-password|reset-password|dashboard|admin)(?:\/|$)/.test(
    pathname,
  );
}

const maintenanceMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (request.method !== "GET" || !request.headers.get("accept")?.includes("text/html")) {
    return next();
  }

  const pathname = new URL(request.url).pathname;
  if (isAdminOrAuthPath(pathname)) return next();

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", maintenanceSettingKey)
      .maybeSingle();
    if (error) throw error;
    if (data?.value === "true") {
      return new Response(renderMaintenancePage(), {
        status: 503,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "retry-after": "300",
        },
      });
    }
  } catch (error) {
    console.error("Unable to check CodeForge maintenance mode", error);
  }

  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [maintenanceMiddleware, errorMiddleware],
}));
