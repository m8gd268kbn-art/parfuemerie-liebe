# Bildmaterial und Herkunft

Alle Rasterbilder im Repository sind **lokal erzeugte Platzhalter**. Es gibt keine Fotos, Logos oder Produktabbildungen der Parfümerie Liebe oder der Marken, und es wurden keine Bilder aus dem Internet übernommen (Stockfotos, Herstellerbilder oder KI-Bilddienste).

## Herkunft

| Pfad | Inhalt | Erzeugt durch | Status |
|---|---|---|---|
| `public/media/products/<slug>/front.webp` | Flakon frontal auf hellem Grund, Flüssigkeit in der Duftfamilienfarbe | `scripts/render-bottles.ts` + `scripts/render/scene.js` (three.js in Headless-Chromium, WebP über sharp) | Platzhalter, ersetzen |
| `public/media/products/<slug>/side.webp` | Flakon seitlich | wie oben | Platzhalter, ersetzen |
| `public/media/products/<slug>/detail.webp` | Detail des Verschlusses | wie oben | Platzhalter, ersetzen |
| `public/media/products/<slug>/lifestyle.webp` | Flakon auf Stein im Streiflicht | wie oben | Platzhalter, ersetzen |
| `public/media/worlds/<familie>.webp` (10) | Duftwelten der Startseite, ein Flakon je Familie | wie oben | darf bleiben oder durch eigene Fotos ersetzt werden |
| `public/media/hero/hero.webp` | Stillleben mit drei Flakons für die Startseite | wie oben (`npm run images:render -- --hero`) | durch ein Foto der Parfümerie ersetzen, sobald vorhanden |
| `src/app/icon.svg`, `src/app/apple-icon.png` | Browser-Icon: Flakon mit Amber-Flüssigkeit | von Hand gezeichnet (SVG), PNG über sharp aus dem SVG | vorläufig, bis ein Logo existiert |

Die Flakonformen (Kasten, Kugel, Zylinder, Quader) sind generisch und bilden **keine** Originalflakons nach. Farben stammen aus den Duftfamilien in `src/config/catalog.ts`. Alt-Texte der Demo-Produkte enden auf „(Platzhalterbild)“.

Neu rendern: `npm run images:render` (fehlende), `-- --force` (alle), `-- --only=<slug>` (ein Produkt), `-- --hero` (nur Startseite).

## Vor dem Livegang ersetzen

1. **Produktbilder:** echte Fotos oder freigegebene Herstellerbilder (Nutzungsrecht klären, z. B. über den Pressebereich der Marke oder den Großhandel). Upload im Admin unter Produkte → Bilder. Empfohlen: Hochformat 4:5, mindestens 1600 px hoch, heller neutraler Hintergrund, Alt-Text beschreibend.
2. **Foto der Parfümerie:** Admin → Einstellungen → Parfümerie und Kontakt. Bis dahin zeigt die Filialseite einen gekennzeichneten Bildplatzhalter.
3. **Startseiten-Titelbild:** Admin → Einstellungen → Startseite (Querformat, mindestens 2400 px breit).
4. **Markenlogos:** nur mit Nutzungsrecht (Admin → Marken).
5. **Logo und Favicon:** Die Wortmarke ist typografisch gesetzt (`src/components/layout/logo.tsx`). Existiert ein Logo der Parfümerie Liebe, ersetzt es Wortmarke und Icon.
