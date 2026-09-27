"use server";

import { fail } from "@/lib/action-result";
import { subscribeNewsletter } from "@/services/newsletter";
import { rateLimit, rateLimitMessage } from "@/services/security/rate-limit";
import { clientKey } from "@/services/security/request";

export async function subscribeAction(email: string, source = "footer") {
  const limit = await rateLimit(`newsletter:${await clientKey()}`, 6, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  return subscribeNewsletter(String(email ?? ""), ["footer", "home", "checkout", "account"].includes(source) ? source : "footer");
}
