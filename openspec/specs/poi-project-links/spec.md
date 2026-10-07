# poi-project-links Specification

## Purpose
Ein Bau auf dem Server kann zeigen, wie ein Projekt eingesetzt wird, und beide
Seiten verweisen aufeinander.

## Requirements

### Requirement: Ein POI nennt die Projekte, die er im Einsatz zeigt
Ein Community-POI MAY im Frontmatter `projects` tragen, eine Liste von
Projekt-Slugs; ohne Angabe hat er keine. Jeder Slug MUST in der Sprache des POI
auf ein Projekt auflösen. Zwei Übersetzungen eines POI (gleicher
`translationKey`) MUST dieselben `projects` tragen.

#### Scenario: Unbekannter Projekt-Slug
- **WHEN** ein POI `projects: [gibt-es-nicht]` trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt Datei und Slug

#### Scenario: Abweichende Übersetzungen
- **WHEN** die deutsche Fassung eines POI `projects: [a]` und die englische keines trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt beide Dateien

### Requirement: Die Projektseite zeigt, wo das Projekt im Einsatz ist
Die Detailseite eines Projekts MUST einen Abschnitt „Im Einsatz auf dem Server“ /
„In use on the server“ mit den Karten aller POIs der Sprache zeigen, die das
Projekt nennen. Ohne solche POIs MUST der Abschnitt samt Überschrift entfallen.

#### Scenario: Projekt mit POI
- **WHEN** ein POI `projects: [arcr]` trägt und die Detailseite von `arcr` geöffnet wird
- **THEN** zeigt sie den Abschnitt mit der Karte dieses POI, verlinkt auf `/<locale>/community-poi/<slug>`

#### Scenario: Projekt ohne POI
- **WHEN** kein POI das Projekt nennt
- **THEN** zeigt die Seite keinen Abschnitt „Im Einsatz auf dem Server“

### Requirement: Die POI-Seite nennt die verknüpften Projekte
Die Detailseite eines POI mit `projects` MUST einen Abschnitt mit den
Projektkarten zeigen, jede mit Link auf `/<locale>/projects/<slug>`. Ohne
`projects` MUST der Abschnitt entfallen; ein nicht auflösbarer Slug MUST ohne
Fehler übergangen werden.

#### Scenario: POI mit Projekt
- **WHEN** die Detailseite eines POI mit `projects: [arcr]` geöffnet wird
- **THEN** zeigt sie die Projektkarte mit Link auf die Projektseite

### Requirement: Die Domänen kennen einander nicht
Die Verbindung von POIs und Projekten MUST in `pages/` stattfinden;
`layers/projects` und `layers/community-poi` dürfen einander weder importieren
noch benennen.

#### Scenario: Architekturprüfung
- **WHEN** `tests/architecture/module-boundaries.spec.ts` läuft
- **THEN** bleibt sie ohne neue Ausnahme grün
