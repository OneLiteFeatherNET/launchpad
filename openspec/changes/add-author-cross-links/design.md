# Design: Autoren und Gastgeber mit Team-Profilen verknüpfen

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe `specs/`.

Beobachtete Ausgangslage (Stand `origin/main`, `1c9e4fa`):

- **Autoren**: `content.config.ts` kennt `blog.author` (`string | string[]`,
  Zeile 24) und die Collection `authors` (`content/authors/*.md`:
  `slug, name, role, avatar, bio, links`). `useBlogArticle`
  (`layers/blog/composables/useBlogContent.ts`, Zeilen ~183 bis 195) löst die
  Autoren über `repo.listAuthorsBySlugs` auf und verwirft Slugs ohne Treffer.
  Die Byline in `pages/blog/[...slug].vue` (Zeilen ~124 bis 144) zeigt Avatar,
  Namen und Rolle, ohne Link.
- **Team**: `content/team/<locale>/home.json` (`teamSchema`, Zeilen ~122 bis
  160) führt `slug: themeinerlp` mit `name: "TheMeinerLP"`. `useTeamProfile`
  lädt per `repo.getTeamDocument(locale)` und sucht den Slug in `members`.
  `pages/team/[slug].vue` liefert bereits ein Schema.org-`Person` mit
  `@id` aus `personId(site.url, slug)` (`layers/content-core/utils/schema-ids.ts`);
  `useArticleSeo` verwendet dieselbe `@id` für `Article.author`.
- **Inhalt**: alle 15 Artikel unter `content/blog/{de,en}` tragen
  `author: phillipp-glanz`; die Collection `authors` hat genau einen Eintrag.
  Zusätzlich steht in jedem Artikel `schemaOrg.author.name: 'Phillipp Glanz'`
  (siehe offene Frage 4).
- **Events**: `eventsSchema` (Zeile ~309) kennt `unlisted`, aber keine
  Personenfelder. Sichtbarkeit entscheidet `isEventListedAt` in
  `shared/utils/eventPhase.ts`. Auf `main` existiert noch kein Event-Inhalt.
- **`teamMembers`**: `blog.teamMembers` (Zeile 27) wird gelesen von
  `pages/blog/[...slug].vue` (Zeilen 18 bis 35 und der Block
  `<FeaturedTeamMembers>`), `layers/blog/components/FeaturedTeamMembers.vue`
  und `tests/architecture/module-boundaries.spec.ts` (Zeile ~449). Kein
  Inhalt setzt es (`grep` über `content/` ohne Treffer).
- **Canonical**: `usePageSeo` (`layers/content-core/composables/usePageSeo.ts`,
  Zeilen 31 bis 44) entfernt Query und Hash aus dem Canonical und aus jedem
  Hreflang-Eintrag. Eine gefilterte Blog-Übersicht hat daher ohne weiteres
  Zutun den Canonical der ungefilterten.
- **Edge-Cache**: `nuxt.config.ts` cacht `/de/**` und `/en/**` per
  `cloudflare-cdn-cache-control` (3600 s). `tests/architecture/request-independent-render.spec.ts`
  verbietet `route.query`, `useCookie` u. a. in `pages/`, `layouts/`, `layers/`.
- **Architektur**: Fach-Layer importieren einander nicht; nur `pages/`,
  `layouts/`, `app.vue` kombinieren Domänen; nur `content-core` nennt
  `@nuxt/content`. Ein Wertexport aus `layers/content-core/index.ts` darf
  `utils/content/collections.ts` nicht transitiv ziehen (AGENTS.md).

## Goals / Non-Goals

**Goals:**
- Eine Auflösungsregel für Personen, die Blog, Events und Profil teilen.
- Keine neue Kopplung zwischen Fach-Layern.
- Kein Hydration-Mismatch, kein neues 500.

**Non-Goals:**
- Eigene Routen oder Sitemap-Einträge für externe Autoren.
- Klarnamen, Autorenlisten pro Sprache, Verlinkung von Ergebnis-Platzierungen.
- Änderungen an Schema.org-Daten außer der schon vorhandenen `@id`-Verknüpfung.

## Decisions

### D1: Zwei Schichten im Resolver, nur die reine ist im Client-Bundle

`layers/content-core/utils/content/person.ts` enthält die **reine** Funktion
`resolvePersonFrom(slug, locale, { team, authors })` und den Typ `Person`
(`slug, name, avatar?, role?, kind, profilePath`, dazu `bio?` und `links?`
für den Autorenkasten). Sie importiert nur Typen, also weder
`collections.ts` noch `@nuxt/content`. Ein Wertexport über
`layers/content-core/index.ts` ist damit zulässig, bleibt aber über
`pnpm build` zu prüfen (AGENTS.md). Der Zugriff auf Daten liegt in einem
Composable `usePeople(slugs)` in `layers/content-core/composables/`, das über
`useContentRepository()` `getTeamDocument(locale)` und `listAuthorsBySlugs`
liest und die reine Funktion aufruft. `resolvePerson(slug, locale)` ist die
Einzelvariante davon. Beide sind Wertexporte aus `index.ts`.

*Alternativen*: der Resolver im Repository selbst (`ContentRepository.resolvePerson`) –
verworfen, weil Domänenlogik laut Repository-Kommentar in den Composables
bleibt und der Adapter austauschbar sein soll. Eine neue Collection `people`,
die beide Quellen zusammenführt – verworfen: zwei Pflegestellen blieben, und
D1-Migration wäre nötig.

### D2: Team zuerst, Roster als einzige Identität

Die Auflösung prüft `members` des Roster-Dokuments der aktiven Sprache
(`openPosition`-Einträge ausgenommen), danach die externen Autoren. Das
Mapping `Mitglied → Person` nutzt `teamAvatarUrl` nicht selbst (das liegt im
Team-Layer), sondern `avatarUrl` bzw. den `mc-heads.net`-Kopf aus `mcName`
oder `slug`; der Avatar-Helfer wird dazu in `content-core` verfügbar gemacht
(offene Frage 3). `profilePath` ist `/<locale>/team/<slug>` oder
`/<locale>/blog?author=<slug>`.

Die Inhaltsprüfung (`tests/content/person-slugs.spec.ts`) liest
`content/team/*/home.json`, `content/authors/*.md`, `content/blog/*/*.md` und
`content/events/*/*.md` als Text und prüft Kollision und Auflösbarkeit. Die
Regeln stehen als reine Funktion in der Testdatei, wie bei
`events-frontmatter.spec.ts`, damit Fixture-Fälle denselben Code laufen lassen
wie die echten Dateien.

### D3: Der Autorenfilter liest die Query, mit einer registrierten Ausnahme

`useBlogOverview` bekommt den Filter als Parameter, den die Seite aus
`route.query.author` ableitet; die Daten hängen am Cache-Key
`blog-overview-<locale>-<author>`. Das verletzt heute
`tests/architecture/request-independent-render.spec.ts`. Der dortige
Kommentar nennt als Begründung, der Cache-Schlüssel enthalte „path and query
alone“: Eine Query allein ist also nicht das Leck, sondern Cookies, Header
und Nutzer. Vorschlag: genau eine benannte Ausnahme (`pages/blog/index.vue`),
begründet im Test, und ein Test, der prüft, dass `route.query` nur den Wert
`author` liest und dass dieser vor der Verwendung gegen die Slug-Form
(`^[a-z0-9_-]{1,64}$`) geprüft wird. Das begrenzt den Raum der Cache-Einträge
nicht (jeder gültige Slug ist ein eigener Schlüssel), hält aber Ausgabe und
Abfrage klein. Siehe offene Frage 2: Gegenoption ist ein rein clientseitiger
Filter.

### D4: Filtern im Composable, nicht in der Datenbank

Die Blog-Liste lädt weiterhin `repo.listBlogArticles(locale)` und filtert
im Composable nach `author` (`Array.isArray` behandelt). Bei 8 Artikeln je
Sprache braucht es keine neue Repository-Methode; die bestehende
Freigaberegel `isReleased` und die Sortierung bleiben die einzige Quelle.
Das hervorgehobene erste Element (`top1Article`) entfällt bei aktivem Filter
nicht: Die gefilterte Liste wird wie die ungefilterte aufgebaut
(`top1` plus Rest), damit das Layout gleich bleibt.

### D5: Beiträge und Events des Profils werden in der Seite zusammengesetzt

`pages/team/[slug].vue` ruft aus dem Blog-Layer ein Composable
`useBlogPostsByAuthor(slug)` und aus dem Events-Layer
`useEventsByHost(slug)` auf. Beide liefern kleine Kartendaten (Titel,
Pfad, Datum, bei Events Phase), nicht die Dokumente. `useEventsByHost`
filtert mit `isEventListedAt`, entscheidet die Phase im `useAsyncData`-Handler
und gibt sie in der Nutzlast weiter (Hydration, wie in
`add-events-section`, D4). Die Abschnittskomponenten
(`AuthorPostList`, `HostedEventList`) gehören ihrem jeweiligen Layer; die
Seite setzt sie zusammen, `layers/team` bleibt unberührt.

### D6: Ein Verbraucher für Person-Links in drei Layern

Byline (`pages/blog/[...slug].vue`), `ArticleCard` und Event-Detail
brauchen denselben „Name als Link“. Eine Komponente `PersonLink` in
`layers/base/components/` (Prop: normalisierte `Person`, kein Import aus
einem Fach-Layer). Der Typ `Person` kommt aus `content-core`, das `base`
nicht nutzen darf; die Komponente nimmt deshalb strukturelle Props
(`name`, `to`, optional `avatar`, `role`) statt des Typs. Externe Links
(`profilePath` mit Query) bleiben interne `NuxtLink`s mit Locale-Präfix.

### D7: `ArticleCard` bekommt Personen als Prop

`ArticleCard` und `Top1` erhalten `authors` als Prop (Namen und Pfade), die
Seite löst sie einmal pro Übersicht über `usePeople` auf (eine Abfrage für
alle Slugs, nicht eine je Karte). Die Karte stellt den Autorenlink über den
gestreckten Kartenlink (`M3CardLink`), wie die Excerpt-Links es mit
`relative z-10` tun, damit nichts ineinander verschachtelt wird.

### D8: Unbekannter Autor ist ein Leerzustand

Der Filter akzeptiert jeden Slug der erlaubten Form. Ohne Treffer in
`usePeople` und ohne Artikel antwortet die Seite mit 200, Leerzustand und
`noindex` (via `usePageSeo({ noindex })`). Ein 404 würde jede handgebaute
URL zum Fehler machen und widerspricht nicht der `soft-404`-Regel, weil die
Seite dann einen echten Zustand beschreibt, ist aber unnötig. Der Canonical
bleibt `/blog`.

## Risks / Trade-offs

- **Edge-Cache-Fragmentierung durch Query**: jeder Slug ist ein eigener
  Cache-Eintrag. Mitigation: Slug-Form-Prüfung, 200 mit `noindex` statt
  Fehlern, die gecacht würden. Rest-Risiko offen (Frage 2).
- **Client-Bundle**: neue Wertexporte aus `content-core/index.ts`. Mitigation:
  die reine Funktion importiert nur Typen; `pnpm build` ist Teil der Aufgaben.
- **Doppelte Wahrheit im Rollout**: Zwischen Content-Migration und Entfernen
  von `content/authors/phillipp-glanz.md` darf kein Zustand entstehen, in dem
  ein Artikel auf einen nicht auflösbaren Slug zeigt. Beides geschieht im
  selben Commit; die Inhaltsprüfung hält es fest.
- **Team-Roster je Sprache**: Roster-Dateien sind pro Sprache getrennt; ein
  Slug nur in einer Sprache lässt die Auflösung in der anderen scheitern.
  Mitigation: die Inhaltsprüfung löst jeden Slug in jeder Sprache auf, in der
  der Inhalt existiert.
- **Löschen von `FeaturedTeamMembers`**: entfernt eine Funktion ohne Inhalt.
  Falls später Verwendung entsteht, ist `author` mit Liste der Ersatz.

## Migration Plan

1. Resolver, Schema und Tests (rot, dann grün) ohne Inhaltsänderung.
2. Inhalt: 15 Artikel auf `author: themeinerlp`, `content/authors/phillipp-glanz.md`
   löschen – ein eigener Commit.
3. Oberfläche: Byline, Karte, Filter, Profilabschnitte, Event-Gastgeber.
4. Entfernen von `teamMembers` und `FeaturedTeamMembers`.
Kein D1-Schema-Gedächtnis nötig: `@nuxt/content` baut die Tabellen beim
Deploy neu (siehe `seed-d1-at-deploy`); gelöschte Spalte `teamMembers`
verschwindet damit.

## Open Questions

1. **`teamMembers` ist nicht ungenutzt.** Der Auftrag nennt das Feld
   „unused“; im Code liest es `pages/blog/[...slug].vue:18-35`, rendert
   `FeaturedTeamMembers` (`:161`), und `module-boundaries.spec.ts:~449`
   prüft diese Komponente. Kein Inhalt setzt das Feld, daher ist das
   Entfernen folgenlos für die Seite. Annahme dieses Plans: das Feld **samt**
   Komponente, Seitenblock, Typfeld in `repository.ts:256`, der
   Boundary-Testzeile und dem i18n-Schlüssel `blog.featured_team` entfernen.
   Wenn die Komponente bleiben soll, entfällt nur das Schema-Feld nicht.
2. **`?author=` und `request-independent-render.spec.ts`.** Der Test
   verbietet `route.query` in jedem Render; der Autorenfilter braucht es.
   Vorschlag in D3: eine benannte Ausnahme. Alternative: Filter nur im
   Client (SSR zeigt immer die ungefilterte Liste, kein Cache-Thema, aber
   der Filter fehlt dem ersten Render und Crawlern). Entscheidung vor
   Umsetzung nötig.
3. **Avatar-Helfer.** `teamAvatarUrl` liegt in `layers/team/utils/teamAvatar.ts`.
   `content-core` darf `team` nicht importieren. Vorschlag: Funktion nach
   `shared/utils/` (oberste Ebene) oder in `content-core` verschieben und
   vom Team-Layer wiederverwenden. Entscheidung bei der Umsetzung, Test
   `tests/team/…` mitziehen.
4. **`schemaOrg.author.name` in den Artikeln.** Jeder Artikel trägt im
   Frontmatter `schemaOrg: BlogPosting … author: Person „Phillipp Glanz“`,
   während die Byline künftig „TheMeinerLP“ zeigt. Das ist ein Klarname in
   strukturierten Daten, kein Byline-Feld. Dieser Plan lässt es unverändert;
   falls strukturierte Daten und Byline übereinstimmen sollen, ist das ein
   eigener Change.
5. **`hreflang` der gefilterten Liste.** `usePageSeo` entfernt die Query
   schon. Zu prüfen bei der Umsetzung (View-Source), dass genau ein
   Canonical und je Sprache ein Alternate erscheint.
