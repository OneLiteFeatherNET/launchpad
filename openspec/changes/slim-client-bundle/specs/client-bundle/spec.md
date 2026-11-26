# Spec Delta

## ADDED Requirements

### Requirement: Icons brauchen keine Laufzeitbibliothek
Icons MUST als statisches `<svg>` aus den Icon-Definitionen gerendert werden.
Das Client-Bundle MUST NOT `@fortawesome/fontawesome-svg-core` oder
`@fortawesome/vue-fontawesome` enthalten, und das HTML MUST NOT deren
globales CSS enthalten. Dekorative Icons MUST `aria-hidden="true"` tragen.

#### Scenario: Produktions-Build
- **WHEN** `pnpm build` läuft
- **THEN** enthält kein Chunk unter `.output/public/_nuxt` den Code von `fontawesome-svg-core`
- **AND** das HTML von `/en` enthält kein `--fa-font-solid`

#### Scenario: Icon im Template
- **WHEN** ein Template ein Icon aus `@fortawesome/free-solid-svg-icons` einbindet
- **THEN** rendert das SSR-HTML ein `<svg>` mit `viewBox` und Pfad dieses Icons

### Requirement: Vorgeladenes JavaScript bleibt im Budget
Die Summe der Dateien, die eine Seite per `modulepreload` und als Entry lädt,
MUST unter einem im Test festgehaltenen Budget bleiben. Das Budget MUST nach
diesem Change auf den gemessenen Stand plus höchstens 10 % gesetzt werden.
Der Entry-Chunk MUST unter seinem Budget bleiben.

#### Scenario: Budget überschritten
- **WHEN** eine Änderung das vorgeladene JS über das Budget hebt
- **THEN** schlägt der Budget-Test mit der gemessenen Größe fehl

### Requirement: Inline-CSS bleibt im Budget
Das Inline-CSS einer Seite MUST unter einem im Test festgehaltenen Budget
bleiben, gesetzt auf den gemessenen Stand plus höchstens 10 %.

#### Scenario: Budget überschritten
- **WHEN** neue globale CSS-Regeln das Inline-CSS über das Budget heben
- **THEN** schlägt der Budget-Test mit der gemessenen Größe fehl

### Requirement: Keine ungenutzten Abhängigkeiten
`package.json` MUST NOT Pakete aufführen, die weder Code, Konfiguration noch
Skripte des Repos importieren oder aufrufen.

#### Scenario: Entferntes Paket
- **WHEN** ein Paket aus `package.json` entfernt wurde
- **THEN** laufen `pnpm build`, `pnpm test` und `pnpm typecheck` grün
