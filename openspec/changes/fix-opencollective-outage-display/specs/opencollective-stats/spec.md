# Spec Delta

## Purpose

Die Spendenstatistik der Startseite zeigt nur echte Zahlen.

## ADDED Requirements

### Requirement: Ein Ausfall wird nicht als Nullstand angezeigt
`/api/opencollective` MUST `available: true` mit den Zahlen liefern, wenn die
Quelle antwortet und ein numerisches `balance` enthält, sonst
`available: false` ohne Zahlen. Die Startseite MUST den Abschnitt
„Spendenziel“ bei `available: false` nicht rendern.

#### Scenario: Quelle antwortet
- **WHEN** die Quelle mit gültigem JSON und `balance` antwortet
- **THEN** ist `available` true und die Zahlen sind die der Quelle

#### Scenario: HTTP-Fehler, Netzwerkfehler oder kaputtes JSON
- **WHEN** die Quelle mit einem Fehlerstatus, gar nicht oder mit ungültigem JSON antwortet
- **THEN** ist `available` false und die Antwort enthält weder `totalRaised` noch `goal`

#### Scenario: Abschnitt bei Ausfall
- **WHEN** die Antwort `available: false` ist
- **THEN** rendert die Startseite keinen Spendenziel-Abschnitt und zeigt keinen Betrag

### Requirement: Ein zwischengespeicherter Ausfall heilt im Browser
Hat der Server „nicht verfügbar“ gerendert, MUST der Browser die Statistik
nach dem Hydrieren einmal neu laden.

#### Scenario: Nachladen
- **WHEN** das Start-HTML ohne Zahlen ausgeliefert wurde und die Quelle wieder antwortet
- **THEN** erscheint der Abschnitt nach dem Hydrieren mit den echten Zahlen
