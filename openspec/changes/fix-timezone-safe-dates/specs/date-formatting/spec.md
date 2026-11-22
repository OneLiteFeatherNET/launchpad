## ADDED Requirements

### Requirement: Datumsangaben hängen nicht von der Zeitzone der Maschine ab

Jede sichtbare Datumsangabe SHALL mit einer explizit benannten Zeitzone
formatiert werden: Kalendertage in `UTC`, echte Zeitpunkte in
`Europe/Berlin`. Server und Browser SHALL denselben Text erzeugen.

#### Scenario: Blog-Datum westlich von UTC

- **WHEN** ein Beitrag mit `pubDate` 2026-01-15T00:00:00Z von einem Browser in
  `America/Los_Angeles` gerendert wird
- **THEN** zeigt er den 15. Januar, nicht den 14., und stimmt mit dem
  server-gerenderten Text überein

#### Scenario: Kein Aufruf ohne Zone

- **WHEN** der Quelltext unter `layers/` und `pages/` geprüft wird
- **THEN** enthält er kein `toLocaleDateString(`, `toLocaleTimeString(` oder
  `toLocaleString(` ohne `timeZone`
