# Spec Delta

## Purpose

Das JSON-LD enthält nur Typen, die eine Suchmaschine noch auswertet, und pro
Seite genau einen Seitenknoten.

## ADDED Requirements

### Requirement: Kein Markup für eingestellte Rich-Result-Typen
Keine Seite DARF einen Knoten vom Typ `FAQPage` ausliefern. Sichtbare
FAQ-Abschnitte SHALL unverändert gerendert werden.

#### Scenario: Startseite
- **WHEN** `/en` abgerufen wird
- **THEN** enthält der JSON-LD-Graph keinen Knoten vom Typ `FAQPage`
- **AND** der FAQ-Abschnitt ist im HTML sichtbar

#### Scenario: Teamseite
- **WHEN** `/de/team` abgerufen wird
- **THEN** enthält der JSON-LD-Graph keinen Knoten vom Typ `FAQPage`

#### Scenario: Quelltext
- **WHEN** die Quelltexte unter `layers/`, `pages/`, `layouts/` und `app.vue` gelesen werden
- **THEN** registriert keiner `'@type': 'FAQPage'`
