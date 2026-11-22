# Spec Delta

## Purpose

Was Besucher lesen oder vorgelesen bekommen, folgt der gewählten Sprache.

## ADDED Requirements

### Requirement: Sichtbarer Text läuft über i18n
Ein Vue-Template MUST keinen sichtbaren Klartext enthalten, der nicht über
`t()` kommt. Ausgenommen sind Eigennamen, die in jeder Sprache gleich sind,
und die bewusst deutschen Rechtstexte (`pages/privacy.vue`,
`pages/imprint.vue`). Jeder verwendete Schlüssel MUST in `en.json` und
`de.json` existieren.

#### Scenario: Karussell-Button auf /en
- **WHEN** die Startseite unter `/en` gerendert wird
- **THEN** zeigt der Button der News-Karte "More" und nicht "Mehr"

#### Scenario: Rückfall wird gefangen
- **WHEN** ein Template ein Wort wie `Mehr` zwischen Tags enthält
- **THEN** schlägt `tests/i18n/hardcoded-text.spec.ts` fehl
