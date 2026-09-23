# Spec Delta: design-tokens

## Purpose

Legt das gemeinsame visuelle Vokabular der Website nach Material Design 3 fest:
Farbrollen, Typografie, Formen, Elevation, Interaktionszustände, Fokus und
Bewegung – jeweils als benannte Tokens, die in Hell- und Dunkelmodus gleich
angesprochen werden.

## ADDED Requirements

### Requirement: Farben werden über MD3-Farbrollen angesprochen
Das Designsystem MUST für jede der folgenden MD3-Farbrollen einen Token
bereitstellen, der als Hintergrund-, Text-, Rahmen-, Ring-, Outline-, Fill-
und Stroke-Farbe nutzbar ist: `primary`, `on-primary`, `primary-container`,
`on-primary-container`, `secondary`, `on-secondary`, `secondary-container`,
`on-secondary-container`, `tertiary`, `on-tertiary`, `tertiary-container`,
`on-tertiary-container`, `error`, `on-error`, `error-container`,
`on-error-container`, `surface`, `on-surface`, `on-surface-variant`,
`surface-dim`, `surface-bright`, `surface-container-lowest`,
`surface-container-low`, `surface-container`, `surface-container-high`,
`surface-container-highest`, `outline`, `outline-variant`,
`inverse-surface`, `inverse-on-surface`, `inverse-primary`, `scrim` und
`shadow`. Jede Rolle SHALL genau einen Wert für das helle und einen für das
dunkle Schema haben.

#### Scenario: Rolle ist als Utility nutzbar
- **WHEN** eine Komponente `bg-primary-container text-on-primary-container` verwendet und die Seite gebaut wird
- **THEN** enthält das erzeugte CSS für beide Klassen eine Regel, deren Farbwert aus dem jeweiligen Rollen-Token stammt

#### Scenario: Rolle mit Deckkraft-Modifikator
- **WHEN** eine Komponente `bg-primary/10` verwendet
- **THEN** rendert der Hintergrund in beiden Schemata als Primärfarbe des jeweiligen Schemas mit 10 % Deckkraft

### Requirement: Farbrollen entstehen reproduzierbar aus den Markenfarben
Die Werte der Farbrollen MUST mit dem MD3-Farbalgorithmus aus den Kernfarben
`#2A388F` (primary), `#27A9E1` (secondary) und `#EC008B` (tertiary) erzeugt
werden. Die Markenfarben Orange (`#F7931D`) und Violett (`#91268F`) MUST als
Custom Colors mit je den Rollen Farbe, On-Farbe, Container und On-Container
bereitstehen und SHALL NOT an die Primärfarbe angeglichen (harmonisiert)
werden. Die eingecheckten Werte MUST mit einer erneuten Erzeugung aus
denselben Eingaben übereinstimmen.

#### Scenario: Eingecheckte Werte sind aktuell
- **WHEN** die Erzeugung mit unveränderten Kernfarben erneut ausgeführt wird
- **THEN** unterscheidet sich das Ergebnis nicht von den eingecheckten Token-Werten

#### Scenario: Manuelle Änderung eines erzeugten Werts
- **WHEN** jemand den Wert von `primary` von Hand ändert, ohne die Kernfarben zu ändern
- **THEN** schlägt die Testsuite fehl und nennt den abweichenden Token

### Requirement: Hell- und Dunkelmodus folgen einem einzigen Signal
Alle Farbrollen MUST ohne komponentenseitige Dunkelmodus-Varianten zwischen
hellem und dunklem Schema wechseln. Das aktive Schema SHALL der
Systemeinstellung `prefers-color-scheme` folgen. Die `theme-color`-Angaben
des Dokuments MUST dem Wert der Rolle `surface` im jeweiligen Schema
entsprechen.

#### Scenario: System im Dunkelmodus
- **WHEN** ein Besucher mit `prefers-color-scheme: dark` eine Seite öffnet
- **THEN** zeigen alle mit Rollen-Tokens gestalteten Flächen und Texte die Werte des dunklen Schemas, ohne dass die Komponente eine `dark:`-Variante trägt

#### Scenario: Browser-Chrome passt zur Seite
- **WHEN** die Seite im hellen bzw. dunklen Schema geladen wird
- **THEN** entspricht der jeweilige `theme-color`-Meta-Wert dem Wert von `surface` in diesem Schema

### Requirement: Rollenpaare erfüllen WCAG-Kontrast in beiden Schemata
Jedes Paar aus einer Rolle und ihrer On-Rolle (`primary`/`on-primary`,
`primary-container`/`on-primary-container`, entsprechend für `secondary`,
`tertiary`, `error` und die Custom Colors) sowie `on-surface` und
`on-surface-variant` auf jeder `surface`- und `surface-container`-Stufe MUST in
beiden Schemata ein Kontrastverhältnis von mindestens 4,5:1 erreichen.
`outline` auf jeder `surface`-Stufe MUST mindestens 3:1 erreichen.

#### Scenario: Kontrastprüfung über alle Paare
- **WHEN** die Testsuite läuft
- **THEN** wird jedes genannte Paar in beiden Schemata berechnet, und ein Paar unter der Schwelle lässt den Test mit Paar, Schema und gemessenem Verhältnis fehlschlagen

### Requirement: Typografie folgt der MD3-Typeskala
Das Designsystem MUST die 15 MD3-Typostile `display`, `headline`, `title`,
`body` und `label` jeweils in `large`, `medium` und `small` bereitstellen. Jeder
Stil SHALL Schriftgröße, Zeilenhöhe, Schriftstärke und Laufweite gemeinsam
festlegen. Die Schriftfamilie MUST der System-Font-Stack bleiben; es SHALL
kein Web-Font geladen werden.

#### Scenario: Ein Typostil setzt alle Eigenschaften
- **WHEN** ein Element die Klasse `text-title-medium` trägt
- **THEN** erhält es Schriftgröße, Zeilenhöhe, Schriftstärke und Laufweite des MD3-Stils „Title Medium“

#### Scenario: Kein zusätzlicher Font-Request
- **WHEN** eine beliebige Seite geladen wird
- **THEN** stellt der Browser keine Anfrage nach einer Schriftdatei

### Requirement: Formen, Elevation und Bewegung sind benannte Skalen
Das Designsystem MUST die MD3-Shape-Stufen `none`, `extra-small` (4 px),
`small` (8 px), `medium` (12 px), `large` (16 px), `extra-large` (28 px) und
`full` als Radius-Tokens, die Elevation-Stufen 0 bis 5 als Schatten-Tokens
sowie die MD3-Easing-Kurven `standard` und `emphasized` (jeweils mit
`-accelerate`/`-decelerate`) bereitstellen. Die bestehenden Tailwind-Stufen
`rounded-sm`, `rounded-md`, `rounded-lg` usw. SHALL NOT umdefiniert werden.

#### Scenario: Shape-Token
- **WHEN** eine Karte `rounded-medium` trägt
- **THEN** beträgt ihr Eckenradius 12 px

#### Scenario: Reduzierte Bewegung bleibt wirksam
- **WHEN** ein Besucher `prefers-reduced-motion: reduce` gesetzt hat
- **THEN** laufen Übergänge, die die MD3-Easing-Tokens nutzen, ohne sichtbare Animation ab

### Requirement: Interaktionszustände werden über State Layer dargestellt
Das Designsystem MUST einen State Layer bereitstellen, der über die Fläche
eines interaktiven Elements eine Schicht in dessen Inhaltsfarbe legt: 8 %
Deckkraft bei Hover, 10 % bei Fokus und 10 % bei Druck. Ein deaktiviertes
Element SHALL keinen State Layer zeigen. Der State Layer MUST ohne
zusätzliches DOM-Element auskommen.

#### Scenario: Hover über einem Tonal-Button
- **WHEN** der Mauszeiger über einem Element mit State Layer steht
- **THEN** liegt über seinem Hintergrund die Inhaltsfarbe mit 8 % Deckkraft

#### Scenario: Deaktiviertes Element
- **WHEN** ein deaktiviertes Element mit State Layer überfahren wird
- **THEN** ändert sich sein Erscheinungsbild nicht

### Requirement: Fokus ist einheitlich und nur bei Tastaturfokus sichtbar
Das Designsystem MUST einen Fokusindikator bereitstellen: eine 3 px breite
Kontur in der Rolle `secondary` mit 2 px Abstand zum Element. Der Indikator
SHALL nur bei `:focus-visible` erscheinen und MUST zur Rolle `secondary` auf
jeder `surface`-Stufe mindestens 3:1 Kontrast haben.

#### Scenario: Tastaturfokus
- **WHEN** ein Besucher per Tab-Taste auf ein interaktives Element wechselt
- **THEN** zeigt das Element die 3-px-Kontur in `secondary`

#### Scenario: Mausklick
- **WHEN** ein Besucher mit der Maus auf dasselbe Element klickt
- **THEN** erscheint keine Fokuskontur

### Requirement: Alt-Tokens werden nach der Migration entfernt
Nach Abschluss der Migration MUST das Designsystem die Tokens `bg`, `text`,
`muted`, `border`, die numerische Skala `brand-50` bis `brand-900` und die
Tokens `secondary-pink`, `secondary-orange`, `secondary-purple`,
`secondary-blue` und `secondary-cyan` nicht mehr definieren. Die Marken-Verläufe
für Verlaufstext SHALL erhalten bleiben.

#### Scenario: Alt-Token nach Abschluss
- **WHEN** nach Abschluss der Migration eine Komponente `text-muted` verwendet
- **THEN** schlägt die Testsuite fehl, weil der Token nicht definiert ist
