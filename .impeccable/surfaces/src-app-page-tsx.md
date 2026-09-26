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

THESIS: Jeder Duft ist ein Flakon im Licht. Die Seite ist ein hell beleuchteter Verkaufstisch aus Porzellan, auf dem nur das Glas Farbe trägt. Verweigert das Creme-und-Gold-Luxus-Template und das laute Badge-Raster großer Beauty-Shops.

OWN-WORLD: Porzellanweißer Grund, anthrazitfarbene Tinte, 1px-Haarlinien, Flakongrün als einziger UI-Akzent. Farbe entsteht nur aus Flüssigkeiten im Glas: Duftfamilien-Tönungen in Produktbildern, Notenschichten und Duftwelten. Bodoni Moda wie gravierte Etiketten für Display, Mona Sans für UI und Text, breite Versalien nur für Etikett-Labels. Controls 2px Radius, Medien randlos, Schatten nur auf Overlays.

STORY: Besucher verstehen in Sekunden: die Parfümerie Liebe aus Hannover, jetzt online bestellbar. Sie finden per Suche, Marke, Duftfamilie oder Note ihren Duft, sehen Größe, Preis dieser Größe, Verfügbarkeit und Lieferzeit, und bestellen ohne Konto.

FIRST VIEWPORT: Service-Bar 32px oben. Header 72px einzeilig: Wortmarke links, Navigation mittig, Suche/Filiale/Konto/Wunschliste/Warenkorb rechts. Hero: Studio-Stillleben der Flakons rechts über sieben von zwölf Spalten bis zur Viewport-Unterkante; links Headline in Bodoni über zwei Zeilen, ein Satz Unterzeile, Primärbutton „Düfte entdecken" in Flakongrün und Textlink „Neuheiten".

FORM: Kandidat 3 von 7 (Flakon und Licht), Seed 86f74b39 (Roll degraded, keine Challenger). Signature interaction: Größenwahl als Flakon-Silhouetten mit Füllstand in der Farbe des Dufts; Duftnoten als Flüssigkeitsschichten Kopf, Herz, Basis.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions
- Echte Fotos der Parfümerie, Logo und Markenfarben fehlen; Wortmarke typografisch, Fotos als markierte Platzhalter.
- Build path: code-led (keine Bildgenerierung verfügbar).
