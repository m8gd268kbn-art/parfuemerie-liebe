import { expect, test } from "@playwright/test";

/**
 * Vollständiger Kauf als Gast: Startseite → Suche → Filter → Produkt → Größe → Wunschliste →
 * Warenkorb → Kasse → Testzahlung → Webhook → Bestätigung.
 * Voraussetzung: Demo-Seed und PAYMENT_PROVIDER=test.
 */
test("Gastkauf mit Testzahlung und Webhook-Bestätigung", async ({ page }) => {
  await page.context().addCookies([
    { name: "pl_consent", value: encodeURIComponent(JSON.stringify({ v: 1, necessary: true, analytics: false, marketing: false, ts: "e2e" })), url: page.context()["_options"]?.baseURL ?? "http://localhost:3000" },
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
  const orderNumber = (await page.locator("dd").first().textContent())?.trim();
  expect(orderNumber).toMatch(/^PL-\d+$/);
  await page.getByRole("button", { name: "Zahlung erfolgreich" }).click();

  // 13.–15. Webhook bestätigt → Bestätigungsseite
  await expect(page).toHaveURL(/\/kasse\/bestaetigung\//);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Vielen Dank, Mara");
  await expect(page.getByText(orderNumber!)).toBeVisible();

  test.info().annotations.push({ type: "order", description: orderNumber! });
});
