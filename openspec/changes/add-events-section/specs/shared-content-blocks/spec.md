# Spec Delta: shared-content-blocks

## Purpose

Stellt domänenneutrale Inhaltsbausteine – Mediengalerie, Ressourcenliste,
Zeitraum und Leerzustand – bereit, damit mehrere Bereiche der Website sie
einheitlich und ohne gegenseitige Abhängigkeit nutzen können.

## ADDED Requirements

### Requirement: Bausteine sind domänenfrei und überall verfügbar
Die gemeinsamen Inhaltsbausteine MUST in der Basisschicht liegen, MUST NOT
Begriffe, Typen oder Module eines Fach-Layers (z. B. Events, Community-POI,
Blog) kennen und SHALL in jedem Layer und jeder Seite ohne Import eines
anderen Fach-Layers nutzbar sein.

#### Scenario: Architekturprüfung
- **WHEN** ein Baustein ein Modul aus `layers/community-poi/` oder `layers/events/` importiert
- **THEN** schlägt `tests/architecture/module-boundaries.spec.ts` fehl

### Requirement: Mediengalerie mit Vergrößerung und Tastaturbedienung
Die Mediengalerie MUST eine Liste von Bildern mit Pflicht-Alternativtext und
optionaler Bildunterschrift als Raster zeigen. Ein ausgewähltes Bild SHALL
vergrößert in einem modalen Dialog erscheinen, der mit Escape schließt, mit
Pfeil links/rechts blättert und den Fokus beim Schließen auf das auslösende
Vorschaubild zurückgibt. Bilder mit angegebener Breite und Höhe MUST ohne
Layoutverschiebung laden.

#### Scenario: Blättern und Schließen per Tastatur
- **WHEN** ein Besucher das zweite Vorschaubild per Enter öffnet, Pfeil rechts und dann Escape drückt
- **THEN** zeigt der Dialog zuerst Bild zwei, dann Bild drei, schließt sich und der Fokus liegt wieder auf Vorschaubild zwei

#### Scenario: Leere Galerie
- **WHEN** die Galerie keine Bilder erhält
- **THEN** rendert sie nichts, auch keine leere Überschrift

### Requirement: Ressourcenliste für Downloads und Links
Die Ressourcenliste MUST Einträge der Arten Download, externer Link, Discord
und Schematic mit Name, einem Symbol je Art und optionaler Beschreibung
zeigen. Externe Ziele MUST in einem neuen Tab mit `rel="noopener noreferrer"`
öffnen und das für Screenreader ankündigen. Schematic-Einträge SHALL
optionale Angaben zu Format, Version und Größe zeigen.

#### Scenario: Externer Link
- **WHEN** ein Eintrag der Art Link auf `https://example.org` zeigt
- **THEN** öffnet er in einem neuen Tab mit `rel="noopener noreferrer"` und sein zugänglicher Name nennt das Öffnen in neuem Tab

### Requirement: Zeitraum wird einheitlich dargestellt
Der Zeitraum-Baustein MUST einen Start und optional ein Ende in der
angegebenen Zeitzone und nach der Sprache der Seite formatiert anzeigen,
beide als `<time datetime>` auszeichnen und bei gleichem Tag das Datum nur
einmal nennen. Server- und Client-Darstellung MUST übereinstimmen.

#### Scenario: Eintägiger Zeitraum
- **WHEN** Start 2026-10-01 18:00 und Ende 2026-10-01 21:00 (Europe/Berlin) auf Deutsch angezeigt werden
- **THEN** erscheint das Datum einmal, gefolgt von „18:00–21:00“, und beide Zeitpunkte sind als `<time>` ausgezeichnet

### Requirement: Leerzustand mit optionaler Aktion
Der Leerzustand-Baustein MUST einen Text und optional eine Aktion anzeigen
und SHALL als Hinweis, nicht als Fehlermeldung, für Screenreader erkennbar
sein.

#### Scenario: Leerzustand mit Link
- **WHEN** der Leerzustand mit Text und einer Aktion zu einer externen URL gerendert wird
- **THEN** ist die Aktion als Link mit sichtbarem Fokus bedienbar und kein Element trägt `role="alert"`

### Requirement: Community-POI nutzt die gemeinsamen Bausteine ohne Verhaltensänderung
Die Community-POI-Detailseite MUST Galerie und Schematic-Liste über die
gemeinsamen Bausteine darstellen, und ihr sichtbares Verhalten SHALL
gegenüber dem Stand vor der Umstellung gleich bleiben.

#### Scenario: POI mit Galerie und Schematics
- **WHEN** eine POI-Detailseite mit drei Galeriebildern und einem Schematic gerendert wird
- **THEN** zeigt sie dieselben Bilder, Beschriftungen, Download-Links und Tastaturbedienung wie vor der Umstellung, und die bestehenden POI-Tests bleiben grün
