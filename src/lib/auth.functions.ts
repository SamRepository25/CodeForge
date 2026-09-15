import { createServerFn } from "@tanstack/react-start";
import { getClientIp, verifyTurnstile } from "@/lib/turnstile.server";

export const verifyLoginTurnstile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object" || !("token" in data)) {
      throw new Error("Invalid Turnstile verification request.");
    }
    const token = (data as { token: unknown }).token;
    if (typeof token !== "string") {
      throw new Error("Invalid Turnstile token.");
    }
    return { token };
  })
  .handler(async ({ data }) => {
    const verified = await verifyTurnstile(data.token, getClientIp());
    if (!verified) throw new Error("Human verification failed. Please try again.");
    return { success: true };
  });
