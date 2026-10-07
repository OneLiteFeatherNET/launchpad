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
  Zeilen 31 bis 44) leitet Canonical und Hreflang aus `switchLocalePath`
  ab und entfernt Query und Hash. Dynamische Seiten (`pages/blog/[...slug].vue`,
  `useEventDetail`) veröffentlichen ihre Sprach-Slugs über `useSetI18nParams`;
  `pages/team/[slug].vue` tut das nicht, weil der Slug in beiden Sprachen gleich ist.
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
Mapping `Mitglied → Person` nutzt `teamAvatarUrl`, das dazu nach
`content-core` zieht (offene Frage 3). `profilePath` ist `/<locale>/team/<slug>` oder
`/<locale>/blog/author/<slug>`.

Die Inhaltsprüfung (`tests/content/person-slugs.spec.ts`) liest
`content/team/*/home.json`, `content/authors/*.md`, `content/blog/*/*.md` und
`content/events/*/*.md` als Text und prüft Kollision und Auflösbarkeit. Die
Regeln stehen als reine Funktion in der Testdatei, wie bei
`events-frontmatter.spec.ts`, damit Fixture-Fälle denselben Code laufen lassen
wie die echten Dateien.

### D3: Der Autorenfilter ist eine Pfadroute

`pages/blog/author/[slug].vue` zeigt `/<locale>/blog/author/<slug>`. Das
statische Segment `author` schlägt `pages/blog/[...slug].vue`; ein Artikel
mit dem Slug `author` wäre unerreichbar, die Inhaltsprüfung verbietet ihn.
Die Seite liest nur `route.params.slug`; `route.query` kommt nirgends vor,
`tests/architecture/request-independent-render.spec.ts` bleibt unverändert,
und es gibt keine Ausnahme. Gründe gegen `?author=`: die Regel, dass ein
Render nur vom Pfad abhängt, und die Fragmentierung des Edge-Caches (jeder
Query-Wert ein eigener Eintrag, ohne dass `usePageSeo` ihn kennt). Als Pfad
ist jede Autorenseite eine echte, begrenzte, cachebare URL.

Ein Composable `useBlogPostsByAuthor(slug)` (auch für das Team-Profil, D5)
lädt `repo.listBlogArticles(locale)` und filtert mit der reinen Funktion aus
`shared/utils/blogAuthors.ts`. Die Seite löst den Slug mit `usePeople` auf
und wirft `createError({ statusCode: 404, fatal: true })` nach dem `await`,
wenn keine Person aufgelöst wird oder die Liste leer ist (wie
`useTeamProfile`). SEO und i18n wie die anderen dynamischen Seiten:
`usePageSeo` mit eigenem Titel, kein `canonical`-Override, denn `usePageSeo`
leitet ihn aus `switchLocalePath(locale)` ab; die Sprachumschaltung bekommt
den Slug über `useSetI18nParams` (`{ de: { slug }, en: { slug } }`), nur für
Sprachen mit freigegebenen Artikeln, wie `useEventDetail` und `useBlogArticle`
es für ihre Slugs tun. Eine Sprache ohne Artikel erhält keinen Param und
fällt auf die Blog-Übersicht zurück.

*Sitemap*: im Umfang. `server/api/__sitemap__/blog-authors.ts` folgt
`team.ts`: `queryCollection` auf `blog_<locale>`, Locale-Liste direkt aus
`~/layers/content-core/utils/content/locales` (Nitro-Regel aus AGENTS.md,
benannte Ausnahme in `module-boundaries.spec.ts`). Die Freigaberegel
(`releaseDate`/`pubDate`) und das Herauslösen der Autoren-Slugs liegen in
`shared/utils/blogAuthors.ts` (oberste Ebene, von Nitro und App
automatisch importiert, ohne Vue und H3), damit Seite und Sitemap dieselbe
Regel anwenden. Die Quelle wird in `nuxt.config.ts` neben `team` und
`events` eingetragen.

### D4: Filtern im Composable, nicht in der Datenbank

Die Autorenseite lädt `repo.listBlogArticles(locale)` und filtert nach
`author` (String oder Liste) mit der reinen Funktion aus
`shared/utils/blogAuthors.ts`. Bei 8 Artikeln je Sprache braucht es keine neue
Repository-Methode. Die Freigaberegel `isReleased` aus
`useBlogContent.ts` zieht dazu in dieselbe Datei um, damit Seite, Profil und
Sitemap sie teilen; `useBlogContent` importiert sie von dort. Die Autorenseite
zeigt die Karten als einfaches Raster ohne hervorgehobenes erstes Element.

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

### D8: Unbekannt oder leer ist 404

Eine nicht auflösbare Person und eine auflösbare ohne freigegebenen Artikel
ergeben beide 404: Eine nicht vorhandene Person darf keine indexierbare Seite
erzeugen, und eine leere Seite wäre ein Soft-404. Beides folgt derselben
Regel wie die Sitemap-Quelle (D3).

## Risks / Trade-offs

- **Pfadkollision `author`**: ein Artikel mit dem Slug `author` wäre
  unerreichbar. Mitigation: Inhaltsprüfung.
- **Cache-Einträge für beliebige Slugs**: unbekannte Slugs rendern eine
  404-Seite, die laut `server/plugins/error-response-headers.ts` nie gecacht
  wird.
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

1. **Aufgelöst: `teamMembers`.** Das Feld ist nicht ungenutzt
   (`pages/blog/[...slug].vue:18-35` und `:161`, `module-boundaries.spec.ts:~449`,
   `repository.ts:256`), aber kein Inhalt setzt es. Entscheidung: Feld samt
   Komponente `FeaturedTeamMembers`, Seitenblock, Typfeld, Boundary-Testzeile
   und i18n-Schlüssel `blog.featured_team` entfernen (Aufgabe 7.1).
2. **Aufgelöst: Autorenfilter als Pfad.** `/<locale>/blog/author/<slug>`
   statt `?author=` (D3). Gründe: `request-independent-render.spec.ts`
   verlangt, dass kein Render die Query liest, und jede Query wäre ein
   eigener Edge-Cache-Eintrag. Der Test bleibt unverändert.
3. **Aufgelöst: Avatar-Helfer.** `teamAvatarUrl` und `mcUsernameOf` ziehen
   von `layers/team/utils/teamAvatar.ts` nach
   `layers/content-core/utils/teamAvatar.ts` (strukturelle Parameter statt des
   Team-Typs); `layers/team` nutzt sie über den Auto-Import. Außerhalb des
   Layers nutzte niemand den Export aus `layers/team/index.ts`; er entfällt.
4. **Aufgelöst: `schemaOrg.author.name`.** Bleibt in den Artikeln
   unverändert („Phillipp Glanz“); eine Angleichung an die Byline wäre ein
   eigener Change.
5. **Hreflang und Canonical der Autorenseite.** Bei der Umsetzung per
   View-Source prüfen: genau ein Canonical, je Sprache ein Alternate, und
   der Sprachwechsel führt auf `/<de|en>/blog/author/<slug>` oder, ohne
   Artikel in der Zielsprache, auf die Blog-Übersicht.
