# Spec Delta

## Purpose

Der PostHog-Session-Recorder gehört nicht zur Ladephase: Er wird erst
geladen, wenn die Sitzung echt ist, und respektiert die Einwilligung.

## ADDED Requirements

### Requirement: Der Recorder lädt nicht während des Seitenaufbaus
Das Skript `posthog-recorder.js` MUST während des initialen Seitenaufbaus
nicht angefragt werden. Es SHALL erst geladen werden, wenn entweder
Nutzer-Interaktion (`pointerdown`, `keydown`, `touchstart`, `scroll`,
`wheel`) stattfand oder seit dem `load`-Ereignis die Leerlauf-Frist
verstrichen und der Browser im Leerlauf ist. Der Start MUST höchstens einmal
je Seitenaufruf erfolgen.

#### Scenario: Seite wird nur geladen
- **WHEN** eine Produktionsseite geladen wird und keine Interaktion folgt, bevor die Leerlauf-Frist abläuft
- **THEN** wird `posthog-recorder.js` bis dahin nicht angefragt

#### Scenario: Erste Interaktion
- **WHEN** vor Ablauf der Frist die erste Interaktion eintrifft
- **THEN** startet die Aufzeichnung sofort einmal, und alle Auslöser sind abgebaut

#### Scenario: Leerlauf
- **WHEN** keine Interaktion eintrifft und die Frist nach `load` abgelaufen ist
- **THEN** startet die Aufzeichnung im nächsten Leerlauf

### Requirement: Einwilligung bleibt maßgeblich
Der Recorder MUST NOT starten, wenn die Besucherin Statistik abgelehnt hat
oder die Seite nicht auf dem Produktions-Host läuft; die Anforderungen der
Spec `cookie-consent` gelten unverändert.

#### Scenario: Abgelehnt
- **WHEN** ein Auslöser feuert und Statistik ist abgelehnt
- **THEN** wird `startSessionRecording` nicht aufgerufen und kein Recorder geladen
