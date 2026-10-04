# Spec Delta

## ADDED Requirements

### Requirement: Inhalte liegen vor dem Verkehr in D1
Der Produktions-Deploy MUST die Inhalte des Builds in D1 schreiben, bevor die
neue Worker-Version Verkehr erhält. Schlägt das Schreiben fehl, MUST der
Deploy abbrechen.

#### Scenario: Seed erfolgreich
- **WHEN** der Produktions-Deploy läuft
- **THEN** stimmen die Prüfsummen in `_content_info` mit denen des Builds
  überein, bevor `wrangler deploy` ausgeführt wird

#### Scenario: Seed schlägt fehl
- **WHEN** `wrangler d1 execute` mit Exit-Code ungleich 0 endet
- **THEN** wird `wrangler deploy` nicht ausgeführt und der Build gilt als
  fehlgeschlagen

### Requirement: Kein Integritätscheck zur Laufzeit in Produktion
Die Produktions-Worker-Version MUST `runtimeConfig.content.integrityCheck` auf
`false` setzen. Ein Request MUST dafür keine D1-Abfrage auf `_content_info`
und keinen Dump-Import auslösen.

#### Scenario: Kaltes Isolat
- **WHEN** ein frisches Isolat die erste Abfrage einer Collection bedient
- **THEN** enthält der Trace keine Abfrage auf `_content_info`

### Requirement: Veraltete Inhalte werden erkannt
Das System MUST nach einem Deploy prüfen, dass die in D1 gespeicherten
Prüfsummen zum deployten Build passen, und eine Abweichung melden.

#### Scenario: Abweichung
- **WHEN** die Prüfsumme einer Collection in D1 vom Build abweicht
- **THEN** schlägt die Nachprüfung fehl und löst einen Alarm aus
