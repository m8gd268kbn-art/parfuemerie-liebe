# Fortschritt & Übergabe – Online-Shop Parfümerie Liebe

> Stand: 27.09.2026, Master-Prompt technisch umgesetzt; offen sind nur Geschäftsdaten und Inhalte des Inhabers.
> Nächste Session: diese Datei zuerst lesen und beim Abschnitt „Nächster Schritt“ weitermachen.
> Auftrag: der „MASTER PROMPT – PARFÜMERIE LIEBE HANNOVER“ (107 Punkte) aus der ersten Session.

## Erledigt

1. **Design-Skills installiert** (`.claude/skills/`): impeccable, emil-design-eng, review-animations, taste-skill. Impeccable-Launcher funktioniert (`.claude/skills/impeccable/scripts/impeccable context`).
2. **Phase 1 – Analyse:** Repo enthielt keine Assets der Parfümerie Liebe (kein Logo, keine Farben, Fotos, Texte). Alle Skills gelesen (Impeccable SKILL/craft-floor/new-work/init, Taste, Emil).
3. **PRODUCT.md** geschrieben (Produktwahrheit aus dem Briefing, offene Punkte markiert).
4. **Impeccable-Richtung** per `concept-seed` (Seed `86f74b39`, Roll „degraded“, da impeccable.style aus dem Container gesperrt ist) → Kandidat 3: **„Flakon und Licht“**. Direction contract: `.impeccable/surfaces/src-app-page-tsx.md`. Build path: code-led (keine Bildgenerierung).
5. **Next.js 16.3.6 Grundgerüst** (App Router, TS, Tailwind v4, `src/`), Abhängigkeiten installiert (siehe package.json).
6. **Design-Tokens** in `src/app/globals.css` (Farben, Typo-Skala, Radius, Schatten, Motion, Z-Index, Utilities `label`, `numeric`, `container-page`, `press`, …).
7. **Datenmodell** `src/services/db/schema.ts` (Drizzle): Marken, Kategorien (Regeln), Produkte, Varianten (beliebige Größen, Bestand pro Variante), Preisverlauf (§ 11 PAngV), Bilder, Nutzer, Sessions, Auth-Tokens, Adressen, Wunschliste, Proben, Warenkorb, Gutscheine, Bestellungen, Positionen, Events, Zahlungen, Webhook-Idempotenz, Bewertungen, Newsletter, Shop-Einstellungen (JSONB), Rate Limits, E-Mail-Outbox. **Noch nicht migriert.**

## Getroffene Entscheidungen

- **Stack:** Next.js 16 (ohne `cacheComponents`, Caching über `unstable_cache` + Tags; `revalidateTag(tag, 'max')`), Drizzle + postgres.js, Supabase als Postgres-/Storage-Ziel, eigene DB-Sessions (argon2 via `@node-rs/argon2`) statt Supabase Auth (lokal ohne Docker testbar), Stripe Checkout (gehostet) + Test-Zahlungsanbieter mit signiertem Webhook für Entwicklung/E2E, E-Mail-Provider abstrahiert (Resend / DB-Outbox), Zod, React Hook Form, Radix-Primitives, Phosphor-Icons (weight „light“), Sonner-Toasts. Keine Motion-Library: CSS-Transitions/@starting-style/WAAPI.
- **Next 16 Besonderheiten:** `middleware` heißt jetzt `proxy.ts`; `params`/`searchParams`/`cookies()` sind async; Doku liegt in `node_modules/next/dist/docs/`.
- **Design-DNA „Flakon und Licht“:** Grund `paper #fafaf7`, Tinte `ink #1b1e1f`, Akzent Flakongrün `#1f3f36`, Muted `#67635c`, Haarlinien `#e3e0d9`, Feldränder `#8c877e`. Farbe nur aus Duftfamilien-Flüssigkeiten (`--color-liquid-*`) in Bildern/Notenschichten. Schriften: **Bodoni Moda** (Display, `--font-bodoni`) + **Mona Sans** (UI, `--font-mona`, Breitenachse für Etikett-Labels) via `next/font/google`. Radius 2px für Controls/Panels, Medien 0, rund nur Icon-Buttons. Schatten nur Overlays. Motion nach Emil (ease-out `cubic-bezier(0.23,1,0.32,1)`, 140–380 ms). Nur Light-Theme (Briefing-Palette). Keine Eyebrows, keine Em-Dashes im UI (Taste), Anrede „Sie“.
- **Signature Interaction:** Größenwahl als Flakon-Silhouetten mit Füllstand; Duftnoten als Flüssigkeitsschichten (Kopf/Herz/Basis).
- **Produktbilder:** keine fremden Bilder; geplant: Flakon-Renderings mit three.js in headless Chromium (Glas mit Transmission, Flüssigkeit in Duftfarbe) → WebP, als Demo-Platzhalter gekennzeichnet. Fotos der Parfümerie = markierte Platzhalter.
- **Demo-Daten:** echte Marken/Düfte, klar als Demo markiert (`isDemo`), keine Bewertungen/Claims erfinden.

## Umgebung (Cloud-Container)

- PostgreSQL 16 ist installiert, muss je Session gestartet werden: `service postgresql start`.
- Playwright **1.56.1** passt zum vorinstallierten Chromium (`/opt/pw-browsers/chromium-1194`). Nicht `playwright install` ausführen.
- Gesperrt: api.stripe.com, Unsplash/Pexels, jsdelivr. Erreichbar: npm-Registry, Google Fonts.

## Stand 27.09. (Session 2)

Fertig: Env (`src/config/env.ts`), DB-Client (lazy), Migrationen `drizzle/` (RLS, pg_trgm, Bestellnummern-Sequenz), Services in `src/services/*` (auth, session, settings, catalog, search, cart, coupons, orders inkl. atomarer Reservierung, payments Stripe+Test mit signiertem Webhook, email Resend/Outbox, newsletter DOI, wishlist, storage, rate-limit), reine Logik `src/lib/*` (filters, pricing, shipping, order-status, format, settings-schema, validation), Seed (`npm run db:reset`, 26 Demo-Produkte), Render-Pipeline `scripts/render-bottles.ts` (three.js, `npm run images:render`), UI-Basis `src/components/ui/*`, Layout (Service-Bar, Header, Mobile-Menü, Footer, Consent, Toaster, Demo-Banner), Shop-State (`src/features/shop/shop-provider.tsx`, `/api/me`), Cart-Drawer, Such-Overlay (`/api/search`), ProductCard, ProductRail.

Admin-Login (lokal): siehe `.env.local` (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).

## Stand 27.09. (Session 3)

Fertig: kompletter Admin (`src/app/admin/*`): Dashboard, Bestellungen (Status, Tracking, Erstattung), Produkte (Stammdaten, Varianten mit Preisverlauf, Bild-Upload), Marken, Kategorien (Regel/manuell, reservierte URLs), Duftproben, Gutscheine (Berliner Zeit), Bewertungen (Moderation), Newsletter (DOI, CSV-Export nur bestätigte, CSV-Injection-Schutz), Kunden (Sperren beendet Sessions), Einstellungen (9 Tabs), E-Mail-Protokoll (sandboxed Vorschau). Server Actions prüfen alle `requireAdmin()`.
`next.config.ts`: Sicherheits-Header, `X-Robots-Tag` für /admin und /design-system, Upload-Limit 6 MB.
Tests: Vitest 26 Unit-Tests (`npm test`), E2E Kauf + Admin-Statuswechsel + Preisänderung grün (`npm run build && npm run start`, dann `BASE_URL=http://localhost:3000 npx playwright test`). Für lokalen Produktions-Build mit Testzahlung steht `ALLOW_TEST_PAYMENTS=true` in `.env.local` (nie live).
Hinweis Shell: `pkill -f "next start"` beendet die eigene Shell; stattdessen `pkill -f "[n]ext start"`.

## Stand 27.09. (Session 3, Abschluss)

- `/design-system` (intern, noindex, in Produktion nur für Admins).
- Audits: Impeccable detect (statisch 0 Befunde; gerendert Desktop+Mobil: Befunde geprüft, echte behoben: 10-px-Labels auf 11 px, dekorative Unschärfe entfernt; Fehlalarme: Stretched-Link als „Occlusion“, Akkordeon-Überschriften als „Heading-Rhythm“, Hover-Bild mit opacity 0, Mona Sans als gewählte UI-Schrift). Finish-Review in-thread (degraded): Disposition fix → nach Fixes ship. Emil-Motion-Audit ohne Befund (ease-out, Schließen schneller als Öffnen, kein transition-all, Hover nur bei feinem Zeiger, reduced motion). Taste-Pre-Flight: doppelte CTA-Absicht auf der Startseite entfernt, keine Gedankenstriche, kein h-screen, keine Scroll-Listener.
- Responsive: mobiles Überlaufen der Produktseite (Grid ohne minmax) systemisch mit `grid-cols-1` behoben, Duftwelten-Zähler, Kaufknopf per Container Query (Tablet), Service-Leiste je Breite, Platzhalter-Chips umbrechend.
- Unbenutzte Pakete entfernt (React Hook Form, Radix Dropdown/Popover/VisuallyHidden), eigenes Favicon, Wartungs-Endpunkt `/api/cron/maintenance` + `vercel.json`, Seed leert den Next-Datencache.
- Doku: `README.md`, `DESIGN.md` + `.impeccable/design.json`, `docs/MEDIA.md`.
- Checks: typecheck, lint (0 Warnungen), 26 Unit-Tests, Build, 2 E2E-Tests grün.

## Stand 27.09. (Session 3, Nachtrag: echte Geschäftsdaten)

- Auftraggeber hat https://www.liebe-hannover.de/ genannt und gewünscht: Geschäftsdaten **und** Markenauftritt übernehmen, vorerst auf Basis der Websuche (Seite aus dem Container gesperrt, auch Archive/Caches).
- Übernommen als Admin-Vorbelegung (`src/lib/settings-schema.ts`): Karmarschstraße 25, 30159 Hannover, 0511 304711, info@liebe-hannover.de, W. Liebe GmbH & Co. KG, seit 1871, Geschichte, Filialen Celle (Poststraße 1) und Göttingen (Adresse Platzhalter), Instagram/Facebook @liebe.hannover. Quellen: PRODUCT.md → „Quellen der Geschäftsdaten“. Öffnungszeiten bleiben Platzhalter (Quellen widersprüchlich).
- Neu: `store.foundedYear`, `store.branches` (Admin → Einstellungen → Parfümerie und Kontakt), Abschnitt „Weitere Häuser“ auf /parfuemerie, JSON-LD mit foundingDate/legalName/sameAs.
- Bug behoben: Markenanzahl war immer 0 (Drizzle rendert `${brands.id}` ohne Join unqualifiziert), dadurch waren /marken, Markenbereich der Startseite und der Filialseite leer. E2E-Test dafür ergänzt.

## Stand 27.09. (Session 3, Nachtrag: Markenauftritt)

- Auftraggeber hat Logo-Datei und zwei Fotos des Stammhauses geliefert. Neue Richtung **„Das Haus Liebe“** (DESIGN.md, Direction contract in `.impeccable/surfaces/src-app-page-tsx.md`): Original-Logo (vektorisiert, `public/media/brand/liebe-logo.svg`, #ff0000), Liebe-Rot #e30613 als Bedienfarbe (Primärknopf, Service-Leiste, Zähler, Herz), Positiv-Grün #1f6040 für Erfolg, Fokus/Auswahl in Anthrazit, Rundbogen-Schaufenster für Startseiten-Stillleben und Fotos des Hauses, Foto des Eingangs als Standardbild der Parfümerie, Favicon aus dem L des Schriftzugs.
- Detector ohne neue Befunde, Finish-Review in-thread: ship. E2E 3/3, Unit 26/26, Lint 0.
- Offen beim Auftraggeber: offizielle Logo-Vektordatei und CI-Farbwerte, höher aufgelöstes Foto mit geklärtem Nutzungsrecht, Öffnungszeiten, Adresse Göttingen.

## Nächster Schritt (hier weitermachen)

Technisch nichts offen. Sobald CI-Unterlagen, Fotos oder Öffnungszeiten kommen: Logo/Icon ersetzen, Farbwerte in `src/app/globals.css` und DESIGN.md angleichen, Fotos im Admin hochladen, Öffnungszeiten im Admin eintragen. Inhalte des Inhabers siehe README „Vor dem Livegang“.
