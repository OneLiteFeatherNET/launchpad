# Design: Skeletons auf den übrigen Seiten

## Ausgangslage

| Seite | Abfrage heute | Verhalten beim Seitenwechsel |
|---|---|---|
| Startseite | mehrere `useAsyncData` ohne `await` | rendert sofort, Abschnitte springen herein |
| Team-Übersicht | `useTeamRoster` ohne `await` | rendert sofort ohne Mitglieder |
| Community | `useCommunityOverview` ohne `await` | rendert sofort ohne Inhalte |
| Über uns | `await useAbout()` | blockiert bis die Daten da sind |

Vor der Umsetzung im Code bestätigen; weicht eine Seite ab, gilt der Code.

## Ladeverhalten

- Alle betroffenen `useAsyncData` nutzen `PAGE_DATA_OPTIONS` aus
  `layers/content-core/composables/usePageLoad.ts` (Client-`lazy`, Cache für
  Zurück-Navigation) und geben `status` zurück.
- Die Seite bzw. der Abschnitt zeigt das Skeleton, solange `useIsLoading`
  wahr ist und keine Daten vorliegen.
- Auf dem Server ändert sich nichts: Nuxt wartet auch bei `lazy` auf die
  Daten. Ein Test prüft, dass das Server-HTML kein `aria-busy` enthält.
- `useAbout` verliert das `await` auf der Seite nicht ersatzlos: Die Seite
  liest `status` und zeigt bis dahin das Skeleton. 404 gibt es hier nicht
  (fester Inhalt); fehlt das Dokument, verhält sich die Seite wie heute.

## Startseite

- Je Abschnitt mit eigener Abfrage ein Platzhalter an seiner Stelle
  (Karussell, Highlights, Events-Promotion, FAQ, Sponsoring, OpenCollective),
  jeweils in einer `SkeletonRegion`.
- Das Karussell hat eine feste Höhe bzw. ein festes Seitenverhältnis; der
  Platzhalter übernimmt genau diese Maße. LCP-Bild, Preload und
  `fetchpriority` der Startseite bleiben unverändert (SSR).
- Abschnitte, die heute bei fehlenden Daten ausgeblendet werden, bleiben bei
  leerem Ergebnis ausgeblendet; der Platzhalter erscheint nur während des
  Ladens.

## Skeleton-Komponenten

- Je Seite bzw. Abschnitt eine Komponente im passenden Layer aus den
  Bausteinen `SkeletonBlock`, `SkeletonText`, `SkeletonImage`,
  `SkeletonRegion` in `layers/base`.
- Gleiche Container, Abstände, Rasterspalten und Bildverhältnisse wie die
  fertige Seite; nur vorhandene Tokens.
- Team-Übersicht: Raster der Mitgliederkarten mit der Spaltenzahl der echten
  Seite je Breakpoint.

## Prüfung

- Komponententests: Skeleton bei `pending`, Inhalt bei Daten, kein Skeleton
  bei Daten aus dem Cache.
- Test: Server-HTML der vier Seiten ohne `aria-busy`.
- Browser (Playwright mit System-Chrome, `/api/content/**` gedrosselt):
  Skeleton sofort nach dem Klick, Position der Überschriften gleich zum
  direkten Aufruf, Zurück ohne Skeleton.
- Screenshots der fertigen Seiten (1280 und 390 breit, direkt und nach
  Navigation) unverändert gegenüber `main`.
- Lighthouse mobil gegen den lokalen Production-Build der Startseite: LCP
  und CLS nicht schlechter als auf `main`.

## Risiken

- Startseite ist die LCP-kritischste Seite. Gegenmittel: SSR unverändert,
  Lighthouse-Vergleich vor dem PR.
- Viele Abschnitts-Platzhalter können zusammen höher sein als die fertige
  Seite. Gegenmittel: Maße am echten Layout ausrichten; Rest regelt
  `fix-skeleton-layout-shift`.
