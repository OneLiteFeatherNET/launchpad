# Spec Delta

## Purpose

Das JSON-LD jeder Seite beschreibt sie vollständig und gültig, und CI prüft
den Inhalt, nicht nur das Vorhandensein.

## ADDED Requirements

### Requirement: Das Hauptbild einer Seite ist ihr Social-Image
Der `WebPage`-Knoten MUST als `primaryImageOfPage` das og:image der Seite
tragen: das eigene Bild der Seite oder, ohne eigenes Bild, `og-default.png`.
`primaryImageOfPage` MUST NOT auf eine SVG-Datei zeigen. Für Blogartikel
SHALL es das Header-Bild in 1200×630 sein.

#### Scenario: Seite ohne eigenes Bild
- **WHEN** `/en/bluemap` abgerufen wird
- **THEN** zeigt `primaryImageOfPage` auf ein `ImageObject` mit `url` `https://onelitefeather.net/images/og-default.png`

#### Scenario: Artikel mit Header-Bild
- **WHEN** ein Artikel mit `headerImage` abgerufen wird
- **THEN** ist `primaryImageOfPage` dieselbe URL wie `og:image`

### Requirement: Ein Teamprofil benennt die Person als Hauptinhalt
Auf `/<locale>/team/<slug>` MUST der `ProfilePage`-Knoten ein `mainEntity`
mit `@id` `<site-origin>/#/person/<slug>` tragen, und ein `Person`-Knoten
mit dieser `@id` MUST im selben Graph stehen.

#### Scenario: Profil
- **WHEN** `/en/team/themeinerlp` abgerufen wird
- **THEN** ist `mainEntity.@id` des `ProfilePage`-Knotens `https://onelitefeather.net/#/person/themeinerlp`
- **AND** der Graph enthält einen `Person`-Knoten mit dieser `@id`

### Requirement: SoftwareApplication trägt nur definierte Eigenschaften
Der `SoftwareApplication`-Knoten eines Projekts MUST NOT `codeRepository`
tragen. Hat das Projekt einen Quellcode-Link, SHALL dieser in `sameAs`
stehen.

#### Scenario: Projekt mit Repository
- **WHEN** `softwareApplicationNode` ein Projekt mit `links.source` erhält
- **THEN** enthält der Knoten kein `codeRepository`
- **AND** `sameAs` enthält die Repository-URL

#### Scenario: Projekt ohne Repository
- **WHEN** das Projekt keinen `links.source` hat
- **THEN** fehlt `sameAs`

### Requirement: CI prüft die Identitätsknoten
`pnpm seo:check` gegen den Produktions-Build MUST mit Fehler enden, wenn auf
einer geprüften Seite der `WebSite`-Knoten nicht die Anforderungen der
Capability `site-identity` erfüllt, oder wenn die Organization
(`<origin>/#identity`) ohne `name`, `url` oder ein `logo` ist, das auf ein
Nicht-SVG-Bild auflöst. Die Prüflogik MUST als reine Funktionen vorliegen,
die mit festen Graphen in Vitest getestet werden, ohne Server oder Netzwerk.

#### Scenario: Fehlender alternateName
- **WHEN** die Prüffunktion einen Graph erhält, dessen `WebSite` kein `alternateName` hat
- **THEN** liefert sie einen Befund, der `alternateName` nennt

#### Scenario: Gültiger Startseiten-Graph
- **WHEN** die Prüffunktion den Graph einer korrekten Startseite erhält
- **THEN** liefert sie keine Befunde

### Requirement: CI prüft Artikel, Profile und Referenzen
`pnpm seo:check` MUST mit Fehler enden, wenn ein `Article` ohne `headline`,
`image`, `datePublished`, `dateModified`, `author` mit `name` und `url` oder
auflösbaren `publisher` ist; wenn das `mainEntity` eines Teamprofils nicht
auf einen `Person`-Knoten im Graph auflöst; oder wenn `isPartOf`,
`publisher`, `about` oder `primaryImageOfPage` auf keinen Knoten im Graph
zeigen bzw. `primaryImageOfPage` ein SVG ist.

#### Scenario: Artikel ohne dateModified
- **WHEN** die Prüffunktion einen `Article` ohne `dateModified` erhält
- **THEN** liefert sie einen Befund, der `dateModified` nennt

#### Scenario: Unauflösbares mainEntity
- **WHEN** ein `ProfilePage`-Knoten auf eine `@id` verweist, die im Graph fehlt
- **THEN** liefert die Prüffunktion einen Befund mit dieser `@id`
