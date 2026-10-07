# discord-member-count Specification

## Purpose
Die Zahl der Discord-Mitglieder kommt zuverlässig, ohne Token und ohne die
Seite zu gefährden.

## Requirements

### Requirement: Die Zahl kommt aus dem öffentlichen Einladungs-Endpunkt
`GET /api/community/discord` MUST `approximate_member_count` aus
`https://discord.com/api/v10/invites/<code>?with_counts=true` liefern, ohne
Token, als `{ members: number | null }`. Der Code SHALL aus der
`runtimeConfig` (`discordInviteCode`, Vorgabe `yzkf2H9UQD`) kommen und über die
Umgebungsvariable `NUXT_DISCORD_INVITE_CODE` überschreibbar sein.

#### Scenario: Erfolg
- **WHEN** Discord eine gültige Antwort liefert
- **THEN** enthält die Antwort die Zahl

### Requirement: Der Abruf ist zwischengespeichert und begrenzt
Ein erfolgreicher Abruf MUST rund eine Stunde zwischengespeichert werden; ein
Fehler MUST NOT zwischengespeichert werden. Der Abruf hat eine Zeitgrenze von
höchstens fünf Sekunden. Der Abruf SHALL über eine übergebene Funktion
erfolgen, damit Tests nie das Netz berühren.

#### Scenario: Zeitüberschreitung
- **WHEN** Discord nicht rechtzeitig antwortet
- **THEN** antwortet die Route mit 200 und `{ members: null }`

#### Scenario: Ungültiger Code oder Fehlerstatus
- **WHEN** Discord mit 404 oder einer unlesbaren Antwort antwortet
- **THEN** antwortet die Route mit 200 und `{ members: null }`
