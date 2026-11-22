# Proposal: Datumsangaben in einer festen Zeitzone auf Server und Client

Ausgeliefert als `fix(base)`. Pull-Request-Titel:
`fix(base): show dates in one fixed time zone on server and client`

## Why

Blog-Daten (`pubDate`) sind UTC-Mitternacht. Der Worker rendert in UTC, der
Browser rechnet in der Ortszeit des Besuchers. Besucher westlich von UTC
sehen den Vortag, und Server- und Client-HTML weichen ab (Hydration-Mismatch).
Betroffen sind `Top1`, `ArticleCard`, `AuthorPostList`, die Blog-Seite,
`CommunityPoiMeta` (alle über vue-i18n `d()` ohne Zeitzone) sowie
`CarouselItemBlog` und `CarouselItemNews` (`toLocaleDateString` ohne
`timeZone`, der `dateLabel`-Block ist Wort für Wort doppelt) und der
Zeitstempel in `OpenCollectiveStats`. Events (`DateRange`,
`CarouselItemEvent`) setzen die Zeitzone bereits explizit.

## What Changes

- Ein gemeinsamer, domänenfreier Formatierer in `layers/base/utils`
  (`formatDate.ts`) mit expliziter Zeitzone: `formatCalendarDate` (UTC, für
  Kalendertage wie `pubDate`) und `formatInstant` (Europe/Berlin, für echte
  Zeitpunkte).
- Alle oben genannten Aufrufstellen nutzen ihn; die doppelte
  `dateLabel`-Logik der Karussell-Karten entfällt.
- Ein Test sperrt `toLocaleDateString(`/`toLocaleTimeString(`/`toLocaleString(`
  ohne `timeZone` und `d(`-Aufrufe auf Datumswerten in `layers/` und `pages/`.

## Capabilities

### New Capabilities

- `date-formatting`: Datumsausgaben sind unabhängig von der Zeitzone der
  Maschine.

## Impact

- `layers/base/utils/formatDate.ts` (neu), `layers/blog`, `layers/home`,
  `layers/community-poi`, `layers/opencollective`, `pages/blog/[...slug].vue`
- `tests/base/`, `tests/i18n/`
- Sichtbar: Blog-Daten zeigen überall den Kalendertag der Veröffentlichung.
  Keine neuen Abhängigkeiten. `perf/home-lcp-image` berührt dieselben
  Karussell-Dateien (nur Bild/Preload); die Änderungen sind disjunkt.
