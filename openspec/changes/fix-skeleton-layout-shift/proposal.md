# Proposal: Kein Footer-Sprung nach dem Skeleton

Ausgeliefert als `fix(ui)`.

## Why

Seit `add-skeleton-loading` (Release 1.43.0) zeigt ein Seitenwechsel ein
Skeleton, bis die Daten da sind. Ist die fertige Seite kürzer als ihr
Skeleton, rutscht der Footer beim Austausch nach oben. Auf der Projektseite
ergab das bei der Prüfung einen Layout-Shift-Wert (CLS) von 0,15; Google
wertet ab 0,1 als „verbesserungswürdig“. Event-, Projekt- und POI-Detail
haben deshalb `min-h-screen` bekommen; das begrenzt den Sprung, verhindert
ihn aber nicht und lässt bei kurzen Seiten eine große leere Fläche.

## What Changes

- **Skeleton nicht höher als die Seite**: Die Detail-Skeletons bilden nur den
  oberen, immer vorhandenen Teil der Seite nach (Kopfbild, Titel, erste
  Textzeilen) statt einer festen langen Fläche. Das pauschale
  `min-h-screen` entfällt.
- **Layout bleibt, wie es ist**: `layouts/default.vue` hält den Footer schon
  heute per `min-h-screen flex flex-col` und `flex-1` am unteren Rand. Ohne
  das `min-h-screen` am Skeleton steht der Footer bei kurzen Seiten während
  und nach dem Laden an derselben Stelle. Direkte Aufrufe ändern sich nicht.
- **Messung**: CLS bei Client-Navigation für alle Seiten mit Skeleton unter
  0,1, gemessen mit gedrosselter Content-Route.
- Nicht in diesem Change: neue Seiten mit Skeleton
  (`extend-skeleton-loading`), Änderungen am Ladeverhalten.

## Capabilities

### Modified Capabilities
- `skeleton-loading`: Layout-Stabilität beim Austausch des Skeletons.

## Impact

- Skeleton-Komponenten in `blog`, `events`, `projects`, `community-poi`,
  `team`.
- Keine neuen Abhängigkeiten.
