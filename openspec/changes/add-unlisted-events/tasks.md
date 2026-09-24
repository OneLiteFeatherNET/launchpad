# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `feat(events): …`, Tests im selben Commit wie der Code,
den sie treiben.

## 1. Schema und Inhaltsprüfung

- [x] 1.1 In `tests/content/events-frontmatter.spec.ts` Fälle für `unlisted: true` (akzeptiert), `unlisted: true` + `promote: false` (akzeptiert), `unlisted: true` + `promote`-Objekt (abgelehnt, Meldung nennt Datei, `unlisted` und `promote`) und abweichendes `unlisted` bei gleichem `translationKey` (abgelehnt, Meldung nennt beide Dateien) ergänzen und rot sehen; verifiziert durch `pnpm exec vitest run tests/content/events-frontmatter.spec.ts`
- [x] 1.2 `unlisted: z.boolean().optional()` in `eventsSchema` (`content.config.ts`) aufnehmen und die Prüfregeln aus 1.1 umsetzen; verifiziert durch grüne Tests aus 1.1 und `tests/content/schema-columns.spec.ts`

## 2. Gemeinsame Sichtbarkeitsregel

- [x] 2.1 In `tests/shared/eventPhase.spec.ts` (tatsächlicher Pfad der bestehenden Datei; `tests/events/eventPhase.spec.ts` existiert nicht) `isEventListedAt` und `isEventReachableAt` für jede Phase × `unlisted` (true/false/undefined) mit festem `now` spezifizieren und rot sehen; verifiziert durch `pnpm exec vitest run tests/shared/eventPhase.spec.ts`
- [x] 2.2 Beide Prädikate in `shared/utils/eventPhase.ts` umsetzen (oberste Ebene, ohne Vue/H3, ohne `Date.now()`); verifiziert durch grüne Tests aus 2.1
- [x] 2.3 In `tests/shared/eventRoutes.spec.ts` (tatsächlicher Pfad; s.o.) einen Fall „laufendes, nicht gelistetes Event fehlt in den Sitemap-Einträgen“ ergänzt, dann `EventSitemapSource` um `unlisted?: boolean` erweitert und `visibleEventSitemapEntries` auf `isEventListedAt` umgestellt; verifiziert durch `pnpm exec vitest run tests/shared/eventRoutes.spec.ts`
- [x] 2.4 `server/api/__sitemap__/events.ts` reicht `unlisted` aus der Collection durch (strukturell bereits der Fall, da `EventDocument` das Feld jetzt trägt, kein Codeänderung nötig); verifiziert durch `pnpm build` und `curl http://localhost:8787/api/__sitemap__/events` in `pnpm preview` mit einem temporären `unlisted: true`-Test-Event — Antwort `[]`, Event danach entfernt (siehe 4.4 / Bericht für Details)

## 3. Übersicht und Carousel

- [x] 3.1 In `tests/events/event-lists.spec.ts` Fälle ergänzt: nicht gelistete Events fehlen in allen drei Gruppen von `groupEventsAt` und in `promotedEventsAt`, auch mit `promote`-Fenster; rot gesehen
- [x] 3.2 `groupEventsAt` und `promotedEventsAt` in `layers/events/utils/eventLists.ts` vorab mit `isEventListedAt` gefiltert; verifiziert durch grüne Tests aus 3.1 und `pnpm exec vitest run tests/events`

## 4. Detailseite

- [x] 4.1 `useEventDetail` entscheidet 404 über `isEventReachableAt`; `EventDetail.phase` wird zu `EventPhase`; ein Composable-Test (`tests/events/event-detail.spec.ts`, nuxt-Environment, `mockNuxtImport('useContentRepository', …)`) belegt: nicht gelistet + `hidden` → Detail mit Phase `hidden`; gelistet + `hidden` → 404; unbekannter Slug → 404. `useRoute`/`useRuntimeConfig`/`useState` mussten nicht gemockt werden — `mountSuspended(Harness, { route })` setzt die echte Route über den echten Router, kein bare-Stub-Risiko. `createError({ fatal: true })` wirft synchron in `setup()`; `mountSuspended` fängt das intern ab statt die Mount-Promise abzulehnen, daher fängt die Test-Harness den Fehler selbst und rendert den Status statt auf eine Rejection zu warten.
- [x] 4.2 `EventPhaseChip` und `EventTestingBlock` akzeptieren `hidden` (Label „Vorschau“/„Preview“ neutral; Feedback-Link wie bei `announced`); `events.phase.hidden` und `events.phase_hint.hidden` in `de.json` und `en.json` ergänzt; verifiziert durch Komponententests in `tests/events/event-components.spec.ts` und die i18n-Schlüsselprüfung der Suite
- [x] 4.3 `pages/events/[...slug].vue`: Vorschau-Hinweis mit `DateRange` für `hidden` und `noindex: event.value?.unlisted === true` an `usePageSeo`. Ein voller Seiten-Mount (`mountSuspended` unter `@vitest-environment nuxt`) scheitert an `defineOgImage is not defined` — das Build-Makro von `nuxt-og-image` wird unter Vitests Nuxt-Environment nicht transformiert, unabhängig von diesem Change. Verifiziert stattdessen per Quelltext-Check (`tests/seo/event-noindex.spec.ts`, gleiches Muster wie `tests/seo/page-titles.spec.ts`), dass `noindex` an `event.value?.unlisted` hängt, plus manuelle Prüfung in `pnpm preview` (siehe Bericht)
- [x] 4.4 End-to-End in `pnpm preview` (`http://localhost:8787`, Port von wrangler frei gewählt) mit einem temporären nicht gelisteten Event (`content/events/{de,en}/temp-preview-check.md`, `unlisted: true`, `announceAt`/`startsAt` in 2099): `/de/events/temp-preview-check` und `/en/events/temp-preview-check` antworten 200 mit „Vorschau“/„Preview“, „Startet am“/„Starts on“ und `<meta name="robots" content="noindex, follow">`; das Event fehlt auf `/de/events` (Leerhinweis „Gerade läuft kein Event“), auf der Startseite und in `/api/__sitemap__/events` (`[]`) sowie in `/__sitemap__/de-DE.xml`; per Playwright-Browser auf beiden Detailseiten geprüft — keine Vue-Hydration-Warnung in der Konsole (nur PostHog-502-Fehler mangels Analytics-Backend im Preview, unabhängig vom Change). Test-Event danach entfernt (`rm -rf content/events`), nicht committet.

## 5. Abschluss

- [x] 5.1 `pnpm test` (79 Dateien, 513 Tests), `pnpm quality` (192 ESLint-Fehler / 17 Warnungen / 3 TS-Fehler, unverändert gegenüber der Baseline) und `pnpm build` laufen grün; `tests/architecture/` (19 Dateien, 76 Tests) bleibt grün
- [x] 5.2 Kommentar in `shared/utils/eventPhase.ts` um den Satz ergänzt, dass `unlisted` und die Phase unabhängige Achsen sind — `unlisted` regelt die Auffindbarkeit, die Phase den Zeitplan (siehe Diff)
- [ ] 5.3 Pull Request gegen `main` mit dem Titel `feat(events): add unlisted events reachable only by link` öffnen (Beschreibung: Zusammenfassung, Screenshot der Vorschau-Kopfzeile, Hinweis, dass `add-events-section` vorher archiviert sein muss)
