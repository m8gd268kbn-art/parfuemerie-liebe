# Bildmaterial und Herkunft

Produktbilder, Duftwelten und das Startseiten-Stillleben sind **lokal erzeugte Platzhalter**. Logo und Foto des Stammhauses hat der Auftraggeber geliefert. Es wurden keine Bilder aus dem Internet übernommen (Stockfotos, Herstellerbilder oder KI-Bilddienste).

## Herkunft

| Pfad | Inhalt | Erzeugt durch | Status |
|---|---|---|---|
| `public/media/products/<slug>/front.webp` | Flakon frontal auf hellem Grund, Flüssigkeit in der Duftfamilienfarbe | `scripts/render-bottles.ts` + `scripts/render/scene.js` (three.js in Headless-Chromium, WebP über sharp) | Platzhalter, ersetzen |
| `public/media/products/<slug>/side.webp` | Flakon seitlich | wie oben | Platzhalter, ersetzen |
| `public/media/products/<slug>/detail.webp` | Detail des Verschlusses | wie oben | Platzhalter, ersetzen |
| `public/media/products/<slug>/lifestyle.webp` | Flakon auf Stein im Streiflicht | wie oben | Platzhalter, ersetzen |
| `public/media/worlds/<familie>.webp` (10) | Duftwelten der Startseite, ein Flakon je Familie | wie oben | darf bleiben oder durch eigene Fotos ersetzt werden |
| `public/media/hero/hero.webp` | Stillleben mit drei Flakons für die Startseite | wie oben (`npm run images:render -- --hero`) | durch ein Foto der Parfümerie ersetzen, sobald vorhanden |
| `public/media/brand/liebe-logo.svg` | Logo: roter Schriftzug „Liebe“ | vom Auftraggeber am 27.09.2026 als PNG (632 × 316 px) im Chat geliefert, mit potrace vektorisiert, Farbe #ff0000 wie in der Datei | durch die offizielle Vektordatei aus den CI-Unterlagen ersetzen |
| `public/media/store/eingang-karmarschstrasse.webp` | Eingang des Stammhauses Karmarschstraße 25 (Markise, Rundbogenfenster, rote Pflanzkübel) | vom Auftraggeber am 27.09.2026 geliefert (1030 × 687 px), nach WebP umgewandelt | **Nutzungsrecht und Fotografen-Nennung klären**; höher aufgelöste Fassung (mindestens 2000 px) nachreichen |
| `src/app/icon.svg`, `src/app/apple-icon.png` | Browser-Icon: Ausschnitt mit dem großen L des Schriftzugs | aus dem vektorisierten Logo zugeschnitten | durch ein offizielles Favicon ersetzen, falls vorhanden |

Die Flakonformen (Kasten, Kugel, Zylinder, Quader) sind generisch und bilden **keine** Originalflakons nach. Farben stammen aus den Duftfamilien in `src/config/catalog.ts`. Alt-Texte der Demo-Produkte enden auf „(Platzhalterbild)“.

Neu rendern: `npm run images:render` (fehlende), `-- --force` (alle), `-- --only=<slug>` (ein Produkt), `-- --hero` (nur Startseite).

## Vor dem Livegang ersetzen

1. **Produktbilder:** echte Fotos oder freigegebene Herstellerbilder (Nutzungsrecht klären, z. B. über den Pressebereich der Marke oder den Großhandel). Upload im Admin unter Produkte → Bilder. Empfohlen: Hochformat 4:5, mindestens 1600 px hoch, heller neutraler Hintergrund, Alt-Text beschreibend.
2. **Foto der Parfümerie:** Admin → Einstellungen → Parfümerie und Kontakt. Derzeit ist das gelieferte Foto des Eingangs hinterlegt (Startseite und Filialseite, im Rundbogen-Rahmen, Hochformat-Ausschnitt). Weitere Fotos vom Verkaufsraum und den Häusern in Celle und Göttingen wären eine gute Ergänzung.
3. **Startseiten-Titelbild:** Admin → Einstellungen → Startseite (Querformat, mindestens 2400 px breit).
4. **Markenlogos:** nur mit Nutzungsrecht (Admin → Marken).
5. **Logo und Favicon:** Das Logo ist aus einer Rastergrafik vektorisiert. Die offizielle Vektordatei und die CI-Farbwerte ersetzen `public/media/brand/liebe-logo.svg` und das Icon.
6. **Nicht verwendet:** Das ebenfalls gelieferte Fassadenfoto mit Weihnachtsschleife (saisonal, erkennbare Passanten, vermutlich Pressefoto). Für eine Weihnachtsaktion wäre es mit geklärtem Nutzungsrecht geeignet.
