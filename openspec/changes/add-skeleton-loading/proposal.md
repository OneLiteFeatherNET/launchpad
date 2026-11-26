# Proposal: Skeleton Loading bei Seitenwechseln

Ausgeliefert als `feat(ui)`.

## Why

Klickt jemand auf der Website einen Link, bleibt heute die alte Seite
stehen, bis die Daten der neuen Seite geladen sind. Es gibt keine
Ladeanzeige. Auf langsamen Verbindungen wirkt der Klick, als sei nichts
passiert, und manche klicken ein zweites Mal.

Seit `query-content-on-server` sind die Daten klein und schnell da. Die Seite
soll trotzdem sofort auf den Klick reagieren: Sie wechselt gleich und zeigt
an der Stelle der Inhalte Platzhalter in der Form des späteren Layouts
(Skeletons), bis die Daten da sind.

## What Changes

- **Sofortiger Seitenwechsel bei Client-Navigation**: Detail- und
  Übersichtsseiten mit Content-Daten (Blogartikel, Blogübersicht,
  Autor:innen, Events, Event, Projekte, Projekt, Community-POI,
  Teamprofil) warten bei einer Client-Navigation nicht mehr auf ihre Daten,
  sondern rendern sofort.
- **Skeletons je Seitentyp**: Platzhalter, die Größe und Anordnung der echten
  Inhalte nachbilden (Kopfbild im Seitenverhältnis, Titelzeilen,
  Textblöcke, Karten im Raster). Kein Layout-Sprung, wenn die Daten kommen.
- **Direkter Aufruf unverändert**: Beim ersten Laden und für Suchmaschinen
  rendert der Server die Seite wie bisher vollständig. Ein Skeleton
  erscheint nie im Server-HTML.
- **404 bleibt 404**: Gibt es den Inhalt nicht, zeigt die Seite wie bisher die
  Fehlerseite; beim direkten Aufruf mit HTTP-Status 404.
- **Zurück-Navigation ohne Skeleton**: Liegen die Daten schon vor (Cache von
  `useAsyncData`), erscheint die Seite direkt.
- **Barrierefreiheit und Bewegung**: Ladezustand für Screenreader
  angekündigt (`aria-busy`, unsichtbarer Text „Lädt …“ / „Loading …“);
  Schimmer-Animation nur ohne `prefers-reduced-motion`.
- Nicht in diesem Change: Ladebalken, Skeletons auf der Fehlerseite,
  Startseite (ihre Daten liegen mit dem ersten Laden vor), Änderungen an
  Datenabfragen oder an der Server-Route.

## Capabilities

### New Capabilities
- `skeleton-loading`: Ladezustand bei Client-Navigation.

## Impact

- Daten-Composables der Layer `blog`, `events`, `projects`,
  `community-poi`, `team` (Ladeverhalten auf dem Client, 404-Behandlung).
- Seiten unter `pages/` mit `await use…()`.
- Neue Skeleton-Komponenten in `layers/base` (Grundbausteine) und je Layer.
- Neue i18n-Schlüssel für den Ladetext.
- Keine neuen Abhängigkeiten.
