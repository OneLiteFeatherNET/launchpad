# Spec Delta

## Purpose

Die Mitgliederzahl zählt die Gruppe, auf die der Kurzlink wirklich zeigt, und
jeder Einladungslink der Seite läuft über diesen Kurzlink.

## ADDED Requirements

### Requirement: Der Code kommt aus der Weiterleitung des Kurzlinks
`GET /api/community/discord` MUST den Einladungscode bestimmen, indem es
`runtimeConfig.public.discordUrl` ohne automatisches Folgen von
Weiterleitungen abruft, `Location` liest (höchstens drei Sprünge, relative
Ziele relativ zur angefragten URL) und aus einer Adresse auf `discord.com`,
`discord.gg` oder `discordapp.com` das letzte Pfadsegment übernimmt. Diese
Auflösung SHALL innerhalb der bestehenden, eine Stunde zwischengespeicherten
Funktion laufen, mit einer übergebenen Abruffunktion und einer Zeitgrenze von
fünf Sekunden.

#### Scenario: Weiterleitung führt zu Discord
- **WHEN** der Kurzlink mit 302 und `Location: https://discord.com/invite/abc123` antwortet
- **THEN** wird die Zahl für den Code `abc123` abgefragt

#### Scenario: Aufgelöst wird nichts Brauchbares
- **WHEN** der Kurzlink ohne `Location`, mit fremdem Host, mit Fehlerstatus oder gar nicht antwortet
- **THEN** zählt die Route mit dem konfigurierten `discordInviteCode`

#### Scenario: Zahl nicht zu haben
- **WHEN** auch die Zählung scheitert
- **THEN** antwortet die Route mit 200 und `{ members: null }`, und der Fehler wird nicht zwischengespeichert

### Requirement: Kein direkter Einladungslink im Quelltext
Dateien unter `layers/`, `pages/`, `layouts/`, `i18n/`, `public/`, `server/`,
`shared/` und `content/` außerhalb von `content/blog/` MUST keine Einladung
der Form `discord.gg/<code>` oder `discord.com/invite/<code>` enthalten; der
Kurzlink ist der einzige Weg.

#### Scenario: Prüfung
- **WHEN** `tests/architecture` läuft
- **THEN** findet der Test keinen direkten Einladungslink
