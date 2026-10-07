# publication-date Specification

## Purpose
„Neu“ bezieht sich auf die Veröffentlichung auf der Website, die nicht aus anderen
Daten ableitbar ist.

## Requirements

### Requirement: Projekte und Community-POIs tragen optional `publishedAt`
`projects` und `community_poi` MUST ein optionales Datum `publishedAt` kennen: den
Tag, an dem der Eintrag auf der Website erschien. Es MUST unabhängig von
`releasedAt` (Projekt) und `startedAt` (POI) sein. Fehlt es, ist der Eintrag nie
„neu“. Übersetzungen von Projekten mit gleichem `translationKey` MUST dasselbe
`publishedAt` tragen.

#### Scenario: Abweichende Übersetzungen
- **WHEN** die deutsche und die englische Fassung eines Projekts unterschiedliche `publishedAt` tragen
- **THEN** schlägt die Inhaltsprüfung fehl und nennt beide Dateien

### Requirement: ARCR ist am 2026-10-07 veröffentlicht
Das Projekt Anti-RedstoneClock Remastered MUST in de und en `publishedAt: 2026-10-07` tragen.
Bestehende POIs ohne bekanntes Datum SHALL kein `publishedAt` erhalten.

#### Scenario: ARCR
- **WHEN** die ARCR-Dateien gelesen werden
- **THEN** tragen beide `publishedAt: 2026-10-07`
