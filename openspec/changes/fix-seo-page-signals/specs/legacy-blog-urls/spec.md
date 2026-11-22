# Spec Delta

## Purpose

Blog-Links ohne Sprachpräfix führen auf die englische Seite, statt zu 404.

## ADDED Requirements

### Requirement: Blog-URLs ohne Sprache leiten dauerhaft weiter
`/blog` MUST mit 301 auf `/en/blog` antworten, `/blog/<pfad>` mit 301 auf
`/en/blog/<pfad>`. Die Weiterleitung SHALL weder Cookies noch Header lesen
und trägt keine Edge-Cache-Direktive. Fehlerantworten (Status ≥ 400) bleiben
`no-store`.

Bekannte Einschränkung: Ein deutscher Slug führt auf `/en/blog/<slug>` und
dort zu 404; eine Abbildung auf `/de` ist kein Ziel dieser Änderung.

#### Scenario: Artikel
- **WHEN** `/blog/example-post` abgerufen wird
- **THEN** ist die Antwort 301 mit `Location` `/en/blog/example-post`

#### Scenario: Übersicht
- **WHEN** `/blog` abgerufen wird
- **THEN** ist die Antwort 301 mit `Location` `/en/blog`

#### Scenario: Startseite unberührt
- **WHEN** `/` abgerufen wird
- **THEN** gilt weiter die Regel mit `no-store`, nicht die Blog-Weiterleitung
