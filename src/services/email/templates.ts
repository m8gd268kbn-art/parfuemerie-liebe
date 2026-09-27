import "server-only";
import { formatDate, formatPrice } from "@/lib/format";

/**
 * E-Mail-Vorlagen im Stil der Parfümerie Liebe: Porzellangrund, Anthrazit, Flakongrün,
 * Bodoni-Wortmarke (mit Georgia als Fallback in Mailprogrammen). Tabellenlayout + Inline-Styles.
 */

export type EmailContent = { subject: string; html: string; text: string; template: string };

const C = {
  paper: "#fafaf7",
  white: "#ffffff",
  ink: "#1b1e1f",
  soft: "#3e4244",
  muted: "#67635c",
  line: "#e3e0d9",
  accent: "#1f3f36",
};

function esc(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(opts: { preheader: string; heading: string; body: string; siteUrl: string; footerNote?: string }) {
  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 0 32px;text-align:center;">
<a href="${opts.siteUrl}" style="font-family:'Bodoni Moda',Didot,'Bodoni 72',Georgia,serif;font-size:20px;letter-spacing:0.12em;color:${C.ink};text-decoration:none;">PARFÜMERIE LIEBE</a>
</td></tr>
<tr><td style="background:${C.white};border:1px solid ${C.line};padding:40px 36px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${C.ink};font-size:15px;line-height:1.6;">
<h1 style="margin:0 0 20px;font-family:'Bodoni Moda',Didot,Georgia,serif;font-weight:400;font-size:26px;line-height:1.2;color:${C.ink};">${esc(opts.heading)}</h1>
${opts.body}
</td></tr>
<tr><td style="padding:24px 8px 0;text-align:center;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${C.muted};">
${opts.footerNote ? `${esc(opts.footerNote)}<br>` : ""}Parfümerie Liebe, Hannover · <a href="${opts.siteUrl}/impressum" style="color:${C.muted};">Impressum</a> · <a href="${opts.siteUrl}/datenschutz" style="color:${C.muted};">Datenschutz</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td style="background:${C.accent};border-radius:2px;">
<a href="${href}" style="display:inline-block;padding:14px 26px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${esc(label)}</a>
</td></tr></table>`;
}

function p(text: string) {
  return `<p style="margin:0 0 14px;">${text}</p>`;
}

function small(text: string) {
  return `<p style="margin:16px 0 0;font-size:13px;color:${C.muted};">${text}</p>`;
}

export function verifyEmailTemplate(siteUrl: string, name: string, link: string): EmailContent {
  const heading = "Bitte bestätigen Sie Ihre E-Mail-Adresse";
  return {
    template: "verify_email",
    subject: "E-Mail-Adresse bestätigen · Parfümerie Liebe",
    html: layout({
      siteUrl,
      preheader: "Ein Klick, dann ist Ihr Kundenkonto vollständig.",
      heading,
      body:
        p(`Guten Tag ${esc(name)},`) +
        p("vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, damit wir Sie zuverlässig erreichen.") +
        button(link, "E-Mail bestätigen") +
        small("Der Link ist 24 Stunden gültig. Wenn Sie kein Konto angelegt haben, können Sie diese E-Mail ignorieren."),
    }),
    text: `${heading}\n\nGuten Tag ${name},\n\nbitte bestätigen Sie Ihre E-Mail-Adresse:\n${link}\n\nDer Link ist 24 Stunden gültig.`,
  };
}

export function passwordResetTemplate(siteUrl: string, link: string): EmailContent {
  const heading = "Passwort zurücksetzen";
  return {
    template: "reset_password",
    subject: "Passwort zurücksetzen · Parfümerie Liebe",
    html: layout({
      siteUrl,
      preheader: "Legen Sie ein neues Passwort für Ihr Kundenkonto fest.",
      heading,
      body:
        p("Sie haben angefordert, Ihr Passwort zurückzusetzen. Über den folgenden Link legen Sie ein neues Passwort fest.") +
        button(link, "Neues Passwort festlegen") +
        small("Der Link ist 60 Minuten gültig. Wenn Sie das nicht angefordert haben, bleibt Ihr Passwort unverändert."),
    }),
    text: `${heading}\n\nNeues Passwort festlegen:\n${link}\n\nDer Link ist 60 Minuten gültig.`,
  };
}

export function newsletterConfirmTemplate(siteUrl: string, link: string): EmailContent {
  const heading = "Bitte bestätigen Sie Ihre Anmeldung";
  return {
    template: "newsletter_confirm",
    subject: "Newsletter-Anmeldung bestätigen · Parfümerie Liebe",
    html: layout({
      siteUrl,
      preheader: "Erst nach Ihrer Bestätigung senden wir Ihnen den Newsletter.",
      heading,
      body:
        p("Sie möchten den Newsletter der Parfümerie Liebe erhalten. Bitte bestätigen Sie Ihre Anmeldung.") +
        button(link, "Anmeldung bestätigen") +
        small("Ohne Bestätigung erhalten Sie keine Newsletter. Sie können sich jederzeit wieder abmelden."),
    }),
    text: `${heading}\n\nAnmeldung bestätigen:\n${link}`,
  };
}

export type OrderEmailData = {
  number: string;
  email: string;
  firstName: string;
  createdAt: Date | string;
  items: { brandName: string; productName: string; displaySize: string; quantity: number; lineTotalCents: number }[];
  samples: string[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  taxCents: number;
  paymentMethodLabel: string;
  addressLines: string[];
  fulfillmentLabel: string;
  statusUrl: string;
};

function orderTable(o: OrderEmailData) {
  const rows = o.items
    .map(
      (i) => `<tr>
<td style="padding:12px 0;border-bottom:1px solid ${C.line};vertical-align:top;">
<span style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${esc(i.brandName)}</span><br>
${esc(i.productName)}<br><span style="color:${C.muted};font-size:13px;">${esc(i.displaySize)} · Menge ${i.quantity}</span></td>
<td style="padding:12px 0;border-bottom:1px solid ${C.line};text-align:right;vertical-align:top;white-space:nowrap;">${formatPrice(i.lineTotalCents)}</td></tr>`,
    )
    .join("");
  const line = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:6px 0;${strong ? "font-weight:600;" : `color:${C.soft};`}">${label}</td><td style="padding:6px 0;text-align:right;white-space:nowrap;${strong ? "font-weight:600;" : ""}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;font-size:14px;">${rows}
${line("Zwischensumme", formatPrice(o.subtotalCents))}
${o.discountCents ? line("Rabatt", `-${formatPrice(o.discountCents)}`) : ""}
${line("Versand", o.shippingCents ? formatPrice(o.shippingCents) : "kostenlos")}
${line("Gesamt", formatPrice(o.totalCents), true)}
<tr><td colspan="2" style="padding:2px 0;color:${C.muted};font-size:12px;">inkl. ${formatPrice(o.taxCents)} MwSt.</td></tr>
</table>`;
}

export function orderConfirmationTemplate(siteUrl: string, o: OrderEmailData): EmailContent {
  const heading = "Vielen Dank für Ihre Bestellung";
  const samples = o.samples.length ? p(`<strong>Ihre Duftproben:</strong> ${o.samples.map(esc).join(", ")}`) : "";
  return {
    template: "order_confirmation",
    subject: `Bestellbestätigung ${o.number} · Parfümerie Liebe`,
    html: layout({
      siteUrl,
      preheader: `Bestellung ${o.number} vom ${formatDate(o.createdAt)} ist bei uns eingegangen und bezahlt.`,
      heading,
      body:
        p(`Guten Tag ${esc(o.firstName)},`) +
        p(`Ihre Zahlung ist eingegangen. Ihre Bestellung <strong>${esc(o.number)}</strong> vom ${formatDate(o.createdAt)} wird jetzt vorbereitet.`) +
        orderTable(o) +
        samples +
        p(`<strong>${esc(o.fulfillmentLabel)}</strong><br>${o.addressLines.map(esc).join("<br>")}`) +
        p(`<strong>Zahlungsart</strong><br>${esc(o.paymentMethodLabel)}`) +
        button(o.statusUrl, "Bestellstatus ansehen") +
        small("Ihre Rechnung und die Widerrufsbelehrung finden Sie in Ihrem Kundenkonto bzw. über den Link zum Bestellstatus."),
    }),
    text: `${heading}\n\nBestellung ${o.number} ist bezahlt und wird vorbereitet.\n\n${o.items
      .map((i) => `${i.quantity} × ${i.brandName} ${i.productName} (${i.displaySize}) ${formatPrice(i.lineTotalCents)}`)
      .join("\n")}\n\nGesamt: ${formatPrice(o.totalCents)} (inkl. ${formatPrice(o.taxCents)} MwSt.)\n\nStatus: ${o.statusUrl}`,
  };
}

export function shippingConfirmationTemplate(
  siteUrl: string,
  o: { number: string; firstName: string; carrier: string | null; trackingNumber: string | null; trackingUrl: string | null; statusUrl: string },
): EmailContent {
  const heading = "Ihre Bestellung ist unterwegs";
  const tracking = o.trackingNumber
    ? p(`<strong>Sendungsnummer</strong><br>${esc(o.carrier ? `${o.carrier}: ` : "")}${esc(o.trackingNumber)}`)
    : "";
  return {
    template: "shipping_confirmation",
    subject: `Ihre Bestellung ${o.number} wurde versendet · Parfümerie Liebe`,
    html: layout({
      siteUrl,
      preheader: `Bestellung ${o.number} hat unser Haus verlassen.`,
      heading,
      body:
        p(`Guten Tag ${esc(o.firstName)},`) +
        p(`Ihre Bestellung <strong>${esc(o.number)}</strong> wurde an den Versanddienstleister übergeben.`) +
        tracking +
        button(o.trackingUrl ?? o.statusUrl, o.trackingUrl ? "Sendung verfolgen" : "Bestellstatus ansehen"),
    }),
    text: `${heading}\n\nBestellung ${o.number} wurde versendet.${o.trackingNumber ? `\nSendungsnummer: ${o.trackingNumber}` : ""}\n${o.trackingUrl ?? o.statusUrl}`,
  };
}

export function orderCancelledTemplate(siteUrl: string, o: { number: string; firstName: string; paid: boolean }): EmailContent {
  const heading = "Ihre Bestellung wurde storniert";
  return {
    template: "order_cancelled",
    subject: `Stornierung ${o.number} · Parfümerie Liebe`,
    html: layout({
      siteUrl,
      preheader: `Bestellung ${o.number} wurde storniert.`,
      heading,
      body:
        p(`Guten Tag ${esc(o.firstName)},`) +
        p(`Ihre Bestellung <strong>${esc(o.number)}</strong> wurde storniert.`) +
        p(
          o.paid
            ? "Den bereits gezahlten Betrag erstatten wir über die ursprüngliche Zahlungsart. Sie erhalten eine separate Nachricht, sobald die Erstattung veranlasst ist."
            : "Es wurde keine Zahlung eingezogen.",
        ) +
        small("Bei Fragen antworten Sie einfach auf diese E-Mail."),
    }),
    text: `${heading}\n\nBestellung ${o.number} wurde storniert.`,
  };
}

export function refundTemplate(siteUrl: string, o: { number: string; firstName: string; amountCents: number; partial: boolean }): EmailContent {
  const heading = o.partial ? "Teilerstattung veranlasst" : "Erstattung veranlasst";
  return {
    template: "refund",
    subject: `${heading} für ${o.number} · Parfümerie Liebe`,
    html: layout({
      siteUrl,
      preheader: `${formatPrice(o.amountCents)} für Bestellung ${o.number}.`,
      heading,
      body:
        p(`Guten Tag ${esc(o.firstName)},`) +
        p(`für Ihre Bestellung <strong>${esc(o.number)}</strong> haben wir ${formatPrice(o.amountCents)} erstattet.`) +
        p("Je nach Zahlungsart ist der Betrag in wenigen Werktagen auf Ihrem Konto sichtbar."),
    }),
    text: `${heading}\n\n${formatPrice(o.amountCents)} für Bestellung ${o.number} erstattet.`,
  };
}
