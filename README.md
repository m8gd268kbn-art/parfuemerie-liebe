# Parfümerie Liebe – Online-Shop

Offizieller Online-Shop der Parfümerie Liebe in Hannover: Parfums und Nischendüfte entdecken, filtern, vergleichen und als Gast oder mit Kundenkonto bestellen. Dazu ein Admin-Bereich für Sortiment, Bestellungen und Shop-Einstellungen.

> **Stand:** funktionsfähig mit Demo-Daten. Vor dem Livegang sind echte Geschäftsdaten, Rechtstexte, Produktbilder und die Stripe-Anbindung nötig (siehe [Vor dem Livegang](#vor-dem-livegang)).

## Funktionen

- **Katalog:** Kategorien als Regeln oder manuelle Auswahl, Markenseiten, URL-basierte Filter (Marke, Zielgruppe, Duftfamilie, Konzentration, Größe, Preis, Neuheit, Angebot, verfügbar, Nische, Duftnote) und Sortierung. Tippfehlertolerante Sofortsuche (pg_trgm).
- **Produktseite:** beliebig viele Größen als Varianten mit eigenem Preis und Bestand, Grundpreis pro 100 ml, Streichpreis mit niedrigstem Preis der letzten 30 Tage (§ 11 PAngV), Duftnoten, Bewertungen mit Moderation und Kennzeichnung verifizierter Käufe, Empfehlungen.
- **Warenkorb:** Drawer und eigene Seite, Gutscheine, kostenlose Duftproben (Anzahl im Admin einstellbar), Anzeige des Betrags bis zur Versandkostenfreiheit.
- **Checkout:** fünf Schritte, Gast-Checkout, Versandzonen, Click & Collect (vorbereitet, im Admin aktivierbar), Stripe Checkout. Eine Bestellung gilt **nur nach signiertem Webhook** als bezahlt.
- **Kundenkonto:** Registrierung mit E-Mail-Bestätigung, Passwort vergessen, Bestellungen, Adressen, Profil, Wunschliste (für Gäste im Browser, beim Anmelden zusammengeführt), Konto aus Gastbestellung anlegen, Bestellung ohne Konto verfolgen.
- **Duftfinder** (sechs Fragen, regelbasiert), **Filialseite**, Service- und Rechtsseiten, Newsletter mit Double-Opt-in, Consent-Hinweis (Statistik nur nach Einwilligung).
- **Admin** (`/admin`): Dashboard, Bestellungen (Status, Sendungsnummer, Erstattung über den Zahlungsanbieter), Produkte mit Varianten, Preisverlauf und Bild-Upload, Marken, Kategorien, Duftproben, Gutscheine, Bewertungen, Newsletter (CSV-Export), Kunden, Einstellungen (Kontakt, Öffnungszeiten, Service-Leiste, Versand, Proben, Zahlarten, Click & Collect, Startseite, Rechtstexte, Social Media), E-Mail-Protokoll.
- **Design-System:** `/design-system` (intern, nicht indexiert, in Produktion nur für Admins), Dokumentation in [DESIGN.md](DESIGN.md).

## Technik

Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS 4, PostgreSQL mit Drizzle ORM (Ziel: Supabase), Stripe Checkout, E-Mail über Resend oder eine Datenbank-Outbox, Zod, Radix-Primitives, Phosphor-Icons, Vitest, Playwright.

Abweichungen vom ursprünglichen Stack-Vorschlag, mit Begründung in [PRODUCT.md](PRODUCT.md): eigene Sessions in PostgreSQL statt Supabase Auth; Formulare über Server Actions mit Zod statt React Hook Form.

```
src/
  app/            Routen: (shop), (checkout), admin, api
  components/     UI-Bausteine und Layout (Header, Footer, Service-Leiste)
  features/       Fachliche Oberflächen (Katalog, Produkt, Warenkorb, Checkout, Konto, Admin …)
  lib/            Reine Logik ohne Datenbank (Preise, Filter, Versand, Validierung) – unit-getestet
  services/       Serverseitige Dienste (DB, Auth, Katalog, Warenkorb, Bestellungen, Zahlung, E-Mail)
  config/         Umgebungsvariablen, Katalog-Stammdaten, Navigation
drizzle/          SQL-Migrationen (inkl. RLS, pg_trgm, Bestellnummern)
scripts/          Seed (Demo-Daten) und Render-Pipeline für Platzhalterbilder
tests/            unit (Vitest) und e2e (Playwright)
```

## Lokal starten

Voraussetzungen: Node.js 22, PostgreSQL 16.

```bash
npm install
cp .env.example .env.local          # Werte eintragen (siehe unten)
createdb liebe                      # oder eine Supabase-Datenbank verwenden
npm run db:migrate                  # Migrationen aus drizzle/
npm run db:reset                    # Demo-Katalog, Einstellungen, erster Admin
npm run dev                         # http://localhost:3000
```

Admin-Anmeldung über `/anmelden` mit `SEED_ADMIN_EMAIL` und `SEED_ADMIN_PASSWORD` (mindestens 12 Zeichen). Nicht angemeldete Personen und Kundinnen/Kunden erhalten unter `/admin` eine 404-Seite; die Rechte werden in jedem Layout und jeder Server Action serverseitig geprüft.

`npm run db:reset` leert alle Shop-Tabellen und ist in Produktion gesperrt. Das Skript leert auch den lokalen Next.js-Datencache; einen laufenden Server danach neu starten.

### Umgebungsvariablen

Alle Variablen stehen mit Erklärung in [.env.example](.env.example). Geheimnisse gehören nur in `.env.local` bzw. die Umgebung der Hosting-Plattform, nie ins Repository.

| Variable | Zweck |
|---|---|
| `DATABASE_URL` | PostgreSQL-Verbindung. Supabase: Session-Pooler (Port 5432) für Migrationen, Transaction-Pooler (6543) für die App |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche Adresse (Canonicals, E-Mail-Links, Stripe-Rücksprung) |
| `PAYMENT_PROVIDER` | `stripe` im Livebetrieb, `test` nur für Entwicklung und E2E (in Produktion gesperrt, außer `ALLOW_TEST_PAYMENTS=true` für lokale E2E-Läufe) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe-API und Signaturprüfung der Webhooks |
| `TEST_PAYMENT_SECRET` | HMAC-Schlüssel des Test-Zahlungsanbieters |
| `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM` | `resend` versendet, `outbox` protokolliert nur (Admin → E-Mail-Protokoll) |
| `STORAGE_PROVIDER`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` | Bild-Uploads: `local` (nur Entwicklung) oder Supabase Storage |
| `CRON_SECRET` | Schützt `/api/cron/maintenance` |
| `NEXT_PUBLIC_DEMO_MODE` | Blendet den Hinweis „Demo-Daten“ ein |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional: Plausible, lädt erst nach Einwilligung |

## Tests und Qualität

```bash
npm run typecheck
npm run lint
npm test                            # Vitest: Preise, Gutscheine, Filter, § 11 PAngV, Duftfinder, Webhook-Signaturen
npm run build
npm run start &                     # Produktions-Build mit PAYMENT_PROVIDER=test und ALLOW_TEST_PAYMENTS=true
BASE_URL=http://localhost:3000 npm run test:e2e
```

Der E2E-Test kauft als Gast (Suche, Filter, Größe, Wunschliste, Warenkorb, Kasse, Testzahlung), prüft die Bestätigung per signiertem Webhook, meldet sich danach als Admin an, setzt die Bestellung auf „Versendet“ (Versandmail im Protokoll) und ändert einen Variantenpreis mit sofortiger Wirkung im Shop. Er setzt frische Demo-Daten voraus (`npm run db:reset`).

## Deployment (Vercel + Supabase + Stripe + Resend)

1. **Supabase:** Projekt anlegen, Connection-Strings kopieren. Migrationen gegen den Session-Pooler ausführen: `DATABASE_URL=… npm run db:migrate`. Die Migration aktiviert RLS auf allen Tabellen und entzieht den Rollen `anon` und `authenticated` jeden Zugriff; der Shop greift nur serverseitig zu. Storage: öffentlichen Bucket `product-images` anlegen.
2. **Erster Admin:** `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` setzen und `npm run db:seed` einmalig ausführen. Demo-Produkte danach im Admin löschen (Filter „Demo-Daten“) oder ohne Seed starten und nur den Admin anlegen.
3. **Stripe:** Secret Key hinterlegen. Webhook-Endpunkt `https://<domain>/api/webhooks/stripe` mit den Ereignissen `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded` anlegen und das Signing Secret als `STRIPE_WEBHOOK_SECRET` setzen. Zahlarten im Stripe-Dashboard freischalten und erst danach im Admin unter Einstellungen → Zahlarten aktivieren.
4. **Resend:** Absenderdomain verifizieren, `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` setzen.
5. **Vercel:** Repository verbinden, alle Variablen setzen (`PAYMENT_PROVIDER=stripe`, `STORAGE_PROVIDER=supabase`, `NEXT_PUBLIC_DEMO_MODE=false`, `CRON_SECRET`). [vercel.json](vercel.json) ruft die Wartung täglich auf; auf einem Pro-Plan kann der Takt auf 15 Minuten erhöht werden. Abgelaufene Reservierungen werden zusätzlich bei jeder neuen Bestellung und über `checkout.session.expired` freigegeben.

## Sicherheit

- Preise, Rabatte, Versandkosten und Bestand werden ausschließlich serverseitig berechnet; der Client schickt nur Varianten-IDs und Mengen.
- Bestand wird beim Bestellen atomar reserviert (35 Minuten) und bei Abbruch, Ablauf oder Fehlschlag wieder freigegeben.
- Zahlungen: Stripe Checkout (keine Kartendaten im System), Bestätigung nur per signiertem Webhook, Idempotenz über gespeicherte Ereignis-IDs, Betrag und Währung werden geprüft. Erstattungen laufen über die Stripe-API; der Status folgt dem Webhook.
- Sessions: zufällige Tokens, in der Datenbank nur als SHA-256-Hash, Cookie `HttpOnly`, `SameSite=Lax`, `Secure` in Produktion. Passwörter mit Argon2id. Rate-Limits für Anmeldung, Registrierung, Passwort-Reset, Kontakt, Newsletter, Bewertungen, Gutscheine, Suche, Bestellabfrage und Bestellungen. Anmeldung und Passwort-Reset verraten nicht, ob eine E-Mail-Adresse registriert ist (gleiche Antwort, Dummy-Hash gegen Zeitmessung); die Registrierung nennt eine vergebene Adresse bewusst, damit Kundinnen und Kunden zur Anmeldung finden.
- Admin-Rechte werden in jedem Admin-Layout, jeder Server Action und jedem Admin-Endpunkt geprüft. Server Actions sind durch Next.js gegen CSRF geschützt (Origin-Prüfung).
- Uploads: Prüfung der Dateisignatur (JPG, PNG, WebP, AVIF), höchstens 5 MB, zufällige Dateinamen.
- Sicherheits-Header (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS in Produktion), `noindex` für Admin und Design-System, CSV-Export gegen Formel-Injection geschützt.

## Vor dem Livegang

Offen und bewusst **nicht erfunden** (Details in [PRODUCT.md](PRODUCT.md) und [docs/FORTSCHRITT.md](docs/FORTSCHRITT.md)):

- [ ] Geschäftsdaten prüfen: Anschrift, Telefon, E-Mail, Firmierung, Gründung, Geschichte, Filialen und Social-Media-Links sind aus öffentlichen Quellen vorbelegt (Quellen in PRODUCT.md) und vom Inhaber zu bestätigen. Noch einzutragen: Öffnungszeiten, Anschrift Göttingen, USt-IdNr., Services vor Ort, Anfahrt, Kartenlink.
- [ ] Markenauftritt der bestehenden Website liebe-hannover.de übernehmen (Logo, Farben, Schriften, Bildsprache): Vorlagen fehlen noch, weil die Seite aus der Build-Umgebung gesperrt war.
- [ ] **Rechtstexte** (Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung mit Muster-Widerrufsformular) professionell erstellen oder prüfen lassen und im Admin einfügen.
- [ ] Sortiment, Preise und Bestände erfassen; Demo-Produkte löschen; `NEXT_PUBLIC_DEMO_MODE=false`.
- [ ] Produktbilder mit Nutzungsrecht, Foto der Parfümerie, ggf. Logo (siehe [docs/MEDIA.md](docs/MEDIA.md)).
- [ ] Stripe-Konto verifizieren, Zahlarten freischalten und im Admin aktivieren.
- [ ] Versandkosten, Versandfreigrenze, Proben und Click & Collect prüfen und einstellen.
- [ ] Datenschutz: Auftragsverarbeitungsverträge (Supabase, Vercel, Stripe, Resend, ggf. Plausible), Speicherorte in der EU wählen.
- [ ] Domain, Absender-E-Mail, `NEXT_PUBLIC_SITE_URL`.
