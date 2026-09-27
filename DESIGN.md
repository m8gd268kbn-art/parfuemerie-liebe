---
name: Parfümerie Liebe
description: Online-Shop der Parfümerie Liebe in Hannover. Ein hell beleuchteter Verkaufstisch aus Porzellan, auf dem nur das Glas Farbe trägt.
colors:
  flakongruen: "#1f3f36"
  flakongruen-tief: "#152d26"
  flakongruen-hauch: "#e4ebe7"
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
  full: "9999px"
spacing:
  gutter: "clamp(1rem, 0.4rem + 2.6vw, 3rem)"
  section: "clamp(4rem, 2.6rem + 5vw, 8rem)"
  container: "90rem"
components:
  button-primary:
    backgroundColor: "{colors.flakongruen}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.flakongruen-tief}"
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

**Creative North Star: "Flakon und Licht"**

Jeder Duft ist ein Flakon im Licht. Die Oberfläche ist ein hell beleuchteter Verkaufstisch aus Porzellan: porzellanweißer Grund, anthrazitfarbene Tinte, feine Haarlinien und ein einziges Flakongrün für Handlungen. Farbe kommt nur aus der Flüssigkeit im Glas, also aus Produktbildern, den Duftnoten-Schichten und den Duftwelten. Das trennt den Shop vom Creme-und-Gold-Luxus-Template und vom lauten Badge-Raster großer Beauty-Shops.

Premium entsteht durch Typografie, Proportionen, Weißraum und Produktpräsentation. Bodoni Moda setzt Überschriften wie gravierte Etiketten, Mona Sans trägt Oberfläche und Text, breite Versalien bleiben den Etiketten vorbehalten (Marke, Konzentration, Knöpfe). Die Dichte ist ruhig: große Bilder, wenige Elemente pro Blick, Kaufinformationen (Größe, Preis dieser Größe, Verfügbarkeit, Lieferzeit) nie versteckt.

Bewegung folgt einer kurzen, starken ease-out-Kurve. Es gibt einen inszenierten Moment (das Aufdecken des Stilllebens auf der Startseite); alles andere ist Rückmeldung auf Handlungen.

**Key Characteristics:**
- Porzellanweißer Grund, anthrazitfarbene Tinte, ein Akzent (Flakongrün).
- Farbe nur als Flüssigkeit im Glas: zehn Duftfamilien-Tönungen, nie für Text oder Bedienelemente.
- Bodoni Moda für Überschriften, Mona Sans mit Breitenachse für alles andere.
- Bedienelemente und Panels 2 px, Bilder randlos, rund nur Icon-Knöpfe und Farbmuster.
- Schatten nur auf Ebenen über der Seite.
- Nur helles Theme: Die Briefing-Palette (Ivory, Weiß, Anthrazit, Warmgrau) ist hell gesetzt.

## Colors

Eine fast farblose Porzellanpalette mit einem tiefen Flaschengrün und zehn Flüssigkeitstönen, die nur im Bild vorkommen.

### Primary
- **Flakongrün** (`flakongruen`): Primärknöpfe, Fokusring, ausgewählte Zustände, Erfolgsmeldungen, Fortschritt zur Versandkostenfreiheit. Tiefer Ton (`flakongruen-tief`) für Hover, Hauch (`flakongruen-hauch`) für Fokus-Schein und Textauswahl.

### Neutral
- **Paper** (`paper`): Seitengrund überall.
- **Weiß** (`white`): Eingabefelder, Größen-Kacheln, Etiketten auf Bildern.
- **Porzellan** (`porcelain`): ruhige Flächen, Bildplatten der Produktkarten, Footer, Duftwelten-Band.
- **Nebel** (`mist`): Skeletons, deaktivierte Knöpfe.
- **Haarlinie** (`line`): Trennlinien, Kartenränder, rein dekorativ.
- **Kante** (`line-strong`): Feldränder und Checkbox-Rahmen (mindestens 3:1).
- **Tinte** (`ink`), **Tinte weich** (`ink-soft`), **Gedämpft** (`muted`): Text in drei Stufen; `muted` hält 4,5:1 auf `paper` und `porcelain`.
- **Gefahr** (`danger`) und **Hinweis** (`warning`), jeweils mit weichem Grund: Feldfehler, Löschen, Platzhalter-Warnungen im Admin.

### Tertiary
- **Flüssigkeiten** (`liquid-*`): Floral, Holzig, Frisch, Zitrisch, Aromatisch, Amber, Gourmand, Fruchtig, Leder, Moschus. Nur in Produkt-Renderings, Duftnoten-Schichten, Duftwelt-Kacheln, Farbmustern im Duftfinder und der Füllung der Flakon-Größenwahl.

### Named Rules
**The Only-Glass-Carries-Color Rule.** Flüssigkeitstöne erscheinen nie als Text, Knopf, Fläche oder Rahmen der Oberfläche. Wer Farbe braucht, zeigt ein Glas.

**The One Accent Rule.** Flakongrün ist der einzige Akzent. Reduzierungen tragen Tinte (`ink`), nicht Rot; Rot ist Fehlern vorbehalten.

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
**The Engraved Label Rule.** Breite Versalien benennen Dinge (Marke, Konzentration, Aktion). Sie stehen nie als Dachzeile über einer Abschnittsüberschrift.

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

Präzise statt weich. Bedienelemente und Panels haben 2 px Radius (Knöpfe, Felder, Größen-Kacheln, Badges, Drawer-Inhalte), Bilder und Bildplatten sind randlos (0), rund sind nur Icon-Knöpfe (44 px Trefferfläche), Farbmuster und Zähler. Linien sind 1 px; die Intensitätsskala nutzt 3 px hohe Segmente. Kein Element ist eine Pille.

## Components

### Buttons
- **Shape:** 2 px Radius, Höhen 56 / 48 / 40 px (lg / md / sm), Beschriftung in breiten Versalien, nie umbrechend.
- **Primary:** Flakongrün mit weißer Schrift; eine primäre Handlung pro Bereich.
- **Secondary:** 1 px Tintenrahmen, transparent; Hover füllt mit Tinte.
- **Ghost / Inverse:** Ghost für Nebenhandlungen, Inverse (Paper auf Tinte) nur auf dunklem Grund.
- **Press / Loading:** `scale(0.97)` beim Drücken (140 ms); beim Laden blendet die Beschriftung per Unschärfe zu drei pulsierenden Punkten über, die Breite bleibt stabil.

### Cards / Containers
- **Produktkarte:** keine Kartenfläche. Bildplatte in `porcelain` (4:5, randlos), darunter Marke als Etikett, Name in Bodoni, Konzentration und Größen, Ab-Preis. Auf Zeigergeräten erscheint eine Schnellkauf-Leiste mit den Größen; zweites Bild blendet beim Hover über.
- **Panels:** 1 px Haarlinie auf Weiß, 2 px Radius (Admin, Bestellübersicht).

### Inputs / Fields
- **Style:** Weiß, 1 px `line-strong`, 2 px Radius, 48 px hoch, Beschriftung immer sichtbar darüber.
- **Focus:** Rand in Flakongrün plus 3 px Schein in `flakongruen-hauch`; Einfügemarke in Flakongrün.
- **Error / Disabled:** Rand und Schein in Gefahr-Tönen, Meldung direkt unter dem Feld und per `aria-describedby` verknüpft; deaktiviert auf `porcelain` mit gedämpfter Schrift.

### Navigation
- **Header:** Wortmarke links, Hauptnavigation mittig in Mona Sans (ab `xl`), rechts runde Icon-Knöpfe (Suche, Parfümerie, Konto, Wunschliste, Warenkorb mit Zähler). Aktiver Punkt mit feiner Unterstreichung. Darunter `xl` ein Menü-Drawer von links.
- **Service-Leiste:** Flakongrüne Leiste mit höchstens drei konfigurierbaren, wahren Aussagen.

### Flakon-Größenwahl (Signature)
Jede Größe ist eine Kachel mit einer gezeichneten Flakon-Silhouette, deren Füllstand die Größe relativ zur größten zeigt, gefüllt in der Flüssigkeitsfarbe des Dufts (500 ms ease-out beim Wechsel). Darunter Größe und Preis dieser Größe; Ausverkauftes ist durchgestrichen und gestrichelt.

### Duftnoten-Schichten (Signature)
Kopf-, Herz- und Basisnote als übereinanderliegende Flüssigkeitsschichten, jeweils ein Hauch dunkler, Noten in Bodoni. Daneben die Intensität als fünfteilige Skala.

## Do's and Don'ts

### Do:
- **Do** Farbe über ein Glas zeigen: Rendering, Notenschicht oder Farbmuster in einem `liquid-*`-Ton.
- **Do** jede Kaufinformation sichtbar halten: Größe, Preis dieser Größe, Grundpreis pro 100 ml, Verfügbarkeit, Lieferzeit.
- **Do** fehlende Geschäftsdaten als gekennzeichneten Platzhalter setzen (gestrichelter Rahmen, Etikett „Platzhalter“).
- **Do** Hover-Effekte nur für feine Zeiger und `prefers-reduced-motion` für jede Bewegung berücksichtigen.
- **Do** Bewegungen kurz halten (140 bis 380 ms) und beim Schließen schneller als beim Öffnen.

### Don't:
- **Don't** Verläufe, Glas- oder Unschärfe-Flächen, Neon, Blobs, Pillen oder Emoji-Icons einsetzen.
- **Don't** Gold oder Creme als Oberflächenfarbe verwenden; Luxus entsteht aus Typografie und Weißraum.
- **Don't** Dachzeilen (Eyebrows) über Überschriften, Abschnittsnummern oder Gedankenstriche in Texten der Oberfläche.
- **Don't** künstliche Knappheit, Countdowns, erfundene Bewertungen oder Vertrauenssiegel zeigen.
- **Don't** Schatten auf Karten oder Flächen der Seite legen.
