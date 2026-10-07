# Design: Projekte-Bereich

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe `specs/`.

Befunde am Stand `origin/main` (`43bde71`):

- **Muster für lokalisierte Inhalte**: `community_poi` ist eine lokalisierte
  Collection (`content/community-poi/<locale>/**/*.md`) mit `slug`,
  `translationKey`, `alternates` und einem `defineSitemapSchema`-Block, dessen
  `onUrl` den Pfad `/<locale>/community-poi/<slug>` setzt. Das braucht keine
  Nitro-Quelle und keine Ausnahme in `module-boundaries.spec.ts`; die Sitemap-
  Funktion wird in `tests/seo/sitemap-content-hooks.spec.ts` ohne Umgebung
  geprüft.
- **Personen**: `resolvePeople(slugs, locale)` (content-core) löst Slugs über den
  Team-Roster, dann die Collection `authors`; `PersonLink` (base) stellt sie dar.
  `events.hosts` nutzt beides bereits.
- **Repository**: `ContentRepository` trennt Listen (projiziert, ohne `path`/`stem`,
  siehe `fix-seo-canonical-and-content-paths`) von Einzelabfragen
  (`withoutRoutes`). `communityPoiSummaries` projiziert die POI-Karte.
- **Layer-Regel**: Domänen kennen einander nicht; `pages/` und Wurzel-Composables
  verbinden sie. `tests/architecture/*` liest `layers/` dynamisch und erfasst eine
  neue Layer ohne Änderung.
- **Recherche zu ARCR** (öffentlich, Stand 2026-10-07):
  - Dokumentation `https://arcr.onelitefeather.net` (GitBook), u. a.
    `/background/scope-and-non-goals`, `/background/how-detection-works`,
    `/reference/supported-versions`, `/getting-started/detect-your-first-clock`.
  - Repository `https://github.com/OneLiteFeatherNET/AntiRedstoneClock-Remastered`
    (Lizenz AGPL-3.0, Beschreibung: Paper-Plugin, erkennt Redstone-Clocks, meldet
    sie Teammitgliedern im Spiel, per Discord-Webhook oder in der Konsole und
    kann sie optional abschalten oder zerstören). Downloads laut README auf
    Hangar (`https://hangar.papermc.io/OneLiteFeather/AntiRedstoneClock-Remastered`)
    und Modrinth (`https://modrinth.com/plugin/AntiRedstoneClock-Remastered`).
  - Plattformen laut Dokumentation: Paper und Folia unterstützt; Spigot,
    CraftBukkit, Paper-Forks und Hybride nicht; Java 25 oder neuer. Die
    Versionsliste wird nicht übernommen, weil sie sich mit jeder Version ändert
    und die Dokumentation die maßgebliche Quelle ist.
  - Erste GitHub-Veröffentlichung `v1.0.0` am 2024-01-30 (`gh release list`).
  - Der Haupt-Mitwirkende des Repositorys ist `TheMeinerLP` (382 von rund 700
    Beiträgen, Rest überwiegend Bots); er entspricht dem Team-Slug `themeinerlp`.

## Goals / Non-Goals

**Goals:** ein Bereich, der aus Inhalten wächst (neues Projekt = neue Datei);
Verweise zwischen POIs und Projekten ohne Kopplung der Domänen; nur belegte
Angaben.

**Non-Goals:** Karussell-Einträge, ein ARCR-POI, Versions- oder Downloadzähler,
automatisches Spiegeln von GitHub oder der Dokumentation.

## Decisions

1. **Collection `projects_<locale>` wie `community_poi`**, mit
   `asSchemaOrgCollection` und `defineSitemapSchema` (Pfad
   `/<locale>/projects/<slug>`, `lastmod` nur aus `updatedAt`, Alternates aus dem
   Frontmatter). Die Sichtbarkeit hängt nicht von der Zeit ab, deshalb braucht es
   keine Nitro-Quelle und keine benannte Ausnahme.
2. **Schema**: `slug`, `title`, `summary`, `status` (Enum `active | maintenance |
   archived`), optional `logo`, `logoAlt`, `releasedAt` und `updatedAt`
   (`z.coerce.date()`), `platforms: string[]`, `license: string`,
   `links: { docs?, source?, issues?, downloads?: { label, url }[] }`,
   `maintainers: string[]`. Das Feld `projects: string[]` kommt als optionales
   Feld an `communityPoiSchema`. Die Tests in `tests/content/schema-columns.spec.ts`
   bleiben grün, weil `CommunityPoiDocument` das Feld in `repository.ts` ebenfalls
   erhält.
3. **`releasedAt` ist das Datum der ersten stabilen Veröffentlichung** (ARCR:
   `v1.0.0`, 2024-01-30, aus `gh release list`). Es ist ein stabiler Beleg, der
   nicht mit jeder Version gepflegt werden muss. Das Karussell, das das Feld
   später braucht, kann daraus „neu“ nicht ableiten; will es die jüngste Version,
   braucht es ein eigenes Feld. Das ist offen und gehört in den Change, der das
   Karussell erweitert.
4. **Repository-Methoden** (alle in `content-core`):
   - `listProjects(locale): ProjectSummary[]` projiziert `slug`, `title`,
     `summary`, `status`, `logo`, `logoAlt`, `releasedAt`, `platforms`, `license`.
   - `listProjectsBySlugs(locale, slugs): ProjectSummary[]` dieselbe Projektion mit
     `slug IN (...)`; leere Liste ohne Abfrage.
   - `getProjectBySlug` / `getProjectByTranslationKey` liefern das Dokument mit
     `withoutRoutes`.
   - `listCommunityPoisByProject(locale, slug): CommunityPoiSummary[]` liest die
     POI-Karten-Projektion plus `projects`, filtert in JavaScript (die Spalte ist ein
     JSON-Array, `LIKE` auf dem Text wäre unscharf) und gibt die Karten ohne
     `projects` zurück. So bleibt die bestehende Projektion der POI-Listen und des
     Karussells unverändert.
5. **Layer `projects`** hält Typen, die reine Sortierung `sortProjects`, die
   Composables `useProjectsOverview`, `useProjectsBySlugs(slugs)` und
   `useProjectDetail` (404, Sprach-Slugs für den Umschalter wie
   `useCommunityPoiDetail`, Maintainer über `resolvePeople`) sowie
   `ProjectCard`, `ProjectGrid`, `ProjectStatusBadge`. `index.ts` exportiert nur
   Composables und Typen, die über das Repository gehen; kein Wertexport zieht
   `collections.ts` (per `pnpm build` geprüft).
6. **Layer `community-poi` erhält `useCommunityPoisByProject(slug)`**, ein
   `useAsyncData` über die neue Repository-Methode. Die Verbindung geschieht in
   den Seiten: `pages/projects/[...slug].vue` ruft es mit dem Projekt-Slug,
   `pages/community-poi/[...slug].vue` ruft `useProjectsBySlugs(poi.projects)`.
   Keine Layer benennt die andere.
7. **Links** werden mit `ResourceList` (base) dargestellt: Dokumentation und
   Quellcode als `link`, Downloads als `link` mit dem Label aus dem Inhalt.
   Texte der festen Links (Dokumentation, Quellcode, Fehlerverfolgung) stehen in
   `projects.links.*`.
8. **Logo**: ARCR bekommt kein Logo. Das Symbol der Dokumentation liegt nur bei
   GitBook, nicht im Repository oder bei `img.onelitefeather.net`; ein
   kopiertes Bild ohne Herkunft wäre erfunden. Die Karte zeigt ohne Logo einen
   Platzhalter (wie `CommunityPoiCard`); `logo` ist im Schema vorbereitet.
9. **SEO**: `usePageSeo` mit `schemaType: 'ItemPage'` (Detail) und
   `CollectionPage` (Übersicht); die Detailseite ergänzt `SoftwareApplication`
   mit `name`, `description`, `url`, `license`, `datePublished`, `softwareHelp`
   (Dokumentation) und `downloadUrl` (erster Download) nur, wenn vorhanden.
10. **Navigation**: Eintrag `navigation.projects` mit Symbol `['fas','code']` (bereits
    registriert) nach „Events“ und vor „Community“.
11. **Inhaltsprüfungen** als reine Funktionen mit Selbsttest (Muster
    `events-frontmatter.spec.ts`): `tests/content/projects-frontmatter.spec.ts`
    (Pflichtfelder, Slug-Eindeutigkeit, `logo` mit Alt-Text, `https`-Links,
    Übersetzungsfakten), Erweiterung von `person-slugs.spec.ts` um `maintainers`,
    `translation-alternates.spec.ts` um `content/projects`, und
    `tests/content/poi-projects.spec.ts` (Auflösung und gleiche `projects` in
    Übersetzungen).

## Risks / Trade-offs

- Die Fakten zu ARCR stammen aus der öffentlichen Dokumentation und können
  veralten; der Text verweist deshalb für Versionen und Konfiguration auf die
  Dokumentation, statt sie zu spiegeln.
- Ohne ARCR-POI bleibt der Abschnitt „Im Einsatz auf dem Server“ zunächst leer
  und damit verborgen; der Bau folgt als eigener Inhalt.
- Ein einzelnes Projekt macht die Übersicht klein; sie ist auf mehrere
  ausgelegt, der Leerzustand deckt den Fall ohne Projekte.
