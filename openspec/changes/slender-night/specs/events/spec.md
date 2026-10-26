# Spec Delta

## ADDED Requirements

### Requirement: Events können wiederkehrende Termine tragen
Ein Event MAY im Frontmatter `sessions` tragen, mit `label`, `first`
(Zeitpunkt mit Offset), `durationMinutes` (positive ganze Zahl) und optional
`repeat: weekly`. Ohne `repeat` SHALL es genau einen Termin geben. Mit
`repeat: weekly` MUST jeder weitere Termin am Kalendertag `first` plus ein
Vielfaches von sieben Tagen zur selben Uhrzeit in `Europe/Berlin` beginnen,
auch über eine Zeitumstellung hinweg. Ein Termin läuft ab genau seinem
Beginn und ist ab genau seinem Ende vorbei.

#### Scenario: Nächster Termin vor dem ersten
- **WHEN** ein Event `sessions.first: 2026-10-31T21:00:00+01:00`, `repeat: weekly` und kein `endsAt` hat und der Zeitpunkt `2026-10-25T12:00:00+01:00` ist
- **THEN** ist der nächste Termin `2026-10-31T21:00:00+01:00`

#### Scenario: Wöchentliche Wiederholung
- **WHEN** dasselbe Event am `2026-11-01T12:00:00+01:00` betrachtet wird
- **THEN** ist der nächste Termin `2026-11-07T21:00:00+01:00`

#### Scenario: Über die Zeitumstellung
- **WHEN** dasselbe Event am `2027-03-29T12:00:00+02:00` betrachtet wird
- **THEN** ist der nächste Termin `2027-04-03T21:00:00+02:00`, also `2027-04-03T19:00:00Z`

#### Scenario: Termin läuft
- **WHEN** dasselbe Event mit `durationMinutes: 180` am `2026-10-31T23:30:00+01:00` betrachtet wird
- **THEN** ist der laufende Termin `2026-10-31T21:00:00+01:00` bis `2026-11-01T00:00:00+01:00`

### Requirement: Termine enden mit dem Event
Ein Termin, der bei oder nach `event.endsAt` beginnt, MUST NOT existieren.
Ein Event ohne `endsAt` SHALL unbegrenzt wiederkehrende Termine haben.

#### Scenario: Letzter Termin des Jahres
- **WHEN** ein Event mit `endsAt: 2026-12-31T23:59:00+01:00` und wöchentlichem Termin ab 31. Oktober am `2026-12-20T12:00:00+01:00` betrachtet wird
- **THEN** ist der nächste Termin `2026-12-26T21:00:00+01:00`

#### Scenario: Kein Termin nach dem letzten
- **WHEN** dasselbe Event am `2026-12-27T12:00:00+01:00` betrachtet wird
- **THEN** gibt es keinen nächsten Termin

### Requirement: Ungültige Termine werden bei der Inhaltsprüfung abgelehnt
Die Inhaltsprüfung der Testsuite MUST mit Dateiname und Feldnamen
fehlschlagen, wenn `sessions.first` keinen Offset trägt, vor
`event.startsAt` oder nicht vor `event.endsAt` liegt, `label` fehlt,
`repeat` einen anderen Wert als `weekly` hat oder `durationMinutes` keine
positive ganze Zahl ist.

#### Scenario: Termin ohne Offset
- **WHEN** eine Event-Datei `sessions.first: 2026-10-31T21:00` enthält
- **THEN** schlägt die Inhaltsprüfung mit Dateiname und `sessions.first` fehl

#### Scenario: Termin vor dem Event
- **WHEN** `sessions.first` vor `event.startsAt` liegt
- **THEN** schlägt die Inhaltsprüfung mit Dateiname, `sessions.first` und `event.startsAt` fehl

### Requirement: Die Detailseite zeigt den nächsten Termin stabil im Server-Render
Hat ein angekündigtes oder laufendes Event einen nächsten Termin, MUST die
Detailseite über dem Block „So nimmst du teil“ einen Abschnitt mit
`sessions.label` und dem vom Server bestimmten Zeitpunkt zeigen
(Europe/Berlin, `<time datetime>`), bei `repeat: weekly` mit Hinweis auf die
Wiederholung. Server-HTML und erster Render im Browser MUST identisch sein
und MUST NOT einen Countdown oder Laufend-Hinweis enthalten. Ohne `sessions`
oder in der Phase *vergangen* MUST kein Abschnitt erscheinen.

#### Scenario: Server-Render
- **WHEN** `/de/events/slender` am 25. Oktober 2026 gerendert wird
- **THEN** enthält die HTML „Slender-Nacht“ und `<time datetime="2026-10-31T20:00:00.000Z">` mit 21:00 MEZ, aber keinen Countdown

#### Scenario: Kampagnenlink
- **WHEN** `/en/events/slender?utm_campaign=halloween-2026` aufgerufen wird
- **THEN** liefert die Seite dieselbe HTML wie ohne Query

### Requirement: Der Browser ergänzt nach dem Mount einen Countdown
Erst nach dem Mount SHALL der Browser den Termin aus der Regel und der
Gerätezeit neu bestimmen und einen Countdown bis zum Beginn oder den Hinweis
„Läuft gerade“ zeigen. Während der Hydration MUST keine Mismatch-Warnung
entstehen. Gibt es nach der Neuberechnung keinen Termin mehr, MUST der
Abschnitt verschwinden.

#### Scenario: Countdown nach dem Mount
- **WHEN** die Seite im Browser um `2026-10-30T18:30:00+01:00` hydriert ist
- **THEN** zeigt der Abschnitt „beginnt in 1 Tag, 2 Stunden“ (en: „starts in 1 day, 2 hours“) ohne Hydration-Warnung

#### Scenario: Veraltete Seite aus dem Cache
- **WHEN** eine am `2026-10-31T20:30:00+01:00` gerenderte Seite (Termin 31. Oktober im Payload) am `2026-11-01T00:10:00+01:00` aus dem Cache geöffnet wird
- **THEN** zeigt der Abschnitt nach dem Mount den Termin `2026-11-07T21:00:00+01:00` mit Countdown

#### Scenario: Termin läuft
- **WHEN** die Seite um `2026-10-31T21:30:00+01:00` geöffnet wird
- **THEN** zeigt der Abschnitt nach dem Mount „Läuft gerade“ statt eines Countdowns

### Requirement: Das Slender-Event läuft bis zum Jahresende unter neutralem Titel
Das Event `slender` MUST `event.endsAt: 2026-12-31T23:59:00+01:00` tragen,
wöchentliche Slender-Nächte ab `2026-10-31T21:00:00+01:00` mit
`durationMinutes: 180`, und in Titel, Zusammenfassung und Text MUST NOT es
sich als reines Halloween-Event oder mit einem Ende am 2. November
beschreiben. Slug und `translationKey` MUST unverändert bleiben.

#### Scenario: Nach Halloween
- **WHEN** `/de/events/slender` am 10. November 2026 aufgerufen wird
- **THEN** ist das Event *laufend*, heißt „Slender: Zurück in den Nebel“, nennt den Termin `2026-11-14T21:00:00+01:00` und zeigt den Teilnahme-Block

#### Scenario: Übersetzung bleibt verknüpft
- **WHEN** auf `/en/events/slender` die Sprache gewechselt wird
- **THEN** führt der Wechsel auf `/de/events/slender`
