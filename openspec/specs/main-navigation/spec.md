# main-navigation Specification

## Purpose
Besucher finden jede Seite über eine Kopfleiste, die auf jeder Breite
vollständig und ohne Umbruch lesbar bleibt.

## Requirements

### Requirement: Die oberste Ebene ist kurz und geordnet
Die Kopfleiste MUST auf oberster Ebene genau diese Einträge in dieser
Reihenfolge zeigen: `Team`, `Blog`, die Gruppe `Community`, die Gruppe `Mehr`;
ist „Events“ befördert (siehe unten), steht `Events` zwischen `Blog` und
`Community`. Danach folgen der Spielen-Button, der Discord-Button und die
Sprachwahl. Die oberste Ebene
(Links und Gruppen, ohne Discord und Sprachwahl) SHALL höchstens sechs Einträge
umfassen. Ein Eintrag „Übersicht“ MUST NOT auf oberster Ebene stehen.

#### Scenario: Reihenfolge auf dem Desktop
- **WHEN** `/de` auf einem Desktop geöffnet wird
- **THEN** stehen in der Leiste `Team`, `Blog`, `Community`, `Mehr`, `Discord` und die Sprachwahl in dieser Reihenfolge

### Requirement: Gruppen enthalten die Zielseiten
Die Gruppe `Community` MUST Übersicht (`/community`), Bauwerke
(`/community-poi`), Projekte (`/projects`) und Events (`/events`) enthalten. Die
Gruppe `Mehr` MUST BlueMap und den externen Status enthalten. Jede Seite, die vorher über die Navigation erreichbar war
(Startseite über das Logo, Blog, Team, Community-POIs, Events, Projekte,
Community, `#connect`, BlueMap, Status), MUST weiterhin erreichbar sein.

#### Scenario: Nichts geht verloren
- **WHEN** alle Ziele der Navigation eingesammelt werden
- **THEN** sind Startseite, Blog, Team, Community-POIs, Events, Projekte, Community, `#connect`, BlueMap und Status enthalten

### Requirement: „Spielen“ und Discord sind hervorgehobene Buttons
Neben der Sprachwahl MUST die Leiste einen gefüllten Button „Spielen“ (en
„Play“) zeigen, der auf den Verbindungsabschnitt der Startseite der aktuellen
Sprache führt (`/<locale>#connect`), und links daneben von Discord stehen. Der
Discord-Button MUST tonal sein und in einem neuen Tab öffnen. Das mobile Menü
MUST beide Buttons zeigen, „Spielen“ zuerst.

#### Scenario: Reihenfolge der Buttons
- **WHEN** `/de` auf dem Desktop geöffnet wird
- **THEN** steht „Spielen“ mit Link auf `/de#connect` links von „Discord“, beide vor der Sprachwahl

### Requirement: Events stehen nur oben, solange etwas stattfindet
„Events“ MUST auf oberster Ebene hinter „Blog“ stehen, wenn mindestens ein
Event gelistet (nicht `unlisted`) und zum Zeitpunkt des Renderns angekündigt
oder laufend ist; verborgene, nicht gelistete und vergangene Events zählen
nicht. Andernfalls MUST „Events“ das letzte Kind der Gruppe „Community“ sein.
In beiden Fällen SHALL der Eintrag auf einer Event-Seite als aktuell markiert
sein (als Link beziehungsweise über die Gruppe). Die Navigation SHALL die
Entscheidung als Eigenschaft erhalten und die Events-Domäne nicht kennen.

#### Scenario: Ein kommendes Event
- **WHEN** ein gelistetes Event angekündigt ist
- **THEN** zeigt die Leiste `Team`, `Blog`, `Events`, `Community`, `Mehr`

#### Scenario: Nur vergangene Events
- **WHEN** alle Events vergangen oder nicht gelistet sind
- **THEN** steht „Events“ als letztes Kind unter „Community“

### Requirement: Mobile Gruppenköpfe gleichen den Linkzeilen
Im mobilen Menü MUST ein Gruppenkopf dieselbe Schrift und dieselbe Fläche wie
eine Linkzeile haben und einen Chevron als Aufklapp-Hinweis tragen; der
Aktivzustand der Gruppe nutzt die Markierung der Linkzeilen.

#### Scenario: Gleiche Optik
- **WHEN** das mobile Menü offen ist
- **THEN** unterscheiden sich „Community“ und „Team“ nur durch den Chevron

### Requirement: Der Menütext „Bauwerke“ ändert keine Seite
Der Navigationseintrag für `/community-poi` MUST „Bauwerke“ (de) beziehungsweise
„Builds“ (en) heißen. URLs, Routen und Überschriften der Seiten MUST unverändert
bleiben.

#### Scenario: Beschriftung
- **WHEN** `/en` geöffnet und die Gruppe `Community` aufgeklappt wird
- **THEN** führt der Eintrag „Builds“ auf `/en/community-poi`

### Requirement: Das Logo führt zur Startseite
Das Logo MUST auf die Startseite der aktuellen Sprache verlinken und einen
zugänglichen Namen tragen, der den sichtbaren Text „OneLiteFeather“ enthält.

#### Scenario: Logo
- **WHEN** das Logo auf `/de/team` aktiviert wird
- **THEN** öffnet sich `/de`

### Requirement: Nichts bricht um oder wird abgeschnitten
Logo-Text und Navigationstexte MUST auf einer Zeile bleiben und dürfen bei
knapper Breite nicht schrumpfen. Der Wechsel zur mobilen Leiste MUST bei einer
Breite stattfinden, bei der alle Desktop-Einträge ohne Überlauf passen.

#### Scenario: Breite 1280 px
- **WHEN** die Seite mit 1280 px Breite geladen wird
- **THEN** ist der Logo-Text vollständig lesbar und kein Eintrag umbricht

### Requirement: Gruppen zeigen den aktiven Zustand
Liegt die aktuelle Route auf oder unter dem Ziel eines Kinds, MUST der Knopf
der Gruppe als aktiv markiert sein (mobil: die Gruppenüberschrift). Externe
Ziele und Ziele mit Anker (`/#connect`) SHALL die Gruppe nicht aktivieren.

#### Scenario: Unterseite
- **WHEN** `/de/community-poi/yggdrasil` geöffnet ist
- **THEN** ist die Gruppe `Community` aktiv und `Mehr` nicht

### Requirement: Gruppen sind zugänglich und per Tastatur bedienbar
Ein Gruppenknopf MUST `aria-expanded` und `aria-controls` auf das Menü tragen
und mit Enter und Leertaste bedienbar sein; Escape SHALL das Menü schließen.
Das mobile Menü zeigt dieselben Gruppen aufklappbar.

#### Scenario: Aufklappen
- **WHEN** der Knopf `Community` mit der Tastatur aktiviert wird
- **THEN** steht `aria-expanded="true"` und das per `aria-controls` genannte Menü ist sichtbar

### Requirement: Strukturierte Daten folgen der Navigation
Die `SiteNavigationElement`-Einträge MUST alle Ziele der neuen Struktur
enthalten, die Gruppen flachgezogen, mit den neuen Beschriftungen.

#### Scenario: Schema
- **WHEN** `/de` gerendert wird
- **THEN** enthält das JSON-LD ein Element „Bauwerke“ mit der URL von `/de/community-poi`, ein Element „Spielen“ mit `/de#connect` und keines namens „Übersicht“ für die Startseite
