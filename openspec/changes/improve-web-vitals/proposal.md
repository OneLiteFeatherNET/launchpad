# Proposal: Bessere Web Vitals (LCP, FCP, INP)

Ausgeliefert als `perf(web)`.

## Why

Lighthouse mobil gegen Production (1.42.0, 2026-11-26, n=3 je Seite, Median):

| Seite | Perf | FCP | LCP | TBT | LCP-Element | Load Delay |
|---|---|---|---|---|---|---|
| `/de` | 84 | 2,93 s | 3,52 s | 128 ms | Carousel-Slide 0 | 570 ms |
| `/en` | 84 | 2,93 s | 3,46 s | 165 ms | Carousel-Slide 0 | 1169 ms |
| `/en/blog` | 84 | 2,92 s | 3,52 s | 182 ms | Bild der ersten Artikelkarte | 3643 ms (ein Lauf) |
| `/de/blog/<artikel>` | 84 | 2,94 s | 3,47 s | 167 ms | Kopfbild des Artikels | 1145 ms |

FCP liegt auf allen Seiten gleich bei rund 2,9 s; render-blockierende
Ressourcen meldet Lighthouse keine. Das spricht für Bytes vor dem ersten
Paint (HTML mit 114 KB Inline-CSS, 49 `modulepreload`-Links mit zusammen
rund 219 KB Brotli). Das behandelt `slim-client-bundle`.

Was die Zahlen zeigen:

- **LCP auf Blogseiten**: Das Kopfbild eines Artikels (`pages/blog/[...slug].vue`)
  hat weder `preload` noch `fetchpriority`; der Browser entdeckt es erst beim
  Parsen. Die erste Karte der Blogübersicht lädt mit `loading="lazy"`
  (`layers/blog/components/ArticleCard.vue`), obwohl sie das LCP-Element ist.
- **LCP auf der Startseite**: Slide 0 wird vorgeladen, aber `imagesizes` des
  Preloads (`Carousel.vue`) weicht von `sizes` des Bildes
  (`CarouselItemImage.vue`) ab. Der Browser kann eine andere Breite vorladen
  als die, die er dann anzeigt; die Render Delay liegt bei bis zu 900 ms.
- **INP**: Lighthouse misst INP nicht; TBT und lange Tasks sind der Ersatz.
  Lange Tasks entstehen bei der Hydration (bis 210 ms in einem Seiten-Chunk)
  und beim Auswerten des Dokuments (150 ms). Komponenten ohne Interaktion
  oberhalb und unterhalb des Falzes hydrieren sofort; globale Listener
  (Sprachauswahl, Galerie) hängen ab dem Mount am `document`. Felddaten zu
  INP liegen uns nicht vor.

Bundle-Größe, Abhängigkeiten und CSS-Einbindung behandelt der Change
`slim-client-bundle`; dieser Change fasst sie nicht an.

## What Changes

- **LCP-Bild im Blogartikel priorisiert**: Kopfbild mit `preload`,
  `fetchpriority="high"` und `loading="eager"`, `sizes` passend zur
  tatsächlichen Breite des Artikelcontainers.
- **Erste Artikelkarte nicht lazy**: Die Blogübersicht gibt der ersten Karte
  (bzw. den Karten im ersten sichtbaren Raster) `loading="eager"` und
  `fetchpriority="high"`; alle weiteren bleiben `lazy`.
- **Carousel-Preload passt zum Bild**: `imagesizes`/`imagesrcset` des
  Preloads für Slide 0 entsprechen exakt `sizes`/`srcset` des gerenderten
  Bildes; ein Test hält beide gleich.
- **Weniger Hydrationsarbeit**: Komponenten ohne frühe Interaktion bekommen
  Lazy Hydration (`hydrate-on-visible`, `hydrate-on-idle` oder
  `hydrate-on-interaction`), z. B. `LazySocialMediaShare` im Artikel,
  `SeasonDecor`, Footer-Teile. Welche genau, entscheidet die Messung.
- **Listener erst bei Bedarf**: Sprachauswahl und Galerie registrieren ihre
  `document`-Listener erst beim Öffnen und entfernen sie beim Schließen.
- **Interaktionen geben den Main Thread frei**: Handler, die mehr tun als
  Zustand umzuschalten (Carousel-Wechsel, Menü, Kopieren von Koordinaten),
  rendern zuerst die sichtbare Rückmeldung und schieben Folgearbeit
  (Tracking, Analytics) hinter den nächsten Frame.
- **Felddaten für INP**: Ein Weg, INP, LCP und FCP echter Besucher zu sehen,
  wird geprüft und dokumentiert (PostHog lädt laut Remote-Config bereits
  `web-vitals-with-attribution.js`). Kein neuer Drittanbieter.
- Nicht in diesem Change: Abhängigkeiten, Plugins, `nuxt.config.ts`
  (`css`, `vite`, `features`), Cloudflare-Einstellungen (Bot-Skript),
  PostHog-Projekteinstellungen.

## Capabilities

### New Capabilities
- `web-vitals`: Priorisierung des LCP-Bilds je Seitentyp, Lazy Hydration und
  Interaktionsverhalten.

## Impact

- `pages/blog/[...slug].vue`, `pages/blog/index.vue`,
  `layers/blog/components/ArticleCard.vue`, `layers/home/components/Carousel.vue`,
  `layers/home/components/CarouselItem*.vue`,
  `layers/navigation/components/LanguageSelector.vue`,
  `layers/base/components/MediaGallery.vue`, `layers/season/components/SeasonDecor.vue`,
  weitere Komponenten nach Messung.
- Neue Tests unter `tests/performance/` bzw. bei den Komponenten.
- Keine neuen Abhängigkeiten.
