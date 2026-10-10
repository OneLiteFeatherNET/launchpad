# Design: Canonicals ohne Schrägstrich und keine Content-Pfade im Payload

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe `specs/`.

Beobachtet an einem Produktions-Build (`pnpm build`, `pnpm preview`, Stand
`origin/main` `6d938fc`):

- **Canonical und Hreflang kommen vom i18n-Modul** (`experimental.strictSeo`,
  `layouts/default.vue`), nicht aus Composables. Das Modul baut sie in
  `switchLocalePath` (`@nuxtjs/i18n/dist/runtime/routing/routing.js:42`) aus
  Routenname und `route.params`, überlagert mit den Params, die die Seite über
  `useSetI18nParams` veröffentlicht. Die Pfade sind also genau so schräg-
  strichfrei wie die Params.
- **Normale Routen** (`/de/team/themeinerlp/`, `/en/blog/`) liefern einen
  Canonical ohne Schrägstrich: vue-router matcht beide Schreibweisen und
  `params.slug` ist ein String. Das erklärt, warum die Blog-Übersicht
  unauffällig ist.
- **Catch-all-Routen** (`[...slug].vue`) ergeben bei `/en/blog/x/` den Param
  `['x', '']`. Die Composables nehmen `.at(-1)`:
  `layers/blog/composables/useBlogContent.ts:144-156`,
  `layers/community-poi/composables/useCommunityPoi.ts:92-103`,
  `layers/events/composables/useEvents.ts:126-130`. Ergebnis `''` bedeutet
  kein Slug, `useAsyncData` liefert `null`, `useSetI18nParams` wird nie
  gerufen. Die Seite rendert leer (Titel „Title“, kein `<article>`, 200), und
  das Modul fällt auf die rohen Params zurück: Canonical, Hreflang (sogar
  mit dem englischen Slug unter `/de/`) und die Schema.org-`url` enden auf `/`.
  `og:url` fällt auf den Ursprung. Das ist die Ursache für „echte Artikel
  nicht indexiert“: Google sieht für jeden Artikel eine zweite, leere,
  selbstkanonische Seite.
- **Roh-Pfade im Payload**: `layers/content-core/utils/content/nuxtContentAdapter.ts`
  ruft in `getTeamDocument`, `listTeamFaqEntries`, `getServerConcept`,
  `getServerConnect`, `getHomeCarousel`, `getSponsorsDocument`,
  `listFaqEntries`, `getBlogArticleBySlug` und weiteren `.first()`/`.all()`
  ohne `select` auf. Jede Zeile bringt `path` (`/team-faq/en/no-position`)
  und `stem` (`team-faq/en/no-position`) mit, die `useAsyncData` in
  `__NUXT_DATA__` serialisiert. Gemessen: `/en/team` enthält
  `/team-faq/en/process` und `/team-faq/en/no-position`, `/en` enthält
  `server-concept/en/home`, `sponsors/en/home` und `/faq/en/*`, ein Artikel
  enthält `/blog/en/dev-blog-1`. Im sichtbaren HTML (Links, JSON-LD, og)
  steht keiner dieser Strings, und `/de/sponsoring` oder `/en/server-concept`
  gibt es nicht als Seiten: Google rät die URLs aus dem Payload. Ein Template
  liest `path`/`stem` nicht; `ContentRenderer` liest nur `id`, `body`,
  `excerpt`.

## Goals / Non-Goals

**Goals:** eine kanonische Schreibweise ohne `/`, auch ohne den Edge-Redirect;
keine Roh-Pfade im Payload.

**Non-Goals:** Redirects im Code; `id` entfernen (`data-content-id` und
`tests/content/blog-list-projection.spec.ts` verlangen es); `strictSeo`
umbauen; Hreflang-Logik ändern.

## Decisions

1. **Ursache beheben, nicht den Output kaschieren.** `catchAllSegments(param)`
   in `layers/base/utils/catchAllSegments.ts` liefert die nicht leeren
   Segmente eines Catch-all-Params (String oder Array). Die drei Composables
   nutzen sie. Damit rendert die Schrägstrich-Variante den Artikel,
   `useSetI18nParams` läuft, und das i18n-Modul erzeugt Canonical und
   Hreflang ohne `/` und mit dem Slug der jeweiligen Sprache. Beobachtet,
   nicht angenommen: erst die Messung am Build zeigte, dass die Seite leer war.
2. **Verteidigung in `usePageSeo`.** `cleanUrl` gibt über
   `withoutTrailingSlash` (`layers/content-core/utils/canonicalUrl.ts`)
   nie einen Schrägstrich am Ende aus; nur `pathname === '/'` bleibt. Das
   deckt `og:url` und `WebPage.url` für Seiten, die `usePageSeo` nutzen.
   Eine Normierung der i18n-Tags per Unhead-Hook wird nicht gebaut: Nach
   Entscheidung 1 gibt es keine Route mehr, die sie bräuchte, und ein Hook
   würde die Ursache verdecken.
3. **Adapter entfernt `path` und `stem`.** Eine Funktion `withoutRoutes` im
   Adapter wird auf jedes `.first()`/`.all()` angewendet, statt jede Abfrage
   mit `select` auszustatten: Die Schemas (`content.config.ts`) tragen viele
   Felder, und eine handgepflegte Spaltenliste für acht Collections wäre bei
   jedem neuen Feld ein stiller Datenverlust (siehe
   `blog-list-projection.spec.ts`). `path` wird nirgends gelesen
   (`grep` über `layers/`, `pages/`, `shared/`, `server/`; `event.path` und
   `card.path` sind eigene, in `eventLists.ts` abgeleitete Felder).
   Alternative `select` ohne `path`: verworfen aus demselben Grund.
4. **Sitemap unberührt.** Das Sitemap-Modul und die Hooks in
   `content.config.ts` lesen `path` in der Datenbank bzw. serverseitig.

## Risks / Trade-offs

- Ein künftiges Template, das `doc.path` liest, bekommt `undefined`. Der
  Test in `tests/content/adapter-queries.spec.ts` hält das fest; die Route
  einer Seite wird wie in `eventLists.ts` abgeleitet.
- `id` (`faq_en/faq/en/what-is.md`) bleibt im Payload; es ist keine URL.
- Der Edge-Cache hält HTML bis zu ~70 Minuten; die Wirkung erscheint nach
  dem Ablauf.

## Open Questions

Keine.
