# Spec Delta

## Purpose

Wie lange Seiten im Edge-Cache frisch bleiben, abhängig davon, ob ihre
Ausgabe von der Uhrzeit abhängt.

## ADDED Requirements

### Requirement: Zeitunabhängige Seiten bleiben 24 Stunden frisch
Blog-Artikel, Team, About, Projekte, Community-POI, Beitritts-, Regel- und
Kartenseite sowie Rechtsseiten MUST in beiden Locales mit
`cloudflare-cdn-cache-control: max-age=86400, stale-while-revalidate=86400`
ausgeliefert werden.

#### Scenario: Artikelseite
- **WHEN** `/en/blog/<artikel>` abgerufen wird
- **THEN** trägt die Antwort `max-age=86400` in der Edge-Direktive

### Requirement: Zeitabhängige Seiten bleiben eine Stunde frisch
Startseite, Events (Liste und Details), Community, Blog-Liste und
Autorenseiten MUST `max-age=3600` tragen. Jede Route ohne eigene Regel
MUST unter `/en/**` bzw. `/de/**` ebenfalls 3600 erhalten.

#### Scenario: Eventdetail
- **WHEN** `/de/events/<event>` abgerufen wird
- **THEN** trägt die Antwort `max-age=3600`

### Requirement: Edge-Direktive und Ausschlüsse bleiben unverändert
Die Edge-Direktive MUST weder `s-maxage` noch `must-revalidate` enthalten;
Browser MUST `public, max-age=0, must-revalidate` erhalten. `/`, `/ingest/**`,
`/__nuxt_content/**`, `/api/**` und jede Antwort mit Status >= 400 MUST
`no-store` bleiben. Nitro `swr`/`cache` MUST NOT gesetzt werden.

#### Scenario: Fehlerseite
- **WHEN** eine nicht existierende Seite unter `/en/` abgerufen wird
- **THEN** ist die Antwort `no-store` und nicht im Edge-Cache

### Requirement: Ein Deployment braucht keinen Cache-Purge
`cache.cross_version_cache` MUST NOT aktiviert werden; solange es aus ist,
startet jede Worker-Version mit leerem Cache.

#### Scenario: Neue Version
- **WHEN** eine neue Worker-Version deployt wird
- **THEN** liefert der Edge-Cache keine von der Vorversion geschriebene Antwort
