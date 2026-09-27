---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Storefront Parfümerie Liebe

Scope: gesamte Storefront (Startseite, Listing, Suche, Produktdetail, Warenkorb, Checkout, Konto, Marken, Parfümerie-Seite). Startseite = Persuade, Listing/PDP/Checkout/Konto = Operate.

Audience/Job: Stammkundschaft aus Hannover und neue Online-Kundschaft in Deutschland; Duft finden (Marke, Familie, Note), Größe und exakten Preis verstehen, als Gast bestellen.
Proof/Content: echtes Sortiment (Demo-Daten bis zur Übergabe), echte Geschäftsdaten nur als markierte Platzhalter. Keine Reviews, Awards, Kundenzahlen erfinden.
Constraints: Briefing pinnt Ivory/Weiß/Anthrazit/Warmgrau + ein dezenter Akzent, Display-Serif + moderne Sans, viel Weißraum, große Produktfotografie, feine Linien, keine Gradients/Glas/Neon/Blobs/Pills/Emoji.

Grounded candidates (nach Resonanz): 1 Duftstreifen-Ritual an der Theke, 2 Duftpyramide als Formelblatt, 3 Flakon und Licht, 4 Geschenkritual (Seidenpapier, Band, Tüte), 5 Apothekenschrank mit Emaille-Etiketten, 6 Mode-Editorial der Parfumkampagne, 7 Hannover: Herrenhäuser Gärten / Roter Faden.

## Direction contract

THESIS: Der Shop ist das Haus Liebe in der Karmarschstraße im Netz: weißer Stein, Rundbogen-Schaufenster, der rote Schriftzug. Premium entsteht aus Ruhe, Typografie und dem einen Rot der Marke, nicht aus Gold oder Badge-Rastern.

OWN-WORLD: Heller Grund (`paper`), Anthrazit für Text und Bedienung, 1px-Haarlinien, Liebe-Rot als einziger Markenakzent (Logo, Primärhandlung, Service-Leiste, Herz, Zähler). Original-Logo (roter Schriftzug) mit „PARFÜMERIE“ in breiten Versalien wie auf der Blende. Rundbogen der Schaufenster nur für Schaufenster-Momente (Startseiten-Stillleben, Fotos des Hauses). Produktfarbe nur aus Flüssigkeiten im Glas. Bodoni Moda für Überschriften, Mona Sans für UI und Text. Controls 2px Radius, Produktbilder randlos, Schatten nur auf Overlays.

STORY: Besucher erkennen in Sekunden die Parfümerie Liebe aus Hannover (seit 1871) am roten Schriftzug und am Rundbogen, finden per Suche, Marke, Duftfamilie oder Note ihren Duft, sehen Größe, Preis dieser Größe, Verfügbarkeit und Lieferzeit und bestellen ohne Konto.

FIRST VIEWPORT: Rote Service-Leiste 32px (Hinweise links, Service-Links rechts). Header 72px: Menü und Navigation links, Logo mittig, Icons und Warenkorb „(n)“ rechts. Hero nach der Struktur-Vorlage des Auftraggebers: kleine Versalien-Überschrift oben links, runder Stempel „seit 1871“ oben rechts, das Wort „LIEBE“ in Bodoni über die volle Breite, davor der freigestellte Flakon, unten links roter Primärknopf und Textlink, unten rechts „Hannover / seit 1871“. Darunter Kategorie-Band mit Ziffern, geteilter Abschnitt mit schräger Kante (Foto des Hauses), Service-Zeile, Bestseller.

FORM: Markenvorgabe des Auftraggebers (Logo-Datei und Fotos des Stammhauses, 27.09.2026) ersetzt die frühere Richtung „Flakon und Licht“ (Kandidat 3, Seed 86f74b39) als Welt; aus ihr bleiben die Signaturen: Größenwahl als Flakon-Silhouetten mit Füllstand in der Farbe des Dufts, Duftnoten als Flüssigkeitsschichten. Neu: Rundbogen (Filialseite). Seitenstruktur der Startseite nach einer Vorlage des Auftraggebers (Modehaus-Layout, nur Struktur, Farben und Schriften bleiben). Kein neuer Concept-Roll, da Welt und Struktur gepinnt sind.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions
- Logo (Datei) und ein Foto des Eingangs liegen vor; offizielle CI-Werte (Farbcodes, Hausschrift) und hochaufgelöste Fotos fehlen noch. Das Logo-Rot der Datei ist #ff0000, die Bedienfarbe #e30613 ist daraus für Kontrast abgeleitet.
- Build path: code-led (keine Bildgenerierung verfügbar).
