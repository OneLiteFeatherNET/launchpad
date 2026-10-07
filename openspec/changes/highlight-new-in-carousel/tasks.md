# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der Code.
Ein Pull Request unter `feat(home)`; Commits folgen Conventional Commits
(`feat(projects): …`, `feat(community-poi): …`, `feat(home): …`), ein Typ je Commit, Tests im
selben Commit wie der Code, den sie treiben. Tests folgen F.I.R.S.T.: fester Zeitpunkt
statt Systemzeit, kein Netz, kein Warten, jeder Test baut sein eigenes Fixture.

## 1. `publishedAt` in Schema und Repository

- [x] 1.1 `tests/content/adapter-queries.spec.ts` erweitern: `listProjects`, `listProjectsBySlugs` und die POI-Listen projizieren zusätzlich `publishedAt`; `tests/content/projects-frontmatter.spec.ts`: Projekt-Übersetzungen tragen dasselbe `publishedAt`, ARCR trägt `2026-10-07`; rot sehen
- [x] 1.2 `content.config.ts` (`publishedAt` an `projects` und `community_poi`), `layers/content-core/utils/content/repository.ts` (`ProjectSummary`, `CommunityPoiSummary`, `CommunityPoiDocument`) und `nuxtContentAdapter.ts` umsetzen; `tests/content/schema-columns.spec.ts` bleibt grün; verifiziert durch `pnpm exec vitest run tests/content`
- [x] 1.3 `content/projects/{de,en}/anti-redstoneclock-remastered.md`: `publishedAt: '2026-10-07'`; POIs ohne bekanntes Datum bleiben unverändert; verifiziert durch `pnpm exec vitest run tests/content`

## 2. Reine Auswahl und Slide-Typen

- [x] 2.1 `tests/home/highlights.spec.ts` (Node, fester `now`): Fenster 30 Tage inklusive, Zukunft und fehlendes Datum nicht neu, Reihenfolge, Gleichstand nach `href`, Obergrenze 6, Blog nur freigegeben (`releaseDate ?? pubDate`), Autorennamen aus Personen, `composeSlides` (Events zuerst, Kuratiertes danach, Duplikate nach `href` entfallen, Rückfall ohne Neues), kein `path`/`stem` in den Slides; rot sehen
- [x] 2.2 `layers/home/utils/highlights.ts`, `layers/home/types-carousel.ts` (`ProjectSlide`, `isNew`), `layers/home/index.ts` umsetzen; `layers/events/utils/eventLists.ts`: `announcedAt` an `EventCardData`; verifiziert durch grüne Tests aus 2.1 und `pnpm exec vitest run tests/events tests/architecture`

- [x] 2.3 Auffüllen: `tests/home/highlights.spec.ts` (`recentSlides`, `composeSlides` mit `recent`) rot sehen, dann `recentSlides`, `recentBlogArticles`, `MIN_SLIDES` in `layers/home/utils/highlights.ts`, `recent` in `composables/useHomeHighlights.ts` und `pages/index.vue`; verifiziert durch `pnpm exec vitest run tests/home`

## 3. Darstellung und Barrierefreiheit

- [x] 3.1 `tests/a11y/carousel-live-region.spec.ts` und `tests/home/highlights.spec.ts` erweitern: `getSlideLabel` stellt `carousel.new_label` voran, wenn `isNew`; `tests/i18n`: Schlüssel `carousel.new`, `carousel.new_label`, `carousel.project_*` in de und en; rot sehen
- [x] 3.2 `layers/home/composables/useCarousel.ts`, `components/CarouselItem{Blog,Poi,Event}.vue` (Chip „Neu“), `CarouselItemProject.vue`, `Carousel.vue` (Typ `project`, Preload), `i18n/locales/{de,en}.json`; verifiziert durch grüne Tests aus 3.1 und `pnpm exec vitest run tests/a11y tests/i18n tests/design-system`

- [x] 3.3 Blog-Slide: feste Texte „von“ / „Lesen“ über `carousel.by_author` und `carousel.read` in `i18n/locales/{de,en}.json`; Test rendert den englischen Slide; verifiziert durch `pnpm exec vitest run tests/home tests/i18n`

## 4. Seite und Inhalt

- [x] 4.1 `tests/home/highlights-page.spec.ts` (`// @vitest-environment nuxt`, `original` umwickelt, fester `now` über das Repository-Fixture): `useHomeHighlights` legt `now` und die Slides in die Payload, fragt Blog, POIs, Projekte je einmal und löst Autoren auf; `tests/architecture/home-data-waterfall.spec.ts` ergänzt: `pages/index.vue` ruft `useHomeHighlights` und `composeSlides`; rot sehen
- [x] 4.2 `composables/useHomeHighlights.ts` und `pages/index.vue` umsetzen; `content/carousel/{de,en}/home.json`: handgeschriebene Blog-Slides entfernen, Bildslides bleiben; verifiziert durch grüne Tests aus 4.1 und `pnpm exec vitest run tests/content tests/home tests/architecture`

## 5. Gesamtprüfung

- [ ] 5.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [ ] 5.2 `pnpm preview`: `/de` und `/en` zeigen zuerst den ARCR-Slide mit „Neu“/„New“, danach die kuratierten; kein „Phillipp Glanz“ aus `home.json` im HTML; Slide-Links antworten mit 200

## 6. Pull Request

- [ ] 6.1 Pull Request mit dem Titel `feat(home): highlight content from the last 30 days in the carousel` öffnen (Beschreibung auf Englisch: Zusammenfassung, Regeln, Belege aus 5.2)
