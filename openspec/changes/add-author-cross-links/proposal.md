# Proposal: Autoren und Gastgeber mit Team-Profilen verknüpfen

Ausgeliefert als `feat(content)`.

## Why

Wer einen Blogartikel liest, sieht den Autor als Name samt Avatar, aber ohne
Link: Die Byline führt nirgends hin, die Artikelkarte nennt den Autor gar
nicht. Das Team-Profil `/<locale>/team/themeinerlp` existiert, kennt aber
weder die Beiträge noch die Events der Person. Autoren leben heute in einer
eigenen Collection (`content/authors/phillipp-glanz.md`), obwohl dieselbe
Person im Team-Roster steht (`slug: themeinerlp`): zwei Pflegestellen für
eine Identität. Events kennen überhaupt keine Personen, und ein künftiges
Event soll seine Gastgeber nennen und verlinken können.

## What Changes

- **Der Team-Roster ist die Quelle der Wahrheit für Personen.**
  `content/authors/` hält nur noch externe Autoren (Gastautoren ohne
  Team-Mitgliedschaft).
- **Ein Resolver in `content-core`** (`resolvePerson(slug, locale)`) schlägt
  zuerst im Team-Roster nach, dann in den externen Autoren, und liefert eine
  normalisierte Person: `slug`, `name`, `avatar`, `role`, `kind`
  (`'team'` | `'external'`) und `profilePath`. Blog und Events nutzen ihn;
  keine Domäne importiert eine andere.
- **Identität**: Autor `phillipp-glanz` ist Team-Mitglied `themeinerlp`. Alle
  Blogartikel (de und en) wechseln auf `author: themeinerlp`,
  `content/authors/phillipp-glanz.md` entfällt. Die Byline zeigt den
  Team-Namen („TheMeinerLP“); es gibt kein Feld für einen Klarnamen.
- **Byline und Artikelkarte verlinken den Autor.** Team-Autoren führen auf
  `/<locale>/team/<slug>`, externe auf `/<locale>/blog/author/<slug>`. Die
  `ArticleCard` zeigt den Autor neu an.
- **Autorenseite unter einem Pfad** `/<locale>/blog/author/<slug>`
  (`pages/blog/author/[slug].vue`): Autorenkasten (Bio, Links, Avatar; bei
  Team-Autoren ein Link auf das Profil) über der auf den Autor gefilterten
  Liste. Die Seite liest keine Query, ist indexierbar, trägt einen eigenen
  Canonical und hreflang-Alternates und steht in der Sitemap. Ein unbekannter
  Slug und eine Person ohne freigegebenen Artikel antworten mit 404. Kein
  Artikel darf den Slug `author` tragen (Pfadkollision).
- **Team-Profil mit Beiträgen und Events**: Die Seite `/team/<slug>` zeigt
  „Beiträge“ (Artikel mit dem Slug als Autor) und „Events“ (Events, deren
  `hosts` den Slug enthalten, unter der bestehenden Sichtbarkeitsregel).
  Leere Abschnitte entfallen. Zusammengesetzt wird in `pages/team/[slug].vue`.
- **Events erhalten optionales Frontmatter `hosts: string[]`** (Slugs),
  über denselben Resolver aufgelöst und auf der Event-Detailseite verlinkt.
  Platzierungen in den Ergebnissen werden nicht verlinkt.
- **Entfernt**: das Blog-Feld `teamMembers` samt `FeaturedTeamMembers`
  (siehe `design.md`, offene Frage 1: Das Feld hat einen Verbraucher, aber
  keinen einzigen Inhalt, der es setzt).
- **Inhaltsprüfung**: kein Slug in Team und `authors` zugleich; jeder
  `author`- und `hosts`-Slug löst auf.
- Neue UI-Texte in `de` und `en`.
- Nicht in diesem Change: eigene Routen für externe Autoren, Verlinkung von
  Ergebnis-Platzierungen, ein Klarnamen-Feld.

## Capabilities

### New Capabilities

- `person-resolution`: Auflösen eines Slugs zu einer Person (Team zuerst,
  dann extern), Profilpfad je Art, Inhaltsregeln für Autoren- und
  Gastgeber-Slugs.
- `blog-authors`: Autor in Byline und Artikelkarte, Autorenseite
  unter `/blog/author/<slug>` mit Autorenkasten, Canonical, Sitemap und 404.
- `team-profile-contributions`: Abschnitte „Beiträge“ und „Events“ auf dem
  Team-Profil.

### Modified Capabilities

- `events`: Events tragen optional `hosts`, die Detailseite zeigt sie
  verlinkt. Die Capability entsteht mit `add-events-section` (und
  `add-unlisted-events`), das vor diesem Change archiviert werden muss.

## Impact

- `content.config.ts` (`blog.teamMembers` entfällt, `eventsSchema.hosts`,
  Kommentar an `author`)
- `layers/content-core`: neuer Resolver unter `utils/content/`, Zugriff über
  `ContentRepository` (`getAuthorBySlug`, `getTeamDocument`), `index.ts`
  (möglicher neuer Wertexport, `pnpm build` ist Pflicht)
- `layers/blog`: `composables/useBlogContent.ts`, `components/ArticleCard.vue`,
  `components/FeaturedTeamMembers.vue` (entfällt); `pages/blog/index.vue`,
  `pages/blog/[...slug].vue`
- `pages/blog/author/[slug].vue` (neu), `pages/team/[slug].vue`,
  `pages/events/[...slug].vue`
- `shared/utils/blogAuthors.ts` (neu, Freigaberegel und Autoren-Slugs für Seite
  und Sitemap), `server/api/__sitemap__/blog-authors.ts` (neu), `nuxt.config.ts`
  (Sitemap-Quelle)
- `layers/events`: `composables/useEvents.ts` (`useEventDetail`), `types.ts`
- `content/blog/{de,en}/*.md` (Migration), `content/authors/phillipp-glanz.md`
  (entfällt)
- `tests/architecture/module-boundaries.spec.ts`,
  `tests/architecture/request-independent-render.spec.ts` bleibt unberührt,
  neue Tests unter `tests/content/` und `tests/content-core/`
- `i18n/locales/{de,en}.json`
- Keine neuen Abhängigkeiten.
