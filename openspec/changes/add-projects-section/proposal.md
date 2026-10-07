# Proposal: Projekte-Bereich mit Verknüpfung zu Community-POIs

Ausgeliefert als `feat(projects)`.

## Why

OneLiteFeather entwickelt eigene Software (Plugins, Werkzeuge), die auf dem
Server läuft und öffentlich dokumentiert ist. Auf der Website kommt sie nicht
vor: Wer die Dokumentation, den Quellcode oder den Download sucht, muss die
Projekte anderswo finden, und Bauten auf dem Server, die ein Projekt in Aktion
zeigen, sind nicht mit diesem verbunden.

## What Changes

- **Neue Seiten** `/<locale>/projects` (Übersicht) und
  `/<locale>/projects/<slug>` (Detail): indexierbar, selbst-kanonisch, mit
  hreflang auf die Übersetzung, in der Sitemap und mit Navigationseintrag.
- **Neue Collection `projects`** (lokalisiert wie `community_poi`:
  `content/projects/<locale>/*.md`): `slug`, `translationKey`, `title`,
  `summary`, optional `logo`/`logoAlt`, `status` (`active`, `maintenance`,
  `archived`), `releasedAt`, `platforms`, `license`, `links` (Dokumentation,
  Quellcode, Fehlerverfolgung, Downloads), `maintainers` (Personen-Slugs, über
  den bestehenden Personen-Resolver aufgelöst) und der Markdown-Text als
  Beschreibung.
- **Verknüpfung mit Community-POIs**: ein POI kann `projects: [slug]` im
  Frontmatter tragen („dieser Bau zeigt das Projekt im Einsatz“). Die
  Projekt-Detailseite zeigt dazu den Abschnitt „Im Einsatz auf dem Server“ mit
  den POI-Karten (ohne POIs verborgen); die POI-Detailseite nennt die
  verknüpften Projekte. Die Verbindung beider Domänen liegt in `pages/`.
- **Inhaltsprüfungen**: jeder `projects`-Slug eines POI löst in derselben
  Sprache auf; Übersetzungen mit gleichem `translationKey` tragen dieselben
  `projects`; Projekt-Übersetzungen stimmen in den Fakten überein.
- **Erstes Projekt**: Anti-RedstoneClock Remastered (ARCR), de und en, nur aus
  öffentlichen Angaben (Dokumentation `arcr.onelitefeather.net`,
  GitHub-Repository).
- **Neue Layer `layers/projects`** (Komponenten, Composables über das
  `ContentRepository`, Typen); neue Repository-Methoden mit projizierten
  Listenabfragen in `content-core`. `AGENTS.md` führt `projects` in der
  Layer-Liste.
- Nicht in diesem Change: Karussell-Einträge für Projekte (`releasedAt` ist
  dafür vorbereitet), ein ARCR-POI, Download-Zähler oder Versionslisten.

## Capabilities

### New Capabilities

- `projects-section`: Übersicht, Detailseite, SEO, Sitemap, Navigation.
- `project-content`: Schema, Pflichtangaben, Links, Maintainer, Übersetzungsregeln.
- `poi-project-links`: Verknüpfung von POIs und Projekten in beide Richtungen.

### Modified Capabilities

Keine.

## Impact

- `layers/projects/` (neu): `nuxt.config.ts`, `index.ts`, `types.ts`,
  `utils/projectLists.ts`, `composables/useProjects.ts`,
  `components/ProjectCard.vue`, `ProjectGrid.vue`, `ProjectStatusBadge.vue`
- `layers/community-poi/composables/useCommunityPoi.ts` (+ `useCommunityPoisByProject`)
- `layers/content-core/utils/content/{repository,nuxtContentAdapter}.ts`, `index.ts`
- `content.config.ts` (Collection `projects`, Feld `projects` am POI)
- `content/projects/{de,en}/anti-redstoneclock-remastered.md`
- `pages/projects/index.vue`, `pages/projects/[...slug].vue` (neu),
  `pages/community-poi/[...slug].vue`
- `layers/navigation/navItems.ts`, `i18n/locales/{de,en}.json` (Block
  `projects`, `navigation.projects`)
- `tests/projects/`, `tests/content/`, `tests/architecture/` (ergänzt, nicht gelockert)
- `AGENTS.md`
- Keine neuen Abhängigkeiten.
