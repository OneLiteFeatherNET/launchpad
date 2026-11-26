# Spec Delta

## ADDED Requirements

### Requirement: Seitenwechsel zeigen sofort einen Ladezustand
Bei einer Client-Navigation zu einer Seite mit Content-Daten MUST die neue
Seite rendern, ohne auf die Daten zu warten, und MUST an der Stelle der
Inhalte ein Skeleton zeigen, bis die Daten vorliegen. Liegen die Daten
bereits im Cache, MUST die Seite sie direkt ohne Skeleton zeigen.

#### Scenario: Klick auf einen Blogartikel
- **WHEN** jemand auf der Blogübersicht einen Artikel anklickt und die Daten noch laden
- **THEN** zeigt die Artikelseite ein Skeleton mit Kopfbildfläche, Titelzeilen und Textblöcken
- **AND** sobald die Daten da sind, ersetzt der Artikel das Skeleton

#### Scenario: Zurück zur Übersicht
- **WHEN** jemand vom Artikel zur zuvor besuchten Blogübersicht zurückkehrt
- **THEN** erscheint die Übersicht ohne Skeleton

### Requirement: Der Server rendert vollständige Seiten
Das HTML eines direkten Aufrufs MUST die vollständigen Inhalte enthalten und
MUST NOT ein Skeleton enthalten.

#### Scenario: Direkter Aufruf
- **WHEN** `/de/blog/minecraft2shell-luecke-im-minecraft-client` direkt aufgerufen wird
- **THEN** enthält das HTML Titel und Text des Artikels und kein Skeleton

### Requirement: Fehlende Inhalte bleiben 404
Existiert der angefragte Inhalt nicht, MUST ein direkter Aufruf mit HTTP-Status
404 und der Fehlerseite antworten. Bei Client-Navigation MUST nach dem Laden
die Fehlerseite erscheinen.

#### Scenario: Unbekannter Artikel, direkter Aufruf
- **WHEN** `/en/blog/does-not-exist` direkt aufgerufen wird
- **THEN** antwortet der Server mit Status 404 und der Fehlerseite

#### Scenario: Unbekannter Artikel, Client-Navigation
- **WHEN** ein Link zu `/en/blog/does-not-exist` angeklickt wird
- **THEN** erscheint nach dem Laden die Fehlerseite

### Requirement: Skeletons verschieben das Layout nicht
Ein Skeleton MUST Container, Abstände, Rasterspalten und Bildverhältnisse der
fertigen Seite übernehmen, sodass Titel und Kopfbild beim Wechsel zum Inhalt
nicht springen.

#### Scenario: Artikel erscheint
- **WHEN** die Daten eines Artikels nach dem Skeleton eintreffen
- **THEN** liegen Kopfbild und Titel an derselben Position wie im Skeleton

### Requirement: Ladezustand ist zugänglich und respektiert reduzierte Bewegung
Der Bereich mit dem Skeleton MUST `aria-busy="true"` tragen und einen für
Screenreader lesbaren Ladetext in der Seitensprache enthalten. Bei
`prefers-reduced-motion: reduce` MUST das Skeleton ohne Animation erscheinen.

#### Scenario: Reduzierte Bewegung
- **WHEN** das System reduzierte Bewegung verlangt
- **THEN** ist das Skeleton eine ruhige Fläche ohne Schimmer
