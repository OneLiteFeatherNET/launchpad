# Spec Delta

## Purpose

Standard-Pfade, die Browser und Crawler ungefragt abrufen, liefern echte
Dateien.

## ADDED Requirements

### Requirement: /favicon.ico ist eine echte Icon-Datei
`public/favicon.ico` MUST existieren, mit dem ICO-Header (`00 00 01 00`)
beginnen und mindestens die Größen 16×16 und 32×32 enthalten. `/favicon.ico`
MUST im Produktions-Build mit 200 und dieser Datei antworten, nicht mit dem
Nitro-Platzhalter.

#### Scenario: Datei
- **WHEN** `public/favicon.ico` gelesen wird
- **THEN** beginnt sie mit `00 00 01 00` und ihr Verzeichnis enthält Einträge für 16 und 32 Pixel

#### Scenario: Auslieferung
- **WHEN** `/favicon.ico` vom Produktions-Build abgerufen wird
- **THEN** ist der Status 200 und die Antwort größer als 78 Bytes
