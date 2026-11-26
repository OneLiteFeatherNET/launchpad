# Spec Delta

## ADDED Requirements

### Requirement: Das LCP-Bild eines Blogartikels wird priorisiert geladen
Hat ein Blogartikel ein Kopfbild, MUST die Seite es mit `fetchpriority="high"`
und ohne `loading="lazy"` rendern und im `<head>` einen Preload
(`rel="preload" as="image"`) ausgeben, dessen `imagesrcset` und `imagesizes`
dem `srcset` und `sizes` des gerenderten Bildes entsprechen. Hat der Artikel
kein Kopfbild, MUST NOT ein Bild-Preload entstehen.

#### Scenario: Artikel mit Kopfbild
- **WHEN** `/de/blog/minecraft2shell-luecke-im-minecraft-client` gerendert wird
- **THEN** trägt das Kopfbild `fetchpriority="high"` und kein `loading="lazy"`
- **AND** der `<head>` enthält genau einen Bild-Preload, der auf dieselbe Quelle zeigt

#### Scenario: Artikel ohne Kopfbild
- **WHEN** ein Artikel ohne `headerImage` gerendert wird
- **THEN** enthält der `<head>` keinen Bild-Preload für den Artikel

### Requirement: Die sichtbaren Karten der Blogübersicht laden nicht lazy
Die Blogübersicht MUST die Bilder der Karten in der ersten sichtbaren Reihe
mit `loading="eager"` rendern, die erste davon mit `fetchpriority="high"`.
Alle übrigen Kartenbilder MUST `loading="lazy"` behalten.

#### Scenario: Erste Karte
- **WHEN** `/en/blog` gerendert wird
- **THEN** hat das Bild der ersten Karte `fetchpriority="high"` und kein `loading="lazy"`
- **AND** Karten ab der zweiten Reihe haben `loading="lazy"`

### Requirement: Preload und Bild der ersten Carousel-Folie sind identisch
Der Preload für Folie 0 MUST dieselben Kandidaten (`imagesrcset`) und dieselbe
`imagesizes`-Angabe verwenden wie das gerenderte Bild der Folie (`srcset`,
`sizes`), sodass der Browser für Folie 0 nur ein Bild lädt.

#### Scenario: Startseite
- **WHEN** `/en` gerendert wird
- **THEN** stimmen `imagesizes` des Preloads und `sizes` des Bildes von Folie 0 überein
- **AND** jede URL in `imagesrcset` des Preloads kommt im `srcset` des Bildes vor

### Requirement: Komponenten ohne frühe Interaktion hydrieren verzögert
Komponenten ohne Bedienelemente oberhalb des Falzes MUST mit einer Lazy-
Hydration-Strategie (`hydrate-on-visible`, `hydrate-on-idle`,
`hydrate-on-interaction` oder `hydrate-never` bei reiner Anzeige ohne Links)
eingebunden werden. Ihr Inhalt MUST im SSR-HTML enthalten bleiben.
Navigation, Carousel-Steuerung und Cookie-Banner MUST sofort hydrieren.

#### Scenario: Teilen-Leiste im Artikel
- **WHEN** ein Blogartikel geladen wird
- **THEN** ist die Teilen-Leiste im HTML enthalten und hydriert erst, wenn sie sichtbar wird

### Requirement: Globale Listener nur, solange sie gebraucht werden
Sprachauswahl und Mediengalerie MUST ihre Listener auf `document` bzw.
`window` erst registrieren, wenn sie geöffnet werden, und MUST sie beim
Schließen und beim Unmount entfernen.

#### Scenario: Sprachauswahl geschlossen
- **WHEN** die Seite geladen ist und die Sprachauswahl nicht geöffnet wurde
- **THEN** hat die Sprachauswahl keinen Listener auf `document` registriert

#### Scenario: Sprachauswahl geöffnet und geschlossen
- **WHEN** die Sprachauswahl geöffnet und wieder geschlossen wird
- **THEN** ist danach kein Listener der Sprachauswahl mehr auf `document` registriert

### Requirement: Interaktionen zeigen ihre Rückmeldung vor Folgearbeit
Bei Carousel-Wechsel, Menü-Umschalten und Kopieren von Koordinaten MUST die
sichtbare Zustandsänderung vor Tracking oder anderer Folgearbeit passieren;
Folgearbeit MUST nach dem nächsten Frame laufen.

#### Scenario: Menü öffnen
- **WHEN** jemand das mobile Menü öffnet
- **THEN** wird der Öffnungszustand im selben Task gesetzt und Tracking erst nach dem nächsten Frame ausgelöst
