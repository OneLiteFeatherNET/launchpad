# Spec Delta: halloween-season

## Purpose

Beschreibt die konkrete Halloween-Verkleidung der Website: wann sie gilt, wie
sie wirkt, welche Identitätselemente sie tauscht und welche Deko sie zeigt –
innerhalb der Grenzen, die `seasonal-theming` für jede Saison setzt.

## ADDED Requirements

### Requirement: Halloween gilt vom 20. Oktober bis 2. November
Die Halloween-Saison MUST die Kennung `halloween` tragen und vom 20. Oktober
bis einschließlich 2. November (Berliner Zeit) aktiv sein – die Wochen vor dem
31. Oktober plus Allerseelen als Puffer, damit niemand um Mitternacht
deployen muss.

#### Scenario: Letzter Tag
- **WHEN** eine Seite am 2. November um 23:00 Uhr Berliner Zeit angefragt wird
- **THEN** ist die Halloween-Saison aktiv

#### Scenario: Tag danach
- **WHEN** eine Seite am 3. November um 00:30 Uhr Berliner Zeit angefragt wird
- **THEN** ist keine Saison aktiv

### Requirement: Halloween-Farbwirkung
Die Halloween-Saison MUST ihre Rollen aus einem Violett als Primär- und einem
Kürbis-Orange als Sekundär-Seed erzeugen, sodass die Primärrolle im
Violett-Bereich (Farbton 260°–300°) und die Sekundärrolle im Orange-Bereich
(Farbton 20°–45°) liegt. Die Surface-Rollen SHALL im Dunkelschema einen
violetten Unterton tragen. Das Hellschema MUST hell bleiben – eine Seite, die
im Hellmodus plötzlich dunkel wird, wirkt kaputt, nicht verkleidet.

#### Scenario: Primär- und Sekundärrolle
- **WHEN** die Halloween-Saison aktiv ist
- **THEN** liegt der Farbton von `primary` in beiden Schemata zwischen 260° und 300° und der von `secondary` zwischen 20° und 45°

#### Scenario: Hellmodus bleibt hell
- **WHEN** die Halloween-Saison aktiv ist und das System im Hellmodus ist
- **THEN** hat `surface` eine relative Leuchtdichte über 0,8

### Requirement: Halloween-Logo und -Favicon
Die Halloween-Saison MUST ein eigenes, aus dem bestehenden Logo abgeleitetes
Logo und Favicon ausliefern, die die Grundform des Markenzeichens erkennbar
lassen. Beide MUST als SVG vorliegen und SHALL nicht größer als das jeweilige
Basis-Asset (27 KB) sein. Das Favicon MUST bei 16 × 16 px noch als
OneLiteFeather-Zeichen lesbar sein.

#### Scenario: Navigation im Oktober
- **WHEN** die Halloween-Saison aktiv ist
- **THEN** zeigt die Navigation das Halloween-Logo mit dem Alternativtext des Basis-Logos

#### Scenario: Asset-Größe
- **WHEN** die Testsuite läuft
- **THEN** sind Halloween-Logo und -Favicon jeweils höchstens so groß wie ihr Basis-Asset

### Requirement: Halloween-Deko
Die Halloween-Saison MUST eine dekorative Ebene mit Spinnennetzen in den beiden
oberen Ecken zeigen. Ab mittlerer Viewport-Breite (`md`) SHALL sie zusätzlich
höchstens drei langsam treibende Fledermäuse zeigen; auf schmaleren Viewports
MUST keine Fledermaus die Lesespalte kreuzen. Die Deko MUST ihre Farben aus den
Saison-Rollen beziehen und so gedämpft sein, dass Text darunter sein
Kontrastminimum behält. Sie MUST ohne Bilddatei-Requests auskommen.

#### Scenario: Smartphone
- **WHEN** die Halloween-Saison aktiv ist und der Viewport 390 px breit ist
- **THEN** sind nur die Spinnennetze sichtbar

#### Scenario: Desktop
- **WHEN** die Halloween-Saison aktiv ist und der Viewport 1280 px breit ist
- **THEN** sind Spinnennetze und höchstens drei Fledermäuse sichtbar

#### Scenario: Keine zusätzlichen Requests
- **WHEN** eine Seite im Halloween-Skin geladen wird
- **THEN** lädt die Deko keine zusätzliche Bild- oder Schriftdatei
