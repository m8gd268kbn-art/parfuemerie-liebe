import { expect, test } from "@playwright/test";

/**
 * Vollständiger Kauf als Gast: Startseite → Suche → Filter → Produkt → Größe → Wunschliste →
 * Warenkorb → Kasse → Testzahlung → Webhook → Bestätigung.
 * Voraussetzung: Demo-Seed und PAYMENT_PROVIDER=test.
 */
test.describe.configure({ mode: "serial" });

let orderNumber = "";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@parfuemerie-liebe.test";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin-Passwort-2026";

test("Gastkauf mit Testzahlung und Webhook-Bestätigung", async ({ page, baseURL }) => {
  await page.context().addCookies([
    { name: "pl_consent", value: encodeURIComponent(JSON.stringify({ v: 1, necessary: true, analytics: false, marketing: false, ts: "e2e" })), url: baseURL! },
  ]);

  // 1. Startseite
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // 2. Suche (Overlay, Instant-Ergebnisse)
  await page.getByRole("button", { name: "Suche öffnen" }).first().click();
  await page.getByLabel("Suchbegriff").fill("bergamot");
  await expect(page.getByRole("link", { name: /Sauvage/ }).first()).toBeVisible();
  await page.getByLabel("Suchbegriff").press("Enter");
  await expect(page).toHaveURL(/\/suche\?q=bergamot/);

  // 3. Filter anwenden (URL-basiert)
  await page.goto("/herren");
  await page.getByRole("checkbox", { name: /Aromatisch/ }).click();
  await expect(page).toHaveURL(/family=aromatic/);

  // 4. Produkt öffnen
  await page.goto("/produkt/dior-sauvage-eau-de-toilette");
  await expect(page.getByRole("heading", { level: 1, name: "Sauvage" })).toBeVisible();

  // 5. Größe wählen (100 ml ist ausverkauft, 200 ml verfügbar)
  await expect(page.getByText("ausverkauft", { exact: true })).toBeVisible();
  await page.getByText("200 ml", { exact: true }).first().click();
  await expect(page.getByText("Auf Lager", { exact: false })).toBeVisible();

  // 6. Wunschliste
  await page.getByRole("button", { name: /Sauvage auf die Wunschliste/ }).first().click();
  await expect(page.getByRole("button", { name: /Sauvage von der Wunschliste entfernen/ }).first()).toBeVisible();

  // 7./8. In den Warenkorb, Drawer öffnet sich
  await page.getByRole("button", { name: "In den Warenkorb", exact: true }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("Sauvage")).toBeVisible();
  await expect(drawer.getByText("200 ml", { exact: false })).toBeVisible();

  // 9. Kasse
  await drawer.getByRole("link", { name: "Zur Kasse" }).click();
  await expect(page).toHaveURL(/\/kasse$/);

  // 10. Gastdaten
  await page.getByLabel("E-Mail-Adresse").fill("e2e-gast@example.com");
  await page.getByRole("button", { name: "Weiter zur Lieferadresse" }).click();
  await page.getByLabel("Vorname").fill("Mara");
  await page.getByLabel("Nachname").fill("Testkundin");
  await page.getByLabel("Straße").fill("Musterweg");
  await page.getByLabel("Nr.").fill("12");
  await page.getByLabel("PLZ").fill("30159");
  await page.getByLabel("Ort").fill("Hannover");
  await page.getByRole("button", { name: "Weiter zur Versandart" }).click();

  // 11. Versand
  await expect(page.getByText("Standardversand")).toBeVisible();
  await page.getByRole("button", { name: "Weiter zur Zahlung" }).click();
  await page.getByRole("button", { name: "Weiter zur Übersicht" }).click();
  await page.getByText("Ich habe die").click();
  await page.getByRole("button", { name: "Zahlungspflichtig bestellen" }).click();

  // 12. Testzahlung
  await expect(page).toHaveURL(/\/kasse\/testzahlung\//);
  orderNumber = (await page.locator("dd").first().textContent())?.trim() ?? "";
  expect(orderNumber).toMatch(/^PL-\d+$/);
  await page.getByRole("button", { name: "Zahlung erfolgreich" }).click();

  // 13.–15. Webhook bestätigt → Bestätigungsseite
  await expect(page).toHaveURL(/\/kasse\/bestaetigung\//);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Vielen Dank, Mara");
  await expect(page.getByText(orderNumber)).toBeVisible();

  test.info().annotations.push({ type: "order", description: orderNumber });
});

/**
 * Admin: Zugriffsschutz, Statuswechsel der eben bezahlten Bestellung mit Versandmail,
 * Preisänderung einer Variante mit Wirkung im Shop.
 */
test("Admin: Statuswechsel, Versandmail und Preisänderung", async ({ page, baseURL }) => {
  expect(orderNumber, "setzt den Gastkauf-Test voraus").not.toBe("");
  await page.context().addCookies([
    { name: "pl_consent", value: encodeURIComponent(JSON.stringify({ v: 1, necessary: true, analytics: false, marketing: false, ts: "e2e" })), url: baseURL! },
  ]);

  // Ohne Anmeldung existiert der Admin-Bereich nicht (404, kein Hinweis auf seine Existenz).
  const anon = await page.request.get("/admin");
  expect(anon.status()).toBe(404);

  // Anmeldung als Admin leitet ins Dashboard.
  await page.goto("/anmelden");
  const main = page.getByRole("main");
  await main.getByLabel("E-Mail-Adresse").fill(ADMIN_EMAIL);
  await main.getByLabel("Passwort", { exact: true }).fill(ADMIN_PASSWORD);
  await main.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();

  // Bestellung öffnen: per Webhook bezahlt.
  await page.goto(`/admin/bestellungen?q=${orderNumber}`);
  await page.getByRole("link", { name: orderNumber }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(orderNumber);
  await expect(page.getByText("Bezahlt").first()).toBeVisible();

  // Status: versendet mit Sendungsnummer → Versandmail im Protokoll.
  await page.getByLabel("Neuer Status").selectOption("shipped");
  await page.getByLabel("Sendungsnummer").first().fill("00340434161234567890");
  await page.getByRole("button", { name: "Status setzen" }).click();
  await expect(page.getByText("Versendet").first()).toBeVisible();
  await page.goto("/admin/emails");
  await expect(page.getByRole("row", { name: /e2e-gast@example\.com.*Versandbestätigung/ }).first()).toBeVisible();

  // Preisänderung einer Variante wirkt sofort im Shop (Cache-Invalidierung).
  await page.goto("/admin/produkte?q=Sauvage");
  await page.getByRole("link", { name: "Sauvage" }).first().click();
  const variant = page.locator("form").filter({ has: page.locator('input[name="sizeMl"][value="200"]') });
  const priceInput = variant.getByLabel("Preis in €", { exact: true });
  const oldPrice = await priceInput.inputValue();
  // Neuer Preis = alter Preis + 1 €, damit der Test unabhängig vom Ausgangswert wirkt.
  const newCents = Math.round(Number(oldPrice.replace(/\./g, "").replace(",", ".")) * 100) + 100;
  const newPrice = (newCents / 100).toFixed(2).replace(".", ",");
  await priceInput.fill(newPrice);
  await variant.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Variante gespeichert.")).toBeVisible();
  await page.goto("/produkt/dior-sauvage-eau-de-toilette");
  await page.getByText("200 ml", { exact: true }).first().click();
  await expect(page.getByText(`${newPrice} €`).first()).toBeVisible();

  // Zurücksetzen, damit der Demo-Katalog unverändert bleibt.
  await page.goto("/admin/produkte?q=Sauvage");
  await page.getByRole("link", { name: "Sauvage" }).first().click();
  await variant.getByLabel("Preis in €", { exact: true }).fill(oldPrice);
  await variant.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Variante gespeichert.")).toBeVisible();
});
