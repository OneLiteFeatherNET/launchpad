# content-queries Specification

## Purpose
TBD - created by archiving change slim-content-queries. Update Purpose after archive.

## Requirements

### Requirement: Single-Document-Collections lesen höchstens eine Zeile
Das Repository MUST für Collections, die genau ein Dokument je Sprache
enthalten (Team, Server-Konzept, Server-Verbindung, Home-Carousel,
Sponsoren), höchstens eine Zeile lesen. Fehlt das Dokument, MUST es `null`
liefern.

#### Scenario: Erstes Dokument genügt
- **WHEN** `getTeamDocument('de')` aufgerufen wird
- **THEN** fragt der Adapter mit `.first()` ab und ruft `.all()` nicht auf

#### Scenario: Kein Dokument vorhanden
- **WHEN** die Collection leer ist
- **THEN** liefert die Methode `null`

### Requirement: Listenabfragen liefern nur Kartenfelder
`listEvents` und `listCommunityPois` MUST per `.select()` nur Felder lesen,
die Übersicht, Karten und Startseite verwenden. Sie MUST NOT Galerie,
Schematics, Ressourcen, Markdown-Body oder weitere Detailfelder in den
SSR-Payload geben. Die Felder, die die Phasenberechnung eines Events braucht
(`event`, `unlisted`, `promote`, `access`), MUST enthalten sein. Detailabfragen
(`getEventBySlug`, `getCommunityPoiBySlug`) MUST vollständige Dokumente liefern.

#### Scenario: Event-Liste ohne Detailfelder
- **WHEN** `listEvents('en')` aufgerufen wird
- **THEN** enthält die Projektion `slug`, `title`, `summary`, `type`, `thumbnail`, `event`, `unlisted`, `promote` und `access`, aber weder `body` noch `guides`

#### Scenario: POI-Karte zeigt Anzahlen
- **WHEN** `listCommunityPois('de')` Zeilen mit Galerie und Schematics erhält
- **THEN** liefert es je POI `galleryCount` und `schematicCount` und enthält die Listen selbst nicht

#### Scenario: Detailseite bleibt vollständig
- **WHEN** `getCommunityPoiBySlug('de', 'labyrinth')` aufgerufen wird
- **THEN** wird ohne `.select()` abgefragt

### Requirement: Markierte POIs werden in der Datenbank gefiltert
Die Startseite MUST ihre markierten POIs über `listFeaturedCommunityPois`
beziehen, die in SQL auf `featured = true` filtert und nur die Kartenfelder
liest, statt die gesamte Collection zu laden.

#### Scenario: Nur markierte POIs
- **WHEN** `listFeaturedCommunityPois('en')` aufgerufen wird
- **THEN** enthält die Abfrage `.where('featured', '=', true)` und eine Projektion auf Kartenfelder

### Requirement: Die Autor:innen eines Artikels kommen aus einer Abfrage
Beim Laden eines Blogartikels MUST das Repository alle Autor:innen mit einer
einzigen Abfrage (`slug IN (...)`) lesen, unabhängig von deren Anzahl. Die
Reihenfolge der Autor:innen SHALL der Reihenfolge im Frontmatter folgen.
Ohne Autor:innen MUST keine Abfrage stattfinden.

#### Scenario: Zwei Autor:innen
- **WHEN** ein Artikel `author: [b, a]` hat
- **THEN** erfolgt genau eine Autorenabfrage mit `IN ('b', 'a')` und `authors` enthält zuerst `b`, dann `a`

#### Scenario: Kein Autor
- **WHEN** ein Artikel keinen `author` hat
- **THEN** wird keine Autorenabfrage gestellt
