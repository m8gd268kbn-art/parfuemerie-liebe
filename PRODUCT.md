# Product

<!-- impeccable:product-schema 1 -->

> Quelle: Master-Prompt des Inhabers/Auftraggebers vom 26.09.2026. Alle Punkte unten stammen aus diesem Briefing.
> Mit **[offen]** markierte Punkte sind bewusst nicht entschieden und dürfen nicht erfunden werden.

## Platform

web

## Stack

Vom Briefing vorgegeben: Next.js (App Router), React, TypeScript, Tailwind CSS, Zod, React Hook Form, Stripe, Resend (abstrahiert), PostgreSQL (Supabase als Zielplattform).
Abweichung mit Begründung: Authentifizierung und Sessions laufen serverseitig in der eigenen PostgreSQL-Datenbank statt über Supabase Auth. So ist alles lokal ohne Docker testbar, und Admin-Rechte werden an einer Stelle serverseitig geprüft. Supabase bleibt der Datenbank- und Storage-Host.

## Users

- **Stammkundschaft der Parfümerie Liebe in Hannover:** kennt das Geschäft und die persönliche Beratung und möchte künftig auch online nachkaufen, stöbern und bestellen.
- **Neue Online-Kundschaft in Deutschland:** sucht gezielt nach Marke, Duft, Duftfamilie oder Duftnote, vergleicht Größen und Preise und erwartet den Funktionsumfang großer Beauty-Shops (Suche, Filter, Wunschliste, Gast-Checkout, Sendungsverfolgung).
- **Inhaber/Team der Parfümerie:** pflegt Produkte, Varianten, Bestand, Bestellungen, Gutscheine, Proben und Shop-Einstellungen im Admin-Bereich.

## Product Purpose

Offizieller Online-Shop und Webauftritt der bestehenden, stationären Parfümerie Liebe in Hannover. Die Parfümerie wird digital erweitert: Produkte online entdecken, durchsuchen, filtern, vergleichen, bestellen, bezahlen und liefern lassen. Online-Shop und Geschäft sollen sich wie eine gemeinsame Marke anfühlen.
Erfolg: Kundschaft versteht jederzeit Produkt, Marke, Größe, genauen Preis dieser Größe, Verfügbarkeit, Lieferzeit, Zahlungs- und Rückgabemöglichkeiten, und kauft ohne Hürden.

## Positioning

Eine persönliche Parfümerie aus Hannover mit echtem Geschäft und Beratung vor Ort, übersetzt in einen digitalen Shop. Funktional auf dem Niveau großer Beauty-Shops, im Auftritt ruhiger, persönlicher und individueller als Douglas oder Sephora (beide nur funktionale Referenz, nicht optische Vorlage).

## Operating Context

- Markt zunächst Deutschland; Architektur erweiterbar für Österreich, Schweiz und EU.
- Sortiment: Parfum (Damen, Herren, Unisex), Mainstream und Nischendüfte, jede Größe als eigene Variante mit eigenem Preis und Bestand.
- Kostenlose Duftproben zur Bestellung (konfigurierbar).
- Click & Collect (online bestellen, in der Parfümerie abholen) ist vorbereitet und wird erst nach Konfiguration aktiviert.
- Rechtlicher Rahmen: DSGVO, Consent, Impressum, AGB, Widerruf, Preisangaben inkl. MwSt., ggf. Grundpreise, Double-Opt-In beim Newsletter.

## Capabilities and Constraints

- Gast-Checkout ist Pflicht; keine erzwungene Registrierung.
- Zahlungsbestätigung ausschließlich per signiertem Webhook, nie per Redirect. Keine Kartendaten im eigenen System.
- Preise, Rabatte und Bestand werden immer serverseitig berechnet und geprüft.
- Zahlungsarten werden nur angezeigt, wenn sie tatsächlich angebunden und im Admin aktiviert sind.
- Geschäftsregeln (Versandkosten, Versandfreigrenze, Proben, Service-Bar, Kontaktdaten, Öffnungszeiten) sind im Admin konfigurierbar, nicht hartcodiert.
- **[offen]** Echte Adresse, Telefonnummer, E-Mail, Öffnungszeiten, Gründungsjahr, Geschichte, Team, Fotos des Geschäfts, Logo, Markenfarben, Social-Media-Profile, Sortimentsliste, echte Preise.
- **[offen]** Welche Zahlungsarten im Stripe-Konto aktiviert werden.
- **[offen]** Endgültige Rechtstexte (Impressum, Datenschutz, AGB, Widerruf) — müssen vor Livegang professionell erstellt/geprüft werden.

## Brand Commitments

- Name ausschließlich **Parfümerie Liebe** (Hannover). Keine erfundenen Namen oder Varianten (nicht „parfume.de", nicht „Parfum d'Amore", nicht „Parfümerie d'Amore").
- Anrede: Das Briefing nutzt in Beispieltexten „Sie" („Für Sie") und „du" („Wähle 2 kostenlose Duftproben"). **[offen]** Entscheidung für die Umsetzung: durchgehend **„Sie"**, passend zur persönlichen, hochwertigen Beratung einer Fach-Parfümerie; zentral änderbar in den Texten.
- Charakter laut Briefing: luxuriös, ruhig, modern, elegant, vertrauenswürdig, editorial, zeitlos, persönlich, boutique-artig. Premium entsteht durch Typografie, Proportionen, Weißraum, Produktpräsentation und Details, nicht durch Gold.
- Kein Rabatt-Shop-Charakter: keine Fake-Countdowns, keine künstliche Knappheit, keine aggressiven Popups.

## Evidence on Hand

- Im Repository sind **keine** Assets der Parfümerie Liebe vorhanden (kein Logo, keine Farben, keine Fotos, keine Texte, keine bestehende Website).
- Es gibt keine echten Bewertungen, Kundenzahlen, Auszeichnungen, Pressestimmen oder Partnerschaften. Diese dürfen nicht erfunden werden.
- Produktdaten für die Entwicklung sind Demo-Daten und als solche gekennzeichnet; Produktbilder sind neutrale, lokal erzeugte Platzhalter.

## Product Principles

1. **Klarheit vor Inszenierung:** Luxus darf nie wichtige Kaufinformationen verstecken (Größe, Preis dieser Größe, Verfügbarkeit, Lieferzeit, Zahlung, Rückgabe).
2. **Eine Marke, zwei Orte:** Online-Shop und Geschäft in Hannover sind dieselbe Parfümerie; die Beratung vor Ort ist sichtbar Teil des Angebots.
3. **Nichts erfinden:** Fehlende Geschäftsdaten sind klar markierte Platzhalter; keine Fake-Reviews, Fake-Knappheit oder Fake-Vertrauenssignale.
4. **Serverseitige Wahrheit:** Preise, Bestand, Rabatte, Zahlungsstatus und Rechte werden nur auf dem Server entschieden.
5. **Konfigurierbar statt hartcodiert:** Der Inhaber steuert Geschäftsregeln im Admin.

## Accessibility & Inclusion

WCAG-2.2-AA-orientiert: semantisches HTML, vollständige Tastaturbedienung, sichtbare Fokuszustände, ausreichende Kontraste, Dialog-Fokusfallen, Screenreader-Texte, Fehlermeldungen an Feldern, Alt-Texte, Skip-Link, `prefers-reduced-motion`.
