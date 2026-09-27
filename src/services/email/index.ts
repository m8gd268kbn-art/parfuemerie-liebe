import "server-only";
import { env } from "@/config/env";
import { db } from "@/services/db";
import { emailOutbox } from "@/services/db/schema";
import type { EmailContent } from "./templates";

/**
 * Abstrahierter E-Mail-Versand.
 * - `resend`: Versand über die Resend-API (Produktion).
 * - `outbox`: Entwicklung/Test – die Mail wird in `email_outbox` gespeichert und ist im Admin sichtbar.
 * Fehler werden nur serverseitig protokolliert; ein Mailfehler bricht keine Bestellung ab.
 */
export async function sendEmail(to: string, content: EmailContent): Promise<{ ok: boolean }> {
  const e = env();
  if (e.EMAIL_PROVIDER === "resend") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${e.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: e.EMAIL_FROM, to: [to], subject: content.subject, html: content.html, text: content.text }),
      });
      if (!res.ok) {
        console.error("[email] Resend-Fehler", res.status, await res.text().catch(() => ""));
        return { ok: false };
      }
      return { ok: true };
    } catch (error) {
      console.error("[email] Versand fehlgeschlagen", error);
      return { ok: false };
    }
  }

  await db.insert(emailOutbox).values({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    template: content.template,
    provider: "outbox",
  });
  if (e.NODE_ENV !== "test") console.info(`[email:outbox] ${content.template} → ${to}: ${content.subject}`);
  return { ok: true };
}

export function siteUrl() {
  return env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}
