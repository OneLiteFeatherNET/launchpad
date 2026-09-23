# design-system-governance Specification

## Purpose

Legt die automatisch geprüften Regeln fest, die Stilentscheidungen in den
Tokens und Primitives halten, und macht den Fortschritt der Migration auf
Material Design 3 messbar, sodass Rückfälle in Einzelanfertigungen im CI
auffallen statt im Review.

## Requirements

### Requirement: Außerhalb des Designsystems nur Rollen-Farben
In Komponenten, Seiten und Layouts außerhalb des `base`-Layers MUST jede
Farb-Utility eine MD3-Farbrolle, eine Custom Color, `transparent` oder
`current` nennen. Tailwind-Standardpaletten (z. B. `neutral`, `gray`, `slate`,
`zinc`, `blue`), `white`/`black` mit oder ohne Deckkraft und beliebige
Farbwerte in eckigen Klammern SHALL zu einem Testfehler mit Datei und Zeile
führen. Die Marken-Verlaufsklassen für Verlaufstext SHALL erlaubt bleiben.

#### Scenario: Rohfarbe in einer Domänenkomponente
- **WHEN** eine Komponente im Blog-Layer `text-gray-600` verwendet
- **THEN** schlägt die Testsuite fehl und nennt Datei, Zeile und Klasse

#### Scenario: Rollen-Farbe
- **WHEN** dieselbe Komponente stattdessen `text-on-surface-variant` verwendet
- **THEN** besteht die Prüfung

### Requirement: Keine farbigen Dunkelmodus-Varianten außerhalb des Designsystems
Außerhalb der Token-Definitionen MUST keine `dark:`-Variante eine Farb-,
Schatten- oder Deckkraft-Utility tragen. Nicht farbliche `dark:`-Varianten
(z. B. zum Tausch eines Bildes) SHALL erlaubt bleiben.

#### Scenario: Farbige Dunkelmodus-Variante
- **WHEN** eine Seite `dark:bg-neutral-900` verwendet
- **THEN** schlägt die Testsuite fehl und verweist auf die Rollen-Tokens

### Requirement: Nur MD3-Formen und -Elevation außerhalb des Designsystems
Außerhalb des `base`-Layers MUST jede Radius-Utility eine MD3-Shape-Stufe
nennen und jede Schatten-Utility eine MD3-Elevation-Stufe oder `shadow-none`.
Tailwind-Standardradien und -schatten sowie beliebige Werte in eckigen
Klammern SHALL zu einem Testfehler führen.

#### Scenario: Tailwind-Standardradius
- **WHEN** eine Karte außerhalb des `base`-Layers `rounded-2xl` verwendet
- **THEN** schlägt die Testsuite fehl und nennt die nächstliegende MD3-Stufe

### Requirement: Interaktive Grundelemente kommen aus den Primitives
Außerhalb des `base`-Layers MUST jedes `<button>`-Element und jeder als
Button gestaltete Link über ein Primitive gerendert werden. Ein rohes
`<button>` mit eigenen Farb-, Radius- oder Schatten-Utilities SHALL zu einem
Testfehler führen. Ausnahmen MUST einzeln mit Datei und Begründung im Test
registriert sein.

#### Scenario: Handgebauter Button
- **WHEN** eine Komponente im Home-Layer ein `<button class="rounded-full bg-primary …">` enthält
- **THEN** schlägt die Testsuite fehl und verweist auf das Button- bzw. Icon-Button-Primitive

#### Scenario: Registrierte Ausnahme
- **WHEN** ein rohes `<button>` in einer registrierten Ausnahme steht
- **THEN** besteht die Prüfung, und die Ausnahme erscheint mit ihrer Begründung in der Testausgabe

### Requirement: Migrationsstand ist messbar und nur fallend
Solange die Migration läuft, MUST eine Ausnahmeliste jede Datei nennen, die
die obigen Regeln noch verletzt. Eine Datei auf der Liste, die keine Verletzung
mehr enthält, SHALL den Test fehlschlagen lassen, bis sie von der Liste
entfernt ist. Eine neue Datei SHALL NOT auf die Liste gesetzt werden. Die
Migration gilt als abgeschlossen, wenn die Liste leer ist; danach MUST die
Liste entfernt werden.

#### Scenario: Migrierte Datei noch auf der Liste
- **WHEN** `ArticleCard.vue` vollständig migriert ist, aber noch auf der Ausnahmeliste steht
- **THEN** schlägt der Test fehl und fordert das Entfernen des Eintrags

#### Scenario: Neue Datei mit Rohfarbe
- **WHEN** eine neu angelegte Komponente `bg-white` verwendet
- **THEN** schlägt der Test fehl, weil neue Dateien nicht auf die Ausnahmeliste dürfen

### Requirement: Jede Farbklasse löst sich auf
Jede Farb-Utility in einer Vorlage MUST auf einen im Designsystem definierten
Token zeigen; ein Klassenname, der zu keinem Token passt, SHALL zu einem
Testfehler führen. Diese Prüfung MUST auch nach dem Entfernen der Alt-Tokens
greifen.

#### Scenario: Tippfehler in einer Rolle
- **WHEN** eine Komponente `bg-surface-contaner` verwendet
- **THEN** schlägt die Testsuite fehl und nennt die unbekannte Klasse
