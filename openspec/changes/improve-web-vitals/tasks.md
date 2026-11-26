# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `perf(web): …`, Tests im selben Commit wie der Code, den
sie treiben. Nicht anfassen: `package.json`, `pnpm-lock.yaml`, `plugins/`,
`nuxt.config.ts` (gehört zu `slim-client-bundle`).

## 1. Ausgangsmessung

- [ ] 1.1 Produktions-Build von `origin/main` bauen und nach `design.md` („Messung“) messen; Werte notieren

## 2. LCP-Bilder

- [ ] 2.1 Test: Artikel mit Kopfbild rendert `fetchpriority="high"`, kein `loading="lazy"`, genau einen passenden Bild-Preload; Artikel ohne Kopfbild keinen; rot sehen
- [ ] 2.2 `pages/blog/[...slug].vue` umsetzen, `sizes` an die Containerbreite (`max-w-screen-lg`) anpassen; grün
- [ ] 2.3 Test: erste Reihe der Blogübersicht `eager`, erste Karte `fetchpriority="high"`, Rest `lazy`; rot sehen
- [ ] 2.4 `ArticleCard.vue` um eine Priorität erweitern und in der Übersicht setzen; grün
- [ ] 2.5 Test: Preload von Folie 0 und Bild von Folie 0 haben gleiche `sizes` und kompatible `srcset`; rot sehen
- [ ] 2.6 `Carousel.vue`/`CarouselItemImage.vue` angleichen (eine Quelle für `sizes`/Breiten); grün

## 3. Hydration und Listener

- [ ] 3.1 Hydrationskosten messen (Performance-Profil oder `long-tasks`) und Kandidaten für Lazy Hydration festlegen
- [ ] 3.2 Lazy Hydration für die Kandidaten setzen; `tests/architecture/lazy-components.spec.ts` bleibt grün, ggf. erweitern
- [ ] 3.3 Test: Sprachauswahl registriert `document`-Listener erst beim Öffnen und entfernt sie beim Schließen; rot sehen; umsetzen; grün
- [ ] 3.4 Dasselbe für `MediaGallery.vue`

## 4. Interaktionen

- [ ] 4.1 Test: Menü-Umschalten setzt den Zustand sofort und ruft Tracking erst nach dem nächsten Frame; rot sehen
- [ ] 4.2 Kleines Hilfsmittel `afterNextPaint()` (ohne neues Paket) und Einsatz bei Menü, Carousel, Koordinaten-Kopieren; grün

## 5. Felddaten

- [ ] 5.1 Prüfen, ob PostHog auf Production Web Vitals erfasst (Netzwerk, Events); Ergebnis in `design.md` festhalten, nichts am PostHog-Projekt ändern

## 6. Messung und Abschluss

- [ ] 6.1 Nachher nach `design.md` messen; Schritte ohne messbaren Nutzen zurücknehmen; Tabelle Vorher/Nachher in `design.md` und PR-Beschreibung
- [ ] 6.2 `pnpm test`, `pnpm quality`, `pnpm typecheck` und `pnpm build` laufen grün
- [ ] 6.3 Pull Request `perf(web): improve lcp, fcp and inp on home and blog pages` öffnen
