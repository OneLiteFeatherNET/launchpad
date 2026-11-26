# Design: Kein Footer-Sprung nach dem Skeleton

## Ursache

`layouts/default.vue` ist bereits eine Flex-Spalte mit `min-h-screen`, der
Hauptbereich hat `flex-1`; bei kurzem Inhalt steht der Footer am unteren
Rand. Gesprungen ist er, weil ein Skeleton höher war als die fertige Seite:
Das zusätzliche `min-h-screen` am Detail-Skeleton plus Kopf und Abstände
schiebt den Footer unter den Viewport, beim Austausch kommt er zurück.

## Lösung

1. `min-h-screen` an Event-, Projekt- und POI-Detail-Skeletons entfernen.
2. Detail-Skeletons enthalten nur, was jede Seite dieses Typs mindestens hat
   (Kopfbild mit festem Seitenverhältnis, Titel, zwei bis drei Textzeilen).
   Fällt der echte Inhalt länger aus, wächst die Seite unterhalb des
   sichtbaren Bereichs; das verschiebt im Viewport nichts.
3. Übersichts-Skeletons zeigen nur so viele Karten, dass sie nicht höher
   werden als die kürzeste reale Liste dieses Typs.

Layout, Abstände und Footer bleiben unverändert; direkte Aufrufe sind
pixelgleich zu `main`.

## Prüfung

- Browser (Playwright mit System-Chrome, `/api/content/**` gedrosselt): CLS
  der Client-Navigation je Seite mit Skeleton, Ziel unter 0,1; Projektseite
  vorher 0,15.
- Screenshots direkter Aufrufe und nach Navigation gegenüber `main`
  unverändert.
