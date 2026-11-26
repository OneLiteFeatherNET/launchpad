# Proposal: Skeletons auf den übrigen Seiten

Ausgeliefert als `feat(ui)`.

## Why

Seit `add-skeleton-loading` zeigen Blog, Events, Projekte, Community-POI und
Teamprofil beim Seitenwechsel sofort ein Skeleton. Die übrigen Seiten mit
Content-Daten verhalten sich noch anders:

- Startseite, Team-Übersicht und Community-Seite rufen `useAsyncData` ohne
  `await` auf. Bei einem Seitenwechsel erscheinen sie zuerst ohne ihre
  Inhalte, die Abschnitte springen danach einzeln herein.
- „Über uns“ wartet mit `await` auf die Daten; der Klick wirkt, als sei
  nichts passiert.

Alle Seiten sollen sich beim Seitenwechsel gleich verhalten.

## What Changes

- **Weitere Seiten mit Skeleton**: Team-Übersicht (`/team`), Community-Seite
  (`/community`), „Über uns“ (`/about`) und Startseite zeigen bei einer
  Client-Navigation sofort ein Skeleton in der Form ihres Layouts, solange
  ihre Daten laden.
- **Gleicher Mechanismus**: Die Seiten nutzen `PAGE_DATA_OPTIONS`,
  `useIsLoading` und `SkeletonRegion` aus `add-skeleton-loading`; keine neue
  Ladelogik.
- **Startseite abschnittsweise**: Jeder Abschnitt mit eigenen Daten zeigt
  seinen eigenen Platzhalter an seiner Stelle, statt dass die ganze Seite
  auf alle Abfragen wartet. Der Kopfbereich mit dem Karussell bekommt eine
  Fläche in seiner festen Größe.
- **Direkter Aufruf unverändert**: Das Server-HTML aller Seiten bleibt
  vollständig und ohne Skeleton; LCP-Bild, Preload und `fetchpriority` der
  Startseite ändern sich nicht.
- **Zurück-Navigation ohne Skeleton**, wenn die Daten schon vorliegen.
- Nicht in diesem Change: Seiten ohne Content-Daten (Impressum, Datenschutz,
  Regeln, Join, BlueMap), Änderungen an Abfragen oder an der Server-Route,
  der Footer-Sprung (`fix-skeleton-layout-shift`).

## Capabilities

### Modified Capabilities
- `skeleton-loading`: deckt alle Seiten mit Content-Daten ab.

## Impact

- `pages/index.vue`, `pages/team/index.vue`, `pages/community.vue`,
  `pages/about.vue`.
- Composables `useHomeContent`, `useHomeHighlights`, `useFaqContent`,
  `useEventPromotions`, `useSponsoring`, `useOpenCollective`,
  `useTeamRoster`, `useCommunityOverview`, `useAbout`.
- Neue Skeleton-Komponenten in den Layern `home`, `team`, `about` und für die
  Community-Seite.
- Keine neuen Abhängigkeiten, keine neuen i18n-Schlüssel.
