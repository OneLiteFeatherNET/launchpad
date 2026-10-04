# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `perf(content): …`, Tests im selben Commit wie der Code,
den sie treiben.

## 1. Single-Document-Collections

- [x] 1.1 Adapter-Test (`tests/content/adapter-queries.spec.ts`, `queryCollection` gemockt): `getTeamDocument`, `getServerConcept`, `getServerConnect`, `getHomeCarousel` rufen `.first()` und nie `.all()`; rot sehen
- [x] 1.2 Die vier Methoden auf `.first()` umstellen; verifiziert durch grüne Tests aus 1.1

## 2. Listenprojektionen

- [x] 2.1 Tests: `listEvents` projiziert auf Kartenfelder inkl. Phasen-Eingaben, ohne `body`; `listCommunityPois` liefert `galleryCount`/`schematicCount` statt der Listen; `getCommunityPoiBySlug` und `getEventBySlug` ohne `.select()`; rot sehen
- [x] 2.2 `EventSummary` und `CommunityPoiSummary` in content-core, Adapter und Konsumenten (`eventLists.ts`, `CommunityPoiCard`/`Grid`) umstellen; verifiziert durch grüne Tests, `pnpm typecheck` und `tests/architecture/`

## 3. Markierte POIs

- [x] 3.1 Test: `listFeaturedCommunityPois` filtert mit `.where('featured', '=', true)` und projiziert; rot sehen
- [x] 3.2 Methode umsetzen und `useHomeContent` darauf umstellen (Filter im Composable entfällt); verifiziert durch grüne Tests

## 4. Autor:innen in einer Abfrage

- [x] 4.1 Tests: Adapter nutzt `IN` und fragt bei leerer Liste nicht ab; `useBlogContent` ruft `listAuthorsBySlugs` einmal und erhält die Frontmatter-Reihenfolge; rot sehen
- [x] 4.2 `listAuthorsBySlugs` umsetzen und `useBlogContent` umstellen; verifiziert durch grüne Tests

## 5. Messung und Abschluss

- [x] 5.1 Payload vor und nach messen (siehe Design, „Messung“) und Zahlen in `design.md` und in die PR-Beschreibung übernehmen
- [x] 5.2 `pnpm test`, `pnpm quality`, `pnpm typecheck` und `pnpm build` laufen grün; Baseline nicht erhöht
- [x] 5.3 Pull Request gegen `main` mit dem Titel `perf(content): slim content queries for uncached renders` öffnen (Beschreibung: Zusammenfassung, je Punkt was und warum, Vorher/Nachher-Tabelle, Abfragen je Rendering, Testergebnis, Link auf diesen Ordner)
