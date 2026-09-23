# Tasks

Jede Gruppe entspricht einem eigenen Pull Request (design.md – Migration
Plan). Vor jedem PR gilt: `pnpm test`, `pnpm build` und `pnpm quality` grün;
bei UI-Änderungen Screenshots hell/dunkel im PR. Gruppen 5–7 setzen
Abschnitt 6 der Change `adopt-md3-design-system` voraus, Gruppe 7.2 zusätzlich
Abschnitt 8.

## 1. Modell, Collection und Repository

- [x] 1.1 `events`-Schema (design.md D1) in `content.config.ts` als `defineLocalizedCollections('events', …)` mit `withI18nMeta` und ohne `defineSitemapSchema` anlegen; verifiziert durch `pnpm build` und `tests/content/schema-columns.spec.ts` grün mit einer Beispieldatei je Sprache
- [x] 1.2 `EventDocument` sowie `listEvents`, `getEventBySlug`, `getEventByTranslationKey` in `layers/content-core/utils/content/repository.ts` und `nuxtContentAdapter.ts` ergänzen, Typ über `layers/content-core/index.ts` exportieren; verifiziert durch `tests/content/repository-sort-contract.spec.ts` (erweitert) und `pnpm typecheck` ohne neue Fehler
- [x] 1.3 `layers/events/` mit `nuxt.config.ts`, `types.ts` (`EventEntry`, `EventPhase`, `EventAccessMode`, `EventType`, `EventSubjectKind` aus `EventDocument` abgeleitet) und `index.ts` anlegen; verifiziert durch `module-boundaries.spec.ts` und `layer-name-collisions.spec.ts` grün
- [x] 1.4 `tests/content/events-frontmatter.spec.ts`: Offset-Pflicht an allen Zeitpunkten, Reihenfolge `announceAt ≤ startsAt ≤ endsAt`, `access.url` bei `signup`/`application`, `subject` bei `beta`, gültige Enum-Werte; verifiziert durch je einen absichtlich fehlerhaften Fixture-Fall pro Regel mit Dateiname und Feld in der Meldung

## 2. Phasenlogik und Sitemap

- [x] 2.1 `shared/utils/eventPhase.ts` mit `eventPhaseAt`, `isPromotedAt`, `isAccessOpenAt` (design.md D3) schreiben; verifiziert durch Unit-Tests zu allen Phasengrenzen (exakt auf `announceAt`/`startsAt`/`endsAt`, fehlendes `announceAt`, fehlendes `endsAt`), `promote: false`, einseitig überschriebenem Promotionsfenster und Anmeldefenster
- [x] 2.2 `server/api/__sitemap__/events.ts` nach dem Muster von `team.ts` bauen, in `nuxt.config.ts` unter `sitemap.sources` eintragen und die Boundary-Ausnahme in `module-boundaries.spec.ts` registrieren; verifiziert durch `nuxi build` (Auto-Import von `shared/utils` in Nitro) und einen Test, der für je ein verborgenes, angekündigtes, laufendes und vergangenes Fixture-Event nur die drei sichtbaren URLs liefert
- [x] 2.3 Prüfen, dass die `events`-Collection ohne `defineSitemapSchema` nicht zusätzlich in der erzeugten Sitemap landet; verifiziert durch `pnpm build` + `pnpm preview` und Abruf von `/__sitemap__/de.xml` ohne `/events/`-Einträge für verborgene Fixtures (sonst `exclude` ergänzen und erneut prüfen)

## 3. Gemeinsame Bausteine in `base`

- [x] 3.1 `MediaGallery.vue` aus `CommunityPoiGallery.vue` nach `layers/base/components/` herauslösen, domänenneutral benennen, Buttons auf `M3IconButton`, nur Rollen-Tokens; verifiziert durch Komponententest (Enter öffnet, Pfeile blättern, Escape schließt, Fokus zurück, leere Liste rendert nichts) und `md3-governance.spec.ts` ohne Ausnahme
- [x] 3.2 `ResourceList.vue` in `base` mit den Arten `download`, `link`, `discord`, `schematic` bauen (Schematic-Darstellung aus `CommunityPoiSchematicList.vue` übernehmen); verifiziert durch Komponententest zu `rel="noopener noreferrer"`, Ankündigung „neuer Tab“ und Schematic-Metadaten
- [x] 3.3 `DateRange.vue` (fester `timeZone`, Locale der Seite, gleicher Tag nur einmal, `<time datetime>`) und `EmptyState.vue` in `base` bauen; verifiziert durch Komponententests mit Server-Zeitzone UTC und simuliertem Browser in `America/New_York` (identische Ausgabe) sowie ohne `role="alert"`
- [x] 3.4 `community-poi` auf `MediaGallery` und `ResourceList` umstellen, `CommunityPoiGallery.vue` und `CommunityPoiSchematicList.vue` löschen, `PENDING_MIGRATION`-Einträge entfernen und in `adopt-md3-design-system/tasks.md` Task 10.1 entsprechend anpassen; verifiziert durch `unused-components.spec.ts`, bestehende `poi-*`-Tests grün und Screenshots einer POI-Detailseite vorher/nachher

## 4. Composables des Events-Layers

- [x] 4.1 `useEventsOverview()` schreiben: lädt Events der Locale, berechnet im `useAsyncData`-Handler Phase je Event und gruppiert/sortiert nach Spec (Aktuell `startsAt` ↑, Demnächst `startsAt` ↑, Vergangen `endsAt` ↓), liefert `now` mit; verifiziert durch Unit-Test mit festem `now` und durch Test, dass der Client-Wert aus dem Payload stammt
- [x] 4.2 `useEventDetail(slug)` schreiben: 404 per `createError` für unbekannte und verborgene Events, Phase und `accessOpen` im Handler, `useSetI18nParams` über `translationKey` wie bei POI, Serveradresse für `join.server` über das Repository; verifiziert durch Tests zu 404 (unbekannt, verborgen), fehlender Übersetzung (Sprachwechsel führt zur Übersicht) und Phase aus dem Payload
- [x] 4.3 `useEventPromotions()` schreiben: höchstens zwei beworbene Events (Konstante), nach `startsAt` ↑, als schlichte Objekte mit Detailpfad; verifiziert durch Unit-Tests zu Standardfenster, `promote.from` vor Start, `promote: false` und drei gleichzeitigen Events
- [x] 4.4 Composables in `layers/events/index.ts` exportieren (nur Werte, die clientseitig tragbar sind – AGENTS.md) und `nuxi build` prüfen; verifiziert durch erfolgreichen Build ohne `impound`-Fehler

## 5. Event-Komponenten (MD3)

- [x] 5.1 `EventPhaseChip`, `EventAccessChip` als nicht-interaktive `M3Chip`-Kennzeichnungen und `EventCard` auf `M3Card` (Titel, Zusammenfassung, Typ, `DateRange`, Zugang außer `open`, optionales Bild, stretched link) bauen; verifiziert durch Komponententests (ein Tab-Stopp, keine Button-Rolle der Chips) und Governance-Test ohne Ausnahme
- [x] 5.2 `EventSection` (Überschrift über `SectionHeading`, Raster aus `EventCard`, optionaler `EmptyState`, entfällt ohne Inhalt) bauen; verifiziert durch Komponententest zu leerer Liste mit und ohne Leerhinweis
- [x] 5.3 `EventJoinBlock` bauen: `open` zeigt Serververbindung/Beitrittsweg, `signup` „Anmelden“, `application` „Bewerben“ (je `M3Button` als Link), `invite` Hinweis ohne Aktion, Voraussetzungen als Liste, Hinweistext, Aktion außerhalb des Anmeldefensters deaktiviert mit genannter Frist; verifiziert durch Komponententests je Zugangsart und für geschlossenes Fenster
- [x] 5.4 `EventBuildDetails` (Thema, Abgabeschluss, Ergebnisse), `EventPlayDetails`, `EventAdventureDetails`, `EventBetaDetails` („Closed/Open Beta“ aus `access.mode`, Gegenstand mit Art) bauen, jeweils ohne Felder entfallend; verifiziert durch Komponententests inkl. Beta-Szenario „Grundstücks-Tool“ aus der Spec

## 6. Seiten, i18n und SEO

- [x] 6.1 `pages/events/index.vue` aus `useEventsOverview` und `EventSection` zusammensetzen (Aktuell mit Discord-Leerhinweis, Demnächst, Vergangen), SEO-Titel/Beschreibung/OG setzen, `definePageMeta` gemäß `route-meta-contract.spec.ts`; verifiziert durch Routentest mit Fixtures für „nichts läuft + Archiv“ und „keine Events“ (Status 200)
- [x] 6.2 `pages/events/[...slug].vue` aus `useEventDetail`, Typ-Block, Markdown-Body, `MediaGallery`, `ResourceList` und `EventJoinBlock` zusammensetzen, Phasenhinweis (angekündigt: „startet am“, vergangen: „beendet“, ohne Teilnahme-Block); verifiziert durch Routentests je Phase und 404-Fall
- [x] 6.3 schema.org-`Event` auf der Detailseite (design.md D10) ergänzen; verifiziert durch SEO-Test: genau ein `Event`-Knoten mit `eventStatus`, `eventAttendanceMode`, `VirtualLocation` und keine doppelten Knoten
- [x] 6.4 i18n-Schlüssel (`navigation.events`, Sektionen, Phasen, Zugangsarten, Formate, Gegenstandsarten, Leerhinweis, Aktionen) in `de` und `en` ergänzen; verifiziert durch `tests/i18n`-Suite (keine fehlenden Schlüssel)
- [x] 6.5 Hydration an der Phasengrenze prüfen; verifiziert durch Playwright-Test gegen `pnpm preview`, der eine Seite mit laufendem Fixture-Event rendert, die Browser-Uhr hinter `endsAt` stellt und keine Hydration-Warnung in der Konsole findet

## 7. Navigation und Startseite

- [x] 7.1 Eintrag „Events“ in `layers/navigation/navItems.ts` nach „Community POI“ ergänzen und Icon im FontAwesome-Plugin registrieren; verifiziert durch `fontawesome-registry.spec.ts`, `nav-active-state.spec.ts` (erweitert um `/de/events/<slug>`) und `mobile-menu-focus.spec.ts`
- [x] 7.2 In `pages/index.vue` die Ergebnisse von `useEventPromotions()` in `EventSlide` übersetzen und den redaktionellen Slides voranstellen (erst nach MD3 Abschnitt 8); verifiziert durch Test: laufendes Event ist erster Slide mit Link auf die Detailseite, drei Events ergeben zwei Event-Slides, `carousel-live-region.spec.ts` und `carousel-pause.spec.ts` grün

## 8. Inhalte und Abschluss

- [ ] 8.1 Ein reales vergangenes Event (z. B. ein Bau-Event mit Ergebnissen und Galerie) in `de` und `en` mit gemeinsamem `translationKey` anlegen, Bilder unter `public/` gemäß `image-paths.spec.ts`; verifiziert durch `tests/content`-Suite grün und sichtbares Archiv auf `/de/events`
- [ ] 8.2 Gesamtprüfung: `pnpm build`, `pnpm test`, `pnpm quality` (kein gestiegener Wert), Lighthouse-Accessibility ≥ 0,9 für `/de/events` und eine Detailseite in Hell und Dunkel, Sitemap-Stichprobe gegen `pnpm preview`; Ergebnis im PR dokumentieren
- [ ] 8.3 `AGENTS.md` um den Layer `events` in der Layerliste und `shared/utils/eventPhase.ts` als erste Nutzung von `shared/` ergänzen, `nuxt-content-cms`-Skill um die Events-Collection; verifiziert durch Review, dass keine Aussage dem Code widerspricht

## 9. Anleitungen, Test-Block und Ergebnis

- [x] 9.1 Schema: `results` (summary, placements, stats, outcome) für alle Formate und `testing` (focus, knownIssues, feedbackUrl) ergänzen, `build.results` entfernen; Typen, Frontmatter-Test (Platz ≥ 1, `feedbackUrl`/`testing` nur bei Beta sinnvoll) und Test-Events nachziehen; verifiziert durch `tests/content`-Suite und `pnpm typecheck` ohne neue Fehler
- [x] 9.2 `EventResults` (nur Phase *vergangen*, Platzierungen sortiert, Kennzahlen, „Wie geht es weiter“, sonst „Ergebnisse folgen“) und Sieger auf der Archivkarte (`winner` in `EventCardData`) bauen, Detailseite: Ergebnis direkt unter dem Kopf; verifiziert durch Komponententests zu allen drei Spec-Szenarien
- [x] 9.3 `EventTestingBlock` bauen und bei Betas einbinden („Feedback melden“ nur außerhalb von *vergangen*); verifiziert durch Komponententests zu laufendem und beendetem Test
- [x] 9.4 `EventGuides`/`EventGuide` als MDC-Komponenten bauen (SSR: alle Anleitungen untereinander; nach Mount ARIA-Tabs mit Pfeiltasten und Roving Tabindex; Einzelanleitung ohne Tabs; Icon-Liste auf registrierte FontAwesome-Icons); verifiziert durch Komponententests (Tabs, Tastatur, Einzelfall, Inhalt ohne Mount-Umschaltung vollständig) und Build + Preview mit einem Slender-Test-Event (Rollen Survivor/Slender)
- [x] 9.5 i18n-Schlüssel für Ergebnis, Test-Block und Anleitung in `de`/`en`; verifiziert durch `tests/i18n`-Suite

