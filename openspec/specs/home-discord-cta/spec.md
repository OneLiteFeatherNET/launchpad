# home-discord-cta Specification

## Purpose
Besucher der Startseite finden Discord sofort und ebenso prominent wie die
Serveradresse.

## Requirements

### Requirement: Ein Discord-Block steht direkt unter dem Karussell
Die Startseite MUST direkt nach dem Karussell einen Abschnitt mit einer
`h2`-Überschrift, einem Satz Werbetext und einer Schaltfläche „Discord
beitreten“ (de) beziehungsweise „Join Discord“ (en) zeigen, unmittelbar vor
den Serveradressen. Die Schaltfläche SHALL ein echter Link (`<a>`) auf
`runtimeConfig.public.discordUrl` sein, öffnet in einem neuen Tab und trägt
`rel="noopener noreferrer"`. Der Abschnitt ist über `aria-labelledby` benannt;
die Seite hat weiterhin genau einen `h1`.

#### Scenario: Reihenfolge
- **WHEN** `/de` oder `/en` gerendert wird
- **THEN** folgt der Discord-Abschnitt dem Karussell, und die Serveradressen folgen dem Discord-Abschnitt

#### Scenario: Schaltfläche
- **WHEN** der Abschnitt gerendert wird
- **THEN** ist die Schaltfläche ein `a` mit `href="https://1lf.link/discord"` und `rel` mit `noopener`

### Requirement: Die Mitgliederzahl ist optional
Der Block MUST die Zahl der Mitglieder (für die Sprache formatiert) nennen,
wenn die Seite sie liefert, und sonst nur die Zahl weglassen. Der Block ruft
selbst nichts ab; die Seite reicht die Zahl aus dem bereits abgerufenen
Datensatz durch.

#### Scenario: Zahl vorhanden
- **WHEN** die Seite `1234` liefert
- **THEN** erscheint „1.234“ (de) im Block

#### Scenario: Zahl fehlt
- **WHEN** die Seite `null` liefert
- **THEN** zeigt der Block Überschrift, Text und Schaltfläche ohne Zahl

### Requirement: Der Block folgt den Konventionen der Startseite
Der Abschnitt SHALL als `LazyDiscordCta` mit `hydrate-on-visible` gesetzt
werden, seine Daten kommen auf Seitenebene, Texte stehen in
`i18n/locales/{de,en}.json` unter `home.discord`, Farben kommen aus den
MD3-Rollen.

#### Scenario: Texte in beiden Sprachen
- **WHEN** die i18n-Tests laufen
- **THEN** besitzen `de` und `en` dieselben Schlüssel unter `home.discord`
