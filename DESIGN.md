---
name: Parfümerie Liebe
description: Online-Shop der Parfümerie Liebe in Hannover, seit 1871. Weißer Stein, Rundbögen und die rote Schrift des Hauses in der Karmarschstraße.
colors:
  liebe-rot-logo: "#ff0000"
  liebe-rot: "#e30613"
  liebe-rot-tief: "#b8101f"
  rose: "#fce8e9"
  positiv: "#1f6040"
  positiv-hauch: "#e3eee8"
  paper: "#fafaf7"
  white: "#ffffff"
  porcelain: "#f2f1ec"
  mist: "#e9e7e1"
  line: "#e3e0d9"
  line-strong: "#8c877e"
  ink: "#1b1e1f"
  ink-soft: "#3e4244"
  muted: "#67635c"
  danger: "#9b2c2c"
  danger-soft: "#f6e8e6"
  warning: "#7a5212"
  warning-soft: "#f4ecdc"
  liquid-floral: "#e6c3c6"
  liquid-woody: "#a9805f"
  liquid-fresh: "#bcd7d3"
  liquid-citrus: "#e8cf78"
  liquid-aromatic: "#9fb28b"
  liquid-amber: "#c78a41"
  liquid-gourmand: "#b67b58"
  liquid-fruity: "#dfa0a4"
  liquid-leather: "#6f4d3c"
  liquid-musk: "#d8cec3"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Times New Roman, serif"
    fontSize: "clamp(2.75rem, 1.55rem + 4.2vw, 5.25rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(2.25rem, 1.65rem + 2.2vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.35vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.1em"
    fontVariation: "'wdth' 112"
  button:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 108"
rounded:
  none: "0"
  sm: "2px"
  arch: "9999px 9999px 0 0"
  full: "9999px"
spacing:
  gutter: "clamp(1rem, 0.4rem + 2.6vw, 3rem)"
  section: "clamp(4rem, 2.6rem + 5vw, 8rem)"
  container: "90rem"
components:
  button-primary:
    backgroundColor: "{colors.liebe-rot}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.liebe-rot-tief}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "48px"
  badge:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "24px"
  badge-sale:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  icon-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "44px"
---

# Design System: Parfümerie Liebe

## Overview

**Creative North Star: "Das Haus Liebe"**

Der Shop ist das Haus in der Karmarschstraße im Netz: weißer Stein, hohe Rundbogenfenster, eine weiße Markise mit dem Liebe-Schriftzug, rote Akzente vom Teppich bis zur Tüte. Der rote Schriftzug ist das Erkennungszeichen und bleibt die einzige kräftige Farbe der Oberfläche. Alles andere ist ruhig: ein heller Grund (`paper`), Anthrazit für Text und Bedienung, feine Haarlinien.

Premium entsteht durch Typografie, Proportionen, Weißraum und Produktpräsentation. Bodoni Moda setzt Überschriften, Mona Sans trägt Oberfläche und Text, breite Versalien stehen wie „PARFÜMERIE“ auf der Blende über dem Eingang. Der Rundbogen der Schaufenster ist die eine Form, die aus dem Haus übernommen wird: für das Stillleben der Startseite und die Fotos des Hauses. Produktbilder bleiben rechteckig, ihre Farbe kommt aus der Flüssigkeit im Glas.

Der Aufbau folgt einer editorialen Modehaus-Vorlage des Auftraggebers (Struktur übernommen, Farben nicht): ein großes Wort über die volle Breite mit freigestelltem Flakon davor, ein Kategorie-Band mit großen Ziffern, ein geteilter Abschnitt mit schräger Kante, eine Service-Zeile und klare Produktraster.

Bewegung folgt einer kurzen, starken ease-out-Kurve. Es gibt einen inszenierten Moment (Wort und Flakon erscheinen auf der Startseite); alles andere ist Rückmeldung auf Handlungen.

**Key Characteristics:**
- Heller Grund, Anthrazit als Tinte, Liebe-Rot als einziger Markenakzent.
- Das Original-Logo (roter Schriftzug) mit „PARFÜMERIE“ in breiten Versalien darunter.
- Großes Wort in Bodoni über die volle Breite, davor ein freigestellter Flakon mit echter Glastransparenz.
- Rundbogen wie die Schaufenster des Stammhauses nur auf der Filialseite; auf der Startseite die schräge Kante.
- Bodoni Moda für Überschriften, Mona Sans mit Breitenachse für alles andere.
- Bedienelemente und Panels 2 px, Produktbilder randlos, rund nur Icon-Knöpfe und Farbmuster.
- Schatten nur auf Ebenen über der Seite; nur helles Theme.

## Colors

Ein heller, fast farbloser Grund mit dem Rot der Marke, einem dunklen Grün für positive Rückmeldungen und zehn Flüssigkeitstönen, die nur im Produktbild vorkommen.

### Primary
- **Liebe-Rot (Logo)** (`liebe-rot-logo`): ausschließlich der Schriftzug, so wie in der gelieferten Logo-Datei. Mit 3,97:1 auf Weiß nicht für Text oder Knöpfe geeignet.
- **Liebe-Rot** (`liebe-rot`): Bedienfarbe der Marke, einen Hauch tiefer als das Logo, damit weiße Schrift 4,9:1 erreicht. Primärknopf, Service-Leiste, Warenkorb-Zähler, Etikett „Exklusiv“, gemerktes Herz, aktiver Menüpunkt, Hover großer Überschriften-Links. Tiefer Ton (`liebe-rot-tief`) für Hover und Textauswahl, `rose` als Auswahlgrund.

### Secondary
- **Positiv** (`positiv`): „Auf Lager“, gespeicherte Formulare, Ersparnis und Gutscheine, Fortschritt zur Versandkostenfreiheit, Bestellfortschritt, positive Status im Admin. Rot bedeutet nie Erfolg.

### Neutral
- **Paper** (`paper`): Seitengrund überall, wie der helle Stein der Fassade.
- **Weiß** (`white`): Eingabefelder, Größen-Kacheln, Etiketten auf Bildern.
- **Porzellan** (`porcelain`): ruhige Flächen, Bildplatten der Produktkarten, Footer.
- **Nebel** (`mist`): Skeletons, deaktivierte Knöpfe, Fokus-Schein der Felder.
- **Haarlinie** (`line`): Trennlinien, rein dekorativ. **Kante** (`line-strong`): Feldränder (mindestens 3:1).
- **Tinte** (`ink`), **Tinte weich** (`ink-soft`), **Gedämpft** (`muted`): Text in drei Stufen. Tinte trägt auch Fokusring, Checkboxen, Radios und ausgewählte Optionen.
- **Gefahr** (`danger`) und **Hinweis** (`warning`) mit weichem Grund: Feldfehler, Löschen, Platzhalter-Warnungen. Gefahr ist ein dunkles Weinrot, deutlich tiefer als Liebe-Rot.

### Tertiary
- **Flüssigkeiten** (`liquid-*`): nur in Produkt-Renderings, Duftnoten-Schichten, Duftwelt-Kacheln, Farbmustern im Duftfinder und der Füllung der Flakon-Größenwahl.

### Named Rules
**The One Red Rule.** Liebe-Rot ist die einzige kräftige Farbe der Oberfläche und gehört der Marke: Logo, Primärhandlung, Service-Leiste, Herz, Zähler. Auswahl, Fokus und Häkchen tragen Anthrazit.

**The Red-Is-Not-Success Rule.** Positive Rückmeldungen sind grün (`positiv`), Fehler weinrot (`danger`). Liebe-Rot erscheint nie als Status.

**The Only-Glass-Carries-Color Rule.** Außer dem Rot der Marke kommt Farbe nur aus dem Glas: Flüssigkeitstöne erscheinen nie als Text, Knopf oder Fläche der Oberfläche.

## Typography

**Display Font:** Bodoni Moda (optische Größen, mit Didot und Bodoni 72 als Rückfall)
**Body Font:** Mona Sans (Variable Font mit Breitenachse)
**Label Font:** Mona Sans, breit (`wdth` 108 bis 112), Versalien

**Character:** Ein Didone mit hohem Kontrast wie ein graviertes Flakonetikett, daneben eine ruhige, leicht technische Grotesk. Die Breitenachse macht aus derselben Sans ein Etikett.

### Hierarchy
- **Display** (400, `display`, 1.02): Startseiten-Headline, eine pro Seite.
- **Headline** (400, `headline`, 1.06): H1 auf Unterseiten, Produktname auf der Produktseite.
- **Title** (400, `title`, 1.1): Abschnittsüberschriften (H2).
- **H3** (Mona Sans 600, 1.375rem, 1.22): Unterabschnitte in der Oberfläche; Produktnamen in Karten stehen in Bodoni 1.25rem.
- **Body** (400, 1rem, 1.6): Fließtext, höchstens 65 bis 75 Zeichen pro Zeile; Body large 1.125rem für Einleitungen.
- **Small / Caption** (0.875rem / 0.8125rem): Metadaten, Grundpreise, Hinweise.
- **Label** (600, 0.75rem, 0.1em, Versalien): Marke über dem Produktnamen, Konzentration, Knöpfe, Badges. Nie kleiner als 11 px.

### Named Rules
**The Fascia Label Rule.** Breite Versalien benennen Dinge wie die Blende über dem Eingang („PARFÜMERIE“, Marke, Konzentration, Aktion). Sie stehen nie als Dachzeile über einer Abschnittsüberschrift.

**The Honest Numerals Rule.** Preise nutzen proportionale Versalziffern (`numeric`), weil Mona Sans' Tabellenziffern eine durchgestrichene Null haben; Tabellen im Admin nutzen `tabular`.

## Layout

Container bis 90rem mit fließendem Rand (`gutter`, 16 bis 48 px) und einem 12-Spalten-Raster ab `md` (768 px). Abschnitte atmen mit `section` (64 bis 128 px). Mobile Raster sind immer `grid-cols-1` (minmax(0, 1fr)), damit Karussells und lange Wörter die Spalte nicht sprengen.

Die Startseite öffnet mit Service-Leiste (32 px), einzeiligem Header (72 px, kompakt 60 px nach dem Scrollen) und einem Stillleben über sieben von zwölf Spalten bis zur Unterkante des Viewports. Produktlisten: Filterspalte 15.5rem ab `lg`, sonst Filter-Drawer; Karten im Verhältnis 4:5, zwei Spalten mobil, drei bis vier auf dem Desktop. Produktseite: Galerie über sieben Spalten, Kaufbereich über fünf und klebend; mobil eine wischbare Galerie und eine feste Kaufleiste, sobald der Hauptknopf aus dem Blick ist.

## Elevation & Depth

Die Seite ist flach. Flächen trennen sich durch Haarlinien und den Wechsel von `paper` zu `porcelain`; klebende Leisten sind deckend `paper`, ohne Unschärfe. Schatten gibt es nur für Ebenen, die über der Seite schweben.

### Shadow Vocabulary
- **Overlay** (`0 24px 60px -24px rgb(27 30 31 / 0.28), 0 2px 8px rgb(27 30 31 / 0.06)`): Drawer (Warenkorb, Menü, Filter), Dialoge, Consent-Hinweis.
- **Popover** (`0 12px 32px -12px rgb(27 30 31 / 0.22), 0 1px 3px rgb(27 30 31 / 0.08)`): Schnellkauf-Leiste auf Produktkarten, Hinweise (Toasts).

### Named Rules
**The Flat Counter Rule.** Was auf dem Tisch liegt, wirft keinen Schatten. Nur was darüber schwebt, darf einen tragen.

## Shapes

Präzise statt weich, mit einer Ausnahme aus der Architektur. Bedienelemente und Panels haben 2 px Radius (Knöpfe, Felder, Größen-Kacheln, Badges), Produktbilder sind randlos (0), rund sind nur Icon-Knöpfe (44 px Trefferfläche), Farbmuster und Zähler. Linien sind 1 px. Kein Element ist eine Pille.

### Named Rules
**The Shop Window Rule.** Der Rundbogen (oben halbkreisförmig, `arch`) kommt von den Schaufenstern des Stammhauses und rahmt nur das Foto des Hauses auf der Filialseite (Hochformat 4:5). Produktkarten, Kacheln und Bedienelemente bleiben gerade.

**The Diagonal Rule.** Die einzige schräge Linie ist die Kante zwischen Text und Foto im geteilten Abschnitt der Startseite (Bild von 22 % oben auf 0 % unten angeschnitten). Keine weiteren schrägen Flächen oder Streifen.

**The Numeral Rule.** Große Ziffern 01 bis 04 nur im Kategorie-Band, als Umriss in Bodoni (1 px `line-strong`), nie gefüllt und nie als Abschnittsnummerierung.

## Components

### Buttons
- **Shape:** 2 px Radius, Höhen 56 / 48 / 40 px (lg / md / sm), Beschriftung in breiten Versalien, nie umbrechend.
- **Primary:** Liebe-Rot mit weißer Schrift, Hover Liebe-Rot tief; eine primäre Handlung pro Bereich.
- **Secondary:** 1 px Tintenrahmen, transparent; Hover füllt mit Tinte.
- **Ghost / Inverse:** Ghost für Nebenhandlungen, Inverse (Paper auf Tinte) nur auf dunklem Grund.
- **Press / Loading:** `scale(0.97)` beim Drücken (140 ms); beim Laden blendet die Beschriftung per Unschärfe zu drei pulsierenden Punkten über, die Breite bleibt stabil.

### Cards / Containers
- **Produktkarte:** keine Kartenfläche. Bildplatte in `porcelain` (4:5, randlos), darunter Marke als Etikett, Name in Bodoni, Konzentration und Größen, Ab-Preis. Auf Zeigergeräten erscheint eine Schnellkauf-Leiste mit den Größen; zweites Bild blendet beim Hover über.
- **Panels:** 1 px Haarlinie auf Weiß, 2 px Radius (Admin, Bestellübersicht).

### Inputs / Fields
- **Style:** Weiß, 1 px `line-strong`, 2 px Radius, 48 px hoch, Beschriftung immer sichtbar darüber.
- **Focus:** Rand in Tinte plus 3 px Schein in `mist`; Einfügemarke in Liebe-Rot.
- **Error / Disabled:** Rand und Schein in Gefahr-Tönen, Meldung direkt unter dem Feld und per `aria-describedby` verknüpft; deaktiviert auf `porcelain` mit gedämpfter Schrift.

### Navigation
- **Logo:** Original-Schriftzug „Liebe“ in `liebe-rot-logo` (vektorisiert aus der gelieferten Datei, `public/media/brand/liebe-logo.svg`), darunter „PARFÜMERIE“ in breiten Versalien. Header 40 px Schrifthöhe, kompakt 32 px, Footer 52 px. Nie umfärben, verzerren oder auf Rot setzen.
- **Header:** Menü-Knopf und Hauptnavigation links (breite Versalien 11 px, „Angebote“ in Liebe-Rot), Logo mittig, rechts Suche, Parfümerie, Konto, Wunschliste und Warenkorb mit „(n)“. Hauptnavigation ab 1280 px, „Nischendüfte“ ab 1536 px; alles Weitere im Menü.
- **Service-Leiste:** Rote Leiste wie das Band über der Fassade, weiße breite Versalien: links konfigurierbare, wahre Hinweise (mobil einer, ab 1280 px zwei), rechts „Bestellung verfolgen | Hilfe | Unsere Parfümerie“. Nie abgeschnitten.

### Startseite (Struktur)
- **Hero:** oben links die Überschrift als kleine Versalien (H1) mit einem Satz darunter, oben rechts ein runder Stempel „Parfümerie Liebe · Hannover · seit 1871“ (statisch), in der Mitte das große Wort (Einstellung `heroWord`) in Bodoni über die volle Breite, davor der freigestellte Flakon (Höhe an die Viewportbreite gekoppelt, verdeckt etwa 30 % des Worts), unten links Primärknopf mit Pfeil und Textlink, unten rechts „Hannover / seit 1871“.
- **Kategorie-Band:** Porzellan-Band, vier Kacheln (Damen, Herren, Unisex, Nischendüfte) mit Umriss-Ziffer, freigestelltem Flakon, Name, Anzahl und „Ansehen →“.
- **Geteilter Abschnitt:** Text auf Porzellan links, Foto des Hauses rechts mit schräger Kante.
- **Service-Zeile:** vier Punkte mit Icon (Versand, Widerruf, Duftproben, sichere Zahlung) aus den Einstellungen, getrennt durch Haarlinien.

### Flakon-Größenwahl (Signature)
Jede Größe ist eine Kachel mit einer gezeichneten Flakon-Silhouette, deren Füllstand die Größe relativ zur größten zeigt, gefüllt in der Flüssigkeitsfarbe des Dufts (500 ms ease-out beim Wechsel). Darunter Größe und Preis dieser Größe; Ausverkauftes ist durchgestrichen und gestrichelt.

### Duftnoten-Schichten (Signature)
Kopf-, Herz- und Basisnote als übereinanderliegende Flüssigkeitsschichten, jeweils ein Hauch dunkler, Noten in Bodoni. Daneben die Intensität als fünfteilige Skala.

## Do's and Don'ts

### Do:
- **Do** das Original-Logo unverändert in Liebe-Rot auf hellem Grund zeigen.
- **Do** Rot sparsam einsetzen: eine rote Primärhandlung pro Bereich, dazu Service-Leiste, Herz und Zähler.
- **Do** das große Wort kurz halten (4 bis 7 Buchstaben) und das Motiv davor freigestellt mit transparentem Hintergrund liefern.
- **Do** Fotos des Hauses auf der Filialseite im Rundbogen (4:5) zeigen, Produkte im geraden Bild.
- **Do** jede Kaufinformation sichtbar halten: Größe, Preis dieser Größe, Grundpreis pro 100 ml, Verfügbarkeit, Lieferzeit.
- **Do** fehlende Geschäftsdaten als gekennzeichneten Platzhalter setzen (gestrichelter Rahmen, Etikett „Platzhalter“).
- **Do** Hover-Effekte nur für feine Zeiger und `prefers-reduced-motion` für jede Bewegung berücksichtigen.

### Don't:
- **Don't** Rot als Status (Erfolg, Hinweis), für Checkboxen oder den Fokusring verwenden.
- **Don't** Verläufe, Glas- oder Unschärfe-Flächen, Neon, Blobs, Pillen oder Emoji-Icons einsetzen.
- **Don't** Messing- oder Goldflächen nachbauen; das Gold der Fassade bleibt im Foto.
- **Don't** Dachzeilen (Eyebrows) über Überschriften, Abschnittsnummern oder Gedankenstriche in Texten der Oberfläche.
- **Don't** künstliche Knappheit, Countdowns, erfundene Bewertungen oder Vertrauenssiegel zeigen.
- **Don't** Schatten auf Karten oder Flächen der Seite legen.
