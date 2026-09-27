"use server";

import { z } from "zod";
import { fail, ok, zodFieldErrors } from "@/lib/action-result";
import "@/lib/validation/locale";
import { sendEmail } from "@/services/email";
import { rateLimit, rateLimitMessage } from "@/services/security/rate-limit";
import { clientKey } from "@/services/security/request";
import { getSettings } from "@/services/settings";

const schema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(100),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  orderNumber: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10, "Bitte schreiben Sie mindestens 10 Zeichen.").max(3000),
  website: z.string().max(0).optional(), // Honeypot
});

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function contactAction(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const limit = await rateLimit(`contact:${await clientKey()}`, 5, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  const s = await getSettings();
  const to = s.store.supportEmail || s.store.email;
  if (!to) return fail("Das Kontaktformular ist noch nicht eingerichtet. Bitte versuchen Sie es später erneut.");
  const d = parsed.data;
  await sendEmail(to, {
    template: "contact",
    subject: `Kontaktanfrage von ${d.name}${d.orderNumber ? ` (${d.orderNumber})` : ""}`,
    html: `<p><strong>${esc(d.name)}</strong> &lt;${esc(d.email)}&gt;</p>${d.orderNumber ? `<p>Bestellung: ${esc(d.orderNumber)}</p>` : ""}<p style="white-space:pre-line">${esc(d.message)}</p>`,
    text: `${d.name} <${d.email}>\n${d.orderNumber ? `Bestellung: ${d.orderNumber}\n` : ""}\n${d.message}`,
  });
  return ok(undefined, "Danke für Ihre Nachricht. Wir melden uns so bald wie möglich.");
}
