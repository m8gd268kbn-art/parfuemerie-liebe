# Fortschritt & Übergabe – Online-Shop Parfümerie Liebe

> Stand: 26.09.2026, Arbeit auf Wunsch des Auftraggebers unterbrochen.
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

## Nächster Schritt (hier weitermachen)

Phase 4/5 fortsetzen (Task „Datenmodell, DB, Services, Seed & Produktbilder“):
1. `src/config/env.ts` (Zod-validierte Env), `.env.example`, `drizzle.config.ts`, `src/services/db/index.ts` (postgres.js-Client).
2. Migration generieren (`drizzle-kit generate`) + Zusatz-SQL: `pg_trgm`, RLS auf allen Tabellen aktivieren (keine Policies; Server verbindet als Owner), Sequenz für Bestellnummern.
3. Shop-Settings-Schema (Zod, Defaults: Versand DE 4,95 € / frei ab 49 €, Proben, Service-Bar mit Platzhaltern wie `{freeShippingFrom}`, Zahlarten, Click & Collect aus, Store-Daten leer = Platzhalter, Rechtstexte als Platzhalter).
4. Services: auth, settings, catalog (Filter/Sortierung/Facetten), search (pg_trgm), cart, coupons, shipping, orders (Bestandsreservierung atomar), payments (Stripe + Test), email, rate-limit, storage.
5. Seed (≥ 20 Produkte, mehrere Marken, Größen, Sale, ausverkaufte Varianten, Proben, Admin-Nutzer aus Env).
6. Render-Pipeline für Flakon-Bilder.

Danach Tasks 3–6 laut Master-Prompt: Storefront → Checkout/Konto/Inhalte → Admin/SEO → Audits, Tests, Polish. Außerdem müssen `src/app/layout.tsx` und `src/app/page.tsx` noch ersetzt werden (sie sind noch die create-next-app-Vorlage).
