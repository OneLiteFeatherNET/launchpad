# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der Code.
Alles ist ein einziger Pull Request unter `feat(projects)`; Commits folgen
Conventional Commits (`feat(projects): …`), Tests im selben Commit wie der Code,
den sie treiben. Tests folgen F.I.R.S.T.: feste Zeitpunkte statt Systemzeit,
kein Netz, kein Warten, jeder Test baut sein eigenes Fixture.

## 1. Schema, Repository und Inhaltsregeln

- [x] 1.1 `tests/content/adapter-queries.spec.ts` erweitern: `listProjects` fragt `projects_<locale>` ab und projiziert genau `slug, title, summary, status, logo, logoAlt, releasedAt, platforms, license` (kein `body`, `path`, `stem`, `links`); `listProjectsBySlugs` nutzt `slug IN` und fragt bei leerer Liste nicht ab; `getProjectBySlug` und `getProjectByTranslationKey` entfernen `path` und `stem`; `listCommunityPoisByProject` liefert nur POIs mit dem Slug in `projects`, ohne das Feld `projects`; rot sehen; verifiziert durch `pnpm exec vitest run tests/content/adapter-queries.spec.ts`
- [x] 1.2 `content.config.ts` (Collection `projects` mit Sitemap-Schema, `projects` am POI-Schema), `layers/content-core/utils/content/repository.ts` (`ProjectDocument`, `ProjectSummary`, Methoden, `projects` an `CommunityPoiDocument`), `nuxtContentAdapter.ts` und `layers/content-core/index.ts` (nur Typen) umsetzen; verifiziert durch grüne Tests aus 1.1, `pnpm exec vitest run tests/content tests/seo`
- [x] 1.3 `tests/seo/sitemap-content-hooks.spec.ts` um den `onUrl` der Projekte erweitern (Pfad `/<locale>/projects/<slug>`, `lastmod` nur aus `updatedAt`, Alternates mit Regionstags, kein `changefreq`/`priority`); rot sehen, dann grün durch 1.2
- [x] 1.4 `tests/content/projects-frontmatter.spec.ts` (reine Funktionen mit Selbsttest): Pflichtfelder, gültiger `status`, `logo` mit `logoAlt`, `https`-URLs in `links`, eindeutiger Slug je Sprache, `translationKey` in beiden Sprachen, gleiche Fakten in Übersetzungen; `tests/content/poi-projects.spec.ts`: jeder `projects`-Slug eines POI löst in derselben Sprache auf, Übersetzungen tragen dieselben `projects`; `tests/content/person-slugs.spec.ts` um `maintainers` und `tests/content/translation-alternates.spec.ts` um `content/projects` erweitern; rot sehen (Selbsttests mit fehlerhaften Fixtures), die Inhaltsdatei folgt in 5.1

## 2. Layer `projects`

- [x] 2.1 `tests/projects/project-lists.spec.ts` schreiben: `sortProjects` stellt `active` vor `maintenance` vor `archived`, innerhalb des Status das jüngere `releasedAt` zuerst, ohne Datum zuletzt, dann nach Titel; verändert die Eingabe nicht; rot sehen
- [x] 2.2 `layers/projects/{nuxt.config.ts,index.ts,types.ts}` und `layers/projects/utils/projectLists.ts` umsetzen; Typen aus `#layers/content-core/types`; verifiziert durch grüne Tests aus 2.1 und `pnpm exec vitest run tests/architecture`
- [x] 2.3 `tests/projects/composables.spec.ts` (`// @vitest-environment nuxt`, `useContentRepository` per `mockNuxtImport` mit Attrappe, `original` umhüllt): `useProjectsOverview` sortiert und fragt die Sprache der Seite ab; `useProjectsBySlugs` fragt nichts bei leerer Liste ab; `useProjectDetail` wirft 404 (`fatal: true`) bei unbekanntem Slug, löst Maintainer in Reihenfolge auf und überspringt unbekannte; rot sehen
- [x] 2.4 `layers/projects/composables/useProjects.ts` umsetzen (Sprach-Slugs für den Umschalter über `useSetI18nParams`, Übersetzung per `translationKey`); verifiziert durch grüne Tests aus 2.3 und `pnpm exec vitest run tests/routes`
- [x] 2.5 `tests/projects/components.spec.ts` (`// @vitest-environment nuxt`): `ProjectCard` hat genau einen Link auf `/de/projects/<slug>`, zeigt Titel, Kurzbeschreibung und Status, Platzhalter ohne Logo, Logo mit `alt` aus `logoAlt`; `ProjectGrid` rendert eine `ul` mit je Projekt einem `li` und einen Leerzustand ohne Projekte; rot sehen
- [x] 2.6 `ProjectCard.vue`, `ProjectGrid.vue`, `ProjectStatusBadge.vue` mit M3-Bausteinen und Tokens umsetzen, Texte unter `projects.*` in `i18n/locales/{de,en}.json`; verifiziert durch grüne Tests aus 2.5, `pnpm exec vitest run tests/i18n tests/design-system tests/a11y`

## 3. Verbindung mit Community-POIs

- [x] 3.1 `tests/projects/poi-link.spec.ts` (`// @vitest-environment nuxt`): `useCommunityPoisByProject(slug)` fragt `listCommunityPoisByProject` mit Sprache und Slug; `tests/projects/pages.spec.ts` (liest die Quelle): `pages/projects/[...slug].vue` ruft `useCommunityPoisByProject` und zeigt den Abschnitt nur bei `pois.length`, `pages/community-poi/[...slug].vue` ruft `useProjectsBySlugs` und zeigt den Abschnitt nur bei Treffern; rot sehen
- [x] 3.2 `useCommunityPoisByProject` in `layers/community-poi/composables/useCommunityPoi.ts` und `layers/community-poi/index.ts` umsetzen; verifiziert durch grüne Tests aus 3.1 (Seiten folgen in 4.2 und 4.3)

## 4. Seiten und Navigation

- [x] 4.1 `tests/projects/pages.spec.ts` erweitern (liest die Quelle): beide Seiten haben genau einen `h1`, rufen `usePageSeo` mit Titel und `useBreadcrumbs`, lesen keine Query; die Detailseite nutzt `ResourceList`, `PersonLink` und setzt den Abschnitt „Im Einsatz“ nur bei vorhandenen POIs; `tests/architecture/nav-active-state.spec.ts`/`navConfig`: Eintrag `routeName: 'projects'` vor `community`; rot sehen
- [x] 4.2 `pages/projects/index.vue` und `pages/projects/[...slug].vue` umsetzen (Schema.org `ItemList` bzw. `SoftwareApplication`, Breadcrumbs, Abschnitt „Im Einsatz auf dem Server“ mit `CommunityPoiGrid`); verifiziert durch grüne Tests aus 4.1 und `pnpm exec vitest run tests/seo tests/a11y tests/routes`
- [x] 4.3 `pages/community-poi/[...slug].vue`: Abschnitt mit `ProjectGrid` nach dem Beschreibungstext; `layers/navigation/navItems.ts` und `navigation.projects` in `i18n/locales/{de,en}.json`; verifiziert durch grüne Tests aus 4.1 und `pnpm exec vitest run tests/architecture tests/i18n`

## 5. Inhalt und Dokumentation

- [x] 5.1 `content/projects/de/anti-redstoneclock-remastered.md` und `content/projects/en/anti-redstoneclock-remastered.md` schreiben (nur Angaben aus der Dokumentation und dem Repository, mit `alternates`, `translationKey: arcr`, `releasedAt: 2024-01-30`, `maintainers: [themeinerlp]`); verifiziert durch grüne Tests aus 1.4 und `pnpm exec vitest run tests/content`
- [x] 5.2 `AGENTS.md`: `projects` in die Layer-Liste aufnehmen; verifiziert durch Durchsicht

## 6. Gesamtprüfung

- [x] 6.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [x] 6.2 `pnpm preview`: `/de/projects`, `/en/projects` und beide ARCR-Detailseiten antworten mit 200, genau ein Canonical ohne Schrägstrich, hreflang auf die Übersetzung, Links auf Dokumentation und Quellcode; ein unbekannter Slug antwortet mit 404; die Sitemap listet die Detailseiten; die Navigation trägt den Eintrag; mit vorübergehendem `projects: [anti-redstoneclock-remastered]` an einem POI zeigen beide Richtungen die Verknüpfung (danach zurückgesetzt, nicht committet)

## 7. Pull Request

- [ ] 7.1 Pull Request mit dem Titel `feat(projects): add a projects section linked to community points of interest` öffnen (Beschreibung auf Englisch: Zusammenfassung, Begründung, Belege aus 6.2; Hinweis, dass der ARCR-POI folgt)
