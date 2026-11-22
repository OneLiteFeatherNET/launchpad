# Spec Delta

## Purpose

Das Bild der ersten Carousel-Folie auf der Startseite ist das LCP-Element und
wird so früh und so eindeutig wie möglich geladen.

## ADDED Requirements

### Requirement: Genau ein Bild-Preload mit hoher Priorität
Die serverseitig gerenderte Startseite MUST genau einen
`<link rel="preload" as="image">` für die erste Carousel-Folie enthalten, und
dieser MUST `fetchpriority="high"` tragen. Folgefolien und Nebenbilder
(zum Beispiel das Projekt-Logo) DÜRFEN keinen Bild-Preload erzeugen.

#### Scenario: Startseite mit Blog-Folie vorn
- **WHEN** `/en` gerendert wird und die erste Folie ein Blog-Beitrag mit Bild ist
- **THEN** enthält das HTML genau einen Bild-Preload
- **AND** er hat `fetchpriority="high"`

### Requirement: Preload und gerendertes Bild teilen eine Größenangabe
`imagesizes` des Preloads und `sizes` des `<source>` der ersten Folie MUST aus
derselben Konstante der Home-Schicht stammen und im gerenderten HTML
identisch sein. Kein Carousel-Item DARF ein eigenes `sizes`-Literal tragen.

#### Scenario: Gleiche Größen
- **WHEN** die erste Folie gerendert wird
- **THEN** ist `imagesizes` des Preloads gleich dem `sizes` des ersten `<source>`

#### Scenario: Neues Item
- **WHEN** eine `CarouselItem*.vue` ein `NuxtPicture` einbindet
- **THEN** bindet sie `sizes` an die gemeinsame Konstante statt an ein Literal
