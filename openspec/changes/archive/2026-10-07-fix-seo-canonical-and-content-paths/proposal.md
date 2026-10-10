# Proposal: Canonicals ohne Schrägstrich und keine Content-Pfade im Payload

Ausgeliefert als `fix(seo)`.

## Why

Die Search-Console-Exporte vom 2026-10-07 zeigen zwei Probleme.

1. **Echte Artikel stehen unter „Gecrawlt – zurzeit nicht indexiert“.** Jede
   Seite antwortet mit und ohne abschließenden Schrägstrich mit 200. Auf den
   Catch-all-Routen (`pages/blog/[...slug].vue`,
   `pages/community-poi/[...slug].vue`, `pages/events/[...slug].vue`) ist die
   Schrägstrich-Variante aber nicht nur ein Duplikat, sondern leer: Der Param
   `slug` ist dort `['<slug>', '']`, die Composables nehmen das letzte Segment
   (`''`), finden keinen Inhalt und rendern eine Seite ohne Artikel (Titel
   „Title“, kein `<article>`), HTTP 200, indexierbar, mit Canonical, og:url und
   Hreflang auf die Schrägstrich-URL. Ein Cloudflare-Redirect kommt separat
   an den Edge; der Code soll auch ohne ihn richtig bleiben.
2. **Roh-Pfade von Content-Collections werden gecrawlt und antworten 404**
   (`/team-faq/en/process`, `/server-concept/en/home`, `/sponsors/de/home`,
   `/blog/en/<slug>` und weitere). Sie stehen als `path`/`stem` in jedem
   Dokument, das `queryCollection(...).first()/.all()` ohne Projektion
   liefert, und damit im `__NUXT_DATA__`-Payload, z. B. `/en/team` mit
   `/team-faq/en/no-position`. Kein Template liest diese Felder.

## What Changes

- Catch-all-Param wird zu Segmenten **ohne leere Einträge** (neue reine
  Funktion), in Blog, Community-POI und Events. Die Schrägstrich-Variante
  rendert damit denselben Inhalt, und die vom i18n-Modul erzeugten
  Canonical-, og:url- und Hreflang-Links tragen keinen Schrägstrich mehr.
- `usePageSeo` normiert Canonical, og:url und Schema.org-`url` über eine
  reine Funktion `withoutTrailingSlash` (nur der nackte Ursprung behält `/`).
- Der Content-Adapter entfernt `path` und `stem` aus jeder Zeile, bevor sie
  in die Seitendaten gelangt. Sitemap und `content.config.ts` lesen die
  Spalten weiter aus der Datenbank, nicht aus dem Adapter.
- Neue Tests (rot zuerst), Invarianten-Test gegen künftige Roh-Pfad-Lecks.
- Nicht in diesem Change: Redirects (Cloudflare), Entfernen von `id`
  (`ContentRenderer` und `data-content-id`), Änderungen an `strictSeo`.

## Capabilities

### New Capabilities

- `canonical-urls`: Canonical, og:url, Hreflang und Schema.org-`url` enden
  nie auf `/` (außer am Ursprung), und die Schrägstrich-Variante einer
  Catch-all-Seite zeigt denselben Inhalt.
- `content-payload`: Content-Dokumente tragen keine Roh-Collection-Pfade in
  Seiten-HTML und Payload.

### Modified Capabilities

Keine.

## Impact

- `layers/base/utils/catchAllSegments.ts` (neu)
- `layers/content-core/utils/canonicalUrl.ts` (neu),
  `layers/content-core/composables/usePageSeo.ts`
- `layers/blog/composables/useBlogContent.ts`,
  `layers/community-poi/composables/useCommunityPoi.ts`,
  `layers/events/composables/useEvents.ts`
- `layers/content-core/utils/content/nuxtContentAdapter.ts`
- Tests unter `tests/seo/`, `tests/content/`
- Keine neuen Abhängigkeiten.
