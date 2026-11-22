# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T.: kein Netzwerk, keine Uhr,
frische Fixtures je Test. Builds und Testläufe über `heavy`
(`--max-workers=2`). Branch von aktuellem `origin/main`.

## 1. Tests (rot)

- [ ] 1.1 [Haiku] `tests/home/carousel-image-sizes.spec.ts` (reiner Datei-Lesetest): jede `layers/home/components/CarouselItem*.vue` mit `NuxtPicture` bindet `sizes` an `CAROUSEL_IMAGE_SIZES` und enthält kein `sizes="sm:`-Literal; `Carousel.vue` enthält kein `rel: 'preload'` mehr. Ein Selbsttest zeigt, dass das Muster eine Beispielzeile trifft. Rot sehen
- [ ] 1.2 [Sonnet] `tests/home/carousel-preload.spec.ts` mit `// @vitest-environment nuxt`: `mountSuspended(Carousel)` mit einer Blog-Folie (Bild mit festem Pfad, Provider `none`); aus dem Head genau ein `link[rel=preload][as=image]` mit `fetchpriority="high"`, und dessen `imagesizes` ist gleich dem `sizes` des ersten `<source>` im DOM. Zweiter Fall: Projekt-Folie vorn erzeugt weiterhin nur einen Preload. `useRoute`/`useRuntimeConfig` nur über `mockNuxtImport` mit umhülltem `original`. Rot sehen

## 2. Umsetzung

- [ ] 2.1 [Haiku] `layers/home/utils/carouselImage.ts` mit `export const CAROUSEL_IMAGE_SIZES = 'sm:100vw md:100vw lg:1280px'`; in allen sechs `CarouselItem*.vue` `sizes` daran binden und `:preload="priority ? { fetchPriority: 'high' } : false"` setzen
- [ ] 2.2 [Haiku] `Carousel.vue`: `preloadLink`, das `useHead` und `useImage` entfernen; in `CarouselItemProject.vue` das Logo ohne `:preload`; verifiziert durch grüne Tests aus 1.1/1.2 und `heavy pnpm exec vitest run tests/home tests/architecture`
- [ ] 2.3 [Haiku] Falls 1.2 zeigt, dass `@nuxt/image` 2.2.1 das Objekt nicht durchreicht: Stand im Design festhalten und dem Maintainer vorlegen, statt eine eigene Preload-Logik nachzubauen

## 3. Messung

- [ ] 3.1 [Haiku] `heavy pnpm quality`, `heavy pnpm typecheck`, `heavy pnpm test` (Baseline steigt nicht)
- [ ] 3.2 [Haiku] `NODE_ENV=production heavy pnpm build`; per `curl` auf `/en` prüfen: ein Bild-Preload mit `fetchpriority="high"`, `imagesizes` gleich `<source sizes>`
- [ ] 3.3 [Haiku] Lighthouse 12.8.2 mobile, je drei Läufe, Median, **vorher** (`main`) und **nachher** (Branch) mit gleichem Aufbau. Lokal liefern die Karussellbilder 404 (Provider `none`), daher gegen eine Workers-Version mit `NUXT_IMAGE_PROVIDER=cloudflare` messen (Preview-URL, kein Produktions-Deploy). Berichten: LCP, "fetchpriority=high should be applied", Anzahl Bildanfragen für das LCP-Bild. Gelingt keine solche Version: nur die HTML-Prüfung aus 3.2 und Messung gegen Produktion nach dem Release

## 4. Abschluss

- [ ] 4.1 [Haiku] `.nuxtrc`-Änderungen nicht committen; Commits nur vom Typ `perf(home)`, Tests im selben Commit wie die Umsetzung
- [ ] 4.2 [Haiku] Pull Request gegen `main` mit dem Titel `perf(home): preload exactly the carousel image the browser renders` öffnen. Beschreibung auf Englisch als kurze Domain-Story: was ein Besucher sah (zwei Preloads, das größte Bild wartet), wie es gelöst wurde, Messung vorher/nachher. Keine Session-Links oder Trailer
