# Spec Delta

## ADDED Requirements

### Requirement: Alle Seiten mit Content-Daten zeigen beim Seitenwechsel einen Ladezustand
Startseite, Team-Übersicht, Community-Seite und „Über uns“ MUST bei einer
Client-Navigation sofort rendern und MUST an der Stelle noch fehlender
Inhalte ein Skeleton zeigen, bis die Daten vorliegen. Liegen die Daten
bereits im Cache, MUST die Seite sie direkt ohne Skeleton zeigen.

#### Scenario: Klick auf „Team“
- **WHEN** jemand im Menü „Team“ anklickt und die Daten noch laden
- **THEN** zeigt die Team-Übersicht ein Raster aus Platzhalterkarten
- **AND** sobald die Daten da sind, ersetzen die Mitgliederkarten die Platzhalter

#### Scenario: Klick auf „Über uns“
- **WHEN** jemand „Über uns“ anklickt und die Daten noch laden
- **THEN** wechselt die Seite sofort und zeigt ein Skeleton statt der alten Seite

#### Scenario: Zurück zur Startseite
- **WHEN** jemand von einer Unterseite zur zuvor besuchten Startseite zurückkehrt
- **THEN** erscheint die Startseite ohne Skeleton

### Requirement: Die Startseite lädt abschnittsweise
Jeder Abschnitt der Startseite mit eigener Abfrage MUST während des Ladens
einen eigenen Platzhalter an seiner Stelle zeigen. Ein Abschnitt, der bei
leerem Ergebnis ausgeblendet ist, MUST nach dem Laden ausgeblendet bleiben.

#### Scenario: Karussell lädt
- **WHEN** die Startseite per Client-Navigation geöffnet wird und die Karussell-Daten noch laden
- **THEN** steht an der Stelle des Karussells eine Fläche in dessen Größe

### Requirement: Das Server-HTML der Startseite bleibt unverändert
Das HTML eines direkten Aufrufs der Startseite MUST alle Inhalte, das
LCP-Bild mit Preload und `fetchpriority="high"` enthalten und MUST NOT ein
Skeleton enthalten.

#### Scenario: Direkter Aufruf der Startseite
- **WHEN** `/de` direkt aufgerufen wird
- **THEN** enthält das HTML das erste Karussellbild mit Preload und kein `aria-busy`
