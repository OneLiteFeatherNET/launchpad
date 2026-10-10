# Spec Delta: seasonal-theming

## Purpose

Legt fest, wann die Website eine saisonale Verkleidung trägt, wie sie vorab
angesehen oder abgeschaltet wird und dass eine Saison die gesamte Farbgebung
vollständig, kontrastsicher und ohne Brüche zwischen Server und Browser ersetzt.

## ADDED Requirements

### Requirement: Eine Saison ist über ein Kalenderfenster in Berliner Zeit aktiv
Jede Saison MUST ein Start- und ein Enddatum (Monat und Tag, beide inklusive)
haben. Eine Saison SHALL genau dann aktiv sein, wenn das aktuelle Datum in der
Zeitzone `Europe/Berlin` in ihrem Fenster liegt. Ein Fenster, dessen Ende vor
dem Start liegt, MUST über den Jahreswechsel reichen. Außerhalb jedes Fensters
SHALL keine Saison aktiv sein und die Website unverändert rendern.

#### Scenario: Tag im Fenster
- **WHEN** eine Seite am 25. Oktober um 12:00 Uhr Berliner Zeit angefragt wird
- **THEN** ist die Halloween-Saison aktiv

#### Scenario: Mitternacht in Berlin, noch Vortag in UTC
- **WHEN** eine Seite am 19. Oktober um 22:30 UTC (20. Oktober, 00:30 Uhr Berliner Zeit) angefragt wird
- **THEN** ist die Halloween-Saison aktiv

#### Scenario: Außerhalb jedes Fensters
- **WHEN** eine Seite am 15. Juli angefragt wird
- **THEN** trägt das `<html>`-Element kein `data-season`-Attribut und alle Farben entsprechen dem Basis-Schema

#### Scenario: Fenster über den Jahreswechsel
- **WHEN** eine Saison vom 20. Dezember bis 6. Januar definiert ist und der 2. Januar geprüft wird
- **THEN** ist diese Saison aktiv

### Requirement: Saison lässt sich vorab ansehen und ohne Build abschalten
Eine Laufzeit-Einstellung `NUXT_PUBLIC_SEASON` MUST eine Saison für alle
Anfragen erzwingen (`<id>`) oder abschalten (`none`), ohne neuen Build, und
SHALL Vorrang vor dem Kalender haben. Ein Query-Parameter `season` MUST die
Saison im Browser nach dem Laden erzwingen (`?season=<id>`) oder abschalten
(`?season=none`); das server-gerenderte HTML MUST davon unabhängig bleiben,
weil es an der Edge gecacht wird. Ein unbekannter Wert MUST ignoriert werden,
statt die Saison abzuschalten.

#### Scenario: Vorschau außerhalb der Saison
- **WHEN** am 1. September `/de?season=halloween` im Browser geladen wird
- **THEN** zeigt die Seite nach dem Laden den Halloween-Skin, während das server-gerenderte HTML kein `data-season` trägt

#### Scenario: Notschalter in Produktion
- **WHEN** `NUXT_PUBLIC_SEASON=none` gesetzt ist und am 25. Oktober eine Seite angefragt wird
- **THEN** rendert die Seite im Basis-Schema

#### Scenario: Tippfehler im Override
- **WHEN** am 25. Oktober `/?season=halloweeen` aufgerufen wird
- **THEN** ist die Halloween-Saison weiterhin aktiv

### Requirement: Server und Browser entscheiden dieselbe Saison
Die Saison MUST pro Anfrage einmal auf dem Server bestimmt und an den Client
übergeben werden. Der Client SHALL die Entscheidung nicht anhand seiner
eigenen Uhr oder Zeitzone neu treffen; einzig eine ausdrückliche
`?season=`-Vorschau darf sie nach der Hydration ersetzen. Das `<html>`-Element MUST die aktive
Saison bereits im server-gerenderten HTML tragen, sodass kein Umschalten nach
dem Laden sichtbar ist.

#### Scenario: Abweichende Geräteuhr
- **WHEN** der Server die Halloween-Saison bestimmt hat und die Uhr des Geräts auf den 1. Januar gestellt ist
- **THEN** bleibt die Seite nach der Hydration im Halloween-Skin und die Konsole meldet keinen Hydration-Mismatch

#### Scenario: Kein Aufblitzen des Basis-Schemas
- **WHEN** eine Seite während der Saison mit deaktiviertem JavaScript geladen wird
- **THEN** rendert sie im Halloween-Skin

### Requirement: Eine Saison ersetzt jede Farbrolle vollständig
Eine aktive Saison MUST für jede MD3-Farbrolle und jede Custom Color des
Basis-Schemas einen eigenen Wert für Hell und Dunkel liefern. Diese Werte
MUST reproduzierbar aus den Seed-Farben der Saison erzeugt werden, auf
demselben Weg wie das Basis-Schema, und SHALL durch dieselbe Prüfung als
aktuell nachgewiesen werden. Feste Markenfarben außerhalb der Rollen
(Verläufe, Glow-Farben) MUST eine Saison ebenfalls neu belegen.

#### Scenario: Keine Rolle bleibt im Basis-Schema
- **WHEN** die Halloween-Saison aktiv ist
- **THEN** unterscheidet sich der berechnete Wert jeder Farbrolle mit Markenbezug (`primary*`, `secondary*`, `tertiary*`, `surface*`, `outline*`, `inverse-*`) vom Basis-Schema

#### Scenario: Verlauf und Glow
- **WHEN** die Halloween-Saison aktiv ist
- **THEN** zeigen die Wortmarke (`GradientText`) und der Glow der Verbindungsbox Farben der Saison, nicht Blau, Cyan oder Magenta des Basis-Schemas

#### Scenario: Handänderung am Saison-Block
- **WHEN** ein erzeugter Saisonwert von Hand geändert wird
- **THEN** schlägt `pnpm test` fehl und nennt die geänderte Rolle

### Requirement: Saison-Rollen erfüllen dieselben Kontrastminima
Für jede Saison MUST jedes Rollenpaar, das für das Basis-Schema auf Kontrast
geprüft wird, in Hell und Dunkel dasselbe Minimum erfüllen (4,5:1 für Text,
3:1 für Fokus- und Rahmenelemente).

#### Scenario: Kontrastprüfung pro Saison
- **WHEN** die Testsuite läuft
- **THEN** werden alle geprüften Rollenpaare für das Basis-Schema und für jede Saison in beiden Schemata gemessen, und ein Unterschreiten nennt Saison, Paar, Schema und Wert

### Requirement: Browser-Chrome und Favicon folgen der Saison
Während einer Saison MUST die `theme-color`-Angabe für Hell und Dunkel der
Surface-Rolle der Saison entsprechen. Eine Saison MAY ein eigenes Logo und
Favicon festlegen; tut sie das, MUST genau ein Favicon-Link ausgeliefert
werden und die Navigation das Saison-Logo mit demselben Alternativtext wie
das Basis-Logo zeigen.

#### Scenario: Adressleiste auf dem Smartphone
- **WHEN** die Halloween-Saison aktiv ist und das Gerät im Dunkelmodus ist
- **THEN** entspricht der `theme-color`-Wert für `prefers-color-scheme: dark` dem dunklen `surface`-Wert der Halloween-Saison

#### Scenario: Ein einziges Favicon
- **WHEN** die Halloween-Saison aktiv ist
- **THEN** enthält der `<head>` genau einen `rel="icon"`-Link, und er zeigt auf das Halloween-Favicon

### Requirement: Saisonale Dekoration beeinträchtigt die Seite nicht
Dekorative Elemente einer Saison MUST vor assistiven Technologien verborgen
sein, MUST Zeigereingaben durchlassen, SHALL nicht über der Navigation oder
geöffneten Menüs liegen und MUST keine Layoutverschiebung verursachen. Bei
`prefers-reduced-motion: reduce` MUST keine dekorative Bewegung stattfinden.
Außerhalb einer Saison MUST keine Deko im DOM stehen.

#### Scenario: Screenreader
- **WHEN** die Halloween-Saison aktiv ist und die Seite mit einem Screenreader gelesen wird
- **THEN** wird kein Deko-Element angesagt

#### Scenario: Klick durch die Deko
- **WHEN** ein Deko-Element über einem Link liegt und der Link angeklickt wird
- **THEN** folgt der Browser dem Link

#### Scenario: Reduzierte Bewegung
- **WHEN** das System `prefers-reduced-motion: reduce` meldet
- **THEN** bewegt sich kein Deko-Element

#### Scenario: Keine Saison
- **WHEN** keine Saison aktiv ist
- **THEN** enthält das HTML kein Deko-Element
