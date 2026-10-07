# Spec Delta

## Purpose

Seiten-HTML und Payload nennen keine Adressen, unter denen keine Seite
existiert.

## ADDED Requirements

### Requirement: Content-Dokumente tragen keinen Roh-Collection-Pfad
Jede Zeile, die der Content-Adapter an die Seiten liefert, MUST ohne die
Felder `path` und `stem` ankommen. Diese Felder leiten sich aus der Lage der
Datei ab (`/team-faq/en/process`) und bezeichnen keine Route der Site. Der
Adapter MUST sie aus Einzeldokumenten, Listen und allen Zeilen entfernen, auch
wenn die Abfrage keine Projektion hat. Felder, die ein Template liest, SHALL
unverändert bleiben (`id` für `data-content-id`, `body`, `excerpt`, `slug`).

#### Scenario: Einzeldokument
- **WHEN** `getTeamDocument('en')` eine Zeile mit `path: '/team/en/home'` und `stem` erhält
- **THEN** enthält das Ergebnis weder `path` noch `stem`, aber alle übrigen Felder

#### Scenario: Liste
- **WHEN** `listTeamFaqEntries('en')` Zeilen mit `path` liefert
- **THEN** trägt keine Zeile `path` oder `stem`

#### Scenario: Payload
- **WHEN** `/en/team` als Produktions-Build ausgeliefert wird
- **THEN** enthält das HTML weder `/team-faq/en/` noch `team-faq/en/`

### Requirement: Die Sitemap behält ihre Pfade
Die Sitemap-Einträge der Content-Collections MUST weiter aus der Spalte `path`
der Datenbank erzeugt werden, nicht aus Adapter-Zeilen.

#### Scenario: Sitemap
- **WHEN** `/__sitemap__/en-US.xml` abgerufen wird
- **THEN** sind die Einträge unverändert
