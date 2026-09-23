# Spec Delta: ui-primitives

## Purpose

Beschreibt die wiederverwendbaren, domänenfreien UI-Bausteine der Website nach
Material Design 3 – Button, Icon-Button, Karte, Chip, Trenner und
Fortschrittsbalken – mit ihren Varianten, Zuständen und
Barrierefreiheitsgarantien, aus denen alle Domänenkomponenten gebaut werden.

## ADDED Requirements

### Requirement: Primitives sind domänenfrei und überall verfügbar
Jedes Primitive MUST ohne Wissen über eine Domäne (Blog, Team, POI, …)
auskommen, darf keine Übersetzungsschlüssel einer Domäne verwenden und MUST in
jeder Domäne ohne expliziten Import nutzbar sein. Sichtbare Texte und
zugängliche Namen SHALL ausschließlich über Props oder Slots hereinkommen.

#### Scenario: Nutzung aus einer Domäne
- **WHEN** eine Komponente im Team-Layer ein Button-Primitive verwendet
- **THEN** wird es ohne Import-Anweisung aufgelöst, und die Modul-Grenzen-Tests bleiben grün

### Requirement: Button mit MD3-Varianten
Das Button-Primitive MUST die Varianten `filled`, `tonal`, `outlined`, `text`
und `elevated` anbieten, mit `filled` als Standard. Es MUST als `<button>`
(mit `type="button"`, sofern nicht anders angegeben), als interner Link oder
als externer Link rendern können. Ein externer Link SHALL
`rel="noopener noreferrer"` tragen, wenn er in einem neuen Tab öffnet. Der
Button MUST optional ein führendes Icon anzeigen und eine Mindesthöhe von
40 px sowie eine Trefferfläche von mindestens 48 × 48 px haben.

#### Scenario: Standard-Button
- **WHEN** das Button-Primitive ohne Variante mit dem Text „Bewerben“ gerendert wird
- **THEN** entsteht ein `<button type="button">` mit Hintergrund `primary`, Text `on-primary` und Radius `full`

#### Scenario: Button als externer Link
- **WHEN** das Button-Primitive eine externe URL erhält und in einem neuen Tab öffnen soll
- **THEN** entsteht ein `<a>` mit `target="_blank"` und `rel="noopener noreferrer"`

#### Scenario: Deaktivierter Button
- **WHEN** ein Button als deaktiviert gerendert wird
- **THEN** ist er nicht fokussierbar bzw. als `disabled` markiert, zeigt die MD3-Deaktiviert-Darstellung (Inhalt 38 %, Container 12 % `on-surface`) und löst beim Klick kein Ereignis aus

### Requirement: Icon-Button mit Pflicht-Label
Das Icon-Button-Primitive MUST die Varianten `standard`, `filled`, `tonal` und
`outlined` anbieten und MUST einen zugänglichen Namen verlangen; ohne ihn SHALL
der Typcheck fehlschlagen. Er MUST optional als Umschalter mit
`aria-pressed` arbeiten und SHALL unabhängig von der sichtbaren Größe eine
Trefferfläche von mindestens 48 × 48 px haben.

#### Scenario: Icon-Button ohne Label
- **WHEN** ein Icon-Button ohne zugänglichen Namen verwendet wird
- **THEN** meldet der Typcheck einen Fehler

#### Scenario: Umschalter
- **WHEN** ein Icon-Button als Umschalter im ausgewählten Zustand gerendert wird
- **THEN** trägt er `aria-pressed="true"` und die ausgewählte Darstellung seiner Variante

### Requirement: Karte mit MD3-Varianten
Das Karten-Primitive MUST die Varianten `elevated`, `filled` und `outlined`
anbieten und Bereiche für Medien, Inhalt und Aktionen bereitstellen. Ist die
Karte als Ganzes klickbar, MUST genau ein Link oder Button die gesamte Karte
abdecken, und weitere Aktionen in der Karte SHALL einzeln erreichbar bleiben.
Eine klickbare Karte MUST State Layer und Fokusindikator zeigen.

#### Scenario: Klickbare Artikelkarte
- **WHEN** eine Artikelkarte als Ganzes auf einen Artikel verlinkt
- **THEN** enthält sie genau einen Link auf den Artikel, ein Klick irgendwo auf die Karte folgt ihm, und der Tastaturfokus landet einmal auf der Karte

#### Scenario: Karte mit eigener Aktion
- **WHEN** eine klickbare Karte zusätzlich einen Teilen-Button enthält
- **THEN** ist der Teilen-Button separat per Tab erreichbar und löst beim Klick nicht die Kartennavigation aus

### Requirement: Chip für Filter, Hinweise und Status
Das Chip-Primitive MUST die MD3-Typen `assist`, `filter` und `suggestion`
anbieten sowie eine nicht interaktive Darstellung für Status- und
Kategorie-Kennzeichnungen. Ein Filter-Chip MUST seinen Auswahlzustand über
`aria-pressed` mitteilen und im ausgewählten Zustand ein Häkchen zeigen. Die
Farbe einer nicht interaktiven Kennzeichnung SHALL aus einer Rolle oder Custom
Color stammen.

#### Scenario: Ausgewählter Filter-Chip
- **WHEN** ein Filter-Chip ausgewählt ist
- **THEN** trägt er `aria-pressed="true"`, Hintergrund `secondary-container` und ein führendes Häkchen

#### Scenario: Status-Kennzeichnung
- **WHEN** ein POI-Status als Kennzeichnung gerendert wird
- **THEN** entsteht ein nicht fokussierbares Element ohne Button-Rolle

### Requirement: Trenner und linearer Fortschritt
Das Trenner-Primitive MUST in der Rolle `outline-variant` rendern und
semantisch als Trennlinie erkennbar sein, sofern es nicht als dekorativ
markiert ist. Das Fortschritts-Primitive MUST einen bestimmten Fortschritt mit
`role="progressbar"`, `aria-valuenow`, `aria-valuemin` und `aria-valuemax`
darstellen und einen zugänglichen Namen verlangen.

#### Scenario: Fortschritt eines POI-Ziels
- **WHEN** ein Fortschritt von 40 % mit dem Namen „Baufortschritt“ gerendert wird
- **THEN** hat das Element `role="progressbar"`, `aria-valuenow="40"` und den zugänglichen Namen „Baufortschritt“

### Requirement: Primitives erweitern statt überschreiben
Jedes Primitive MUST zusätzliche Klassen und Attribute des Aufrufers an sein
Wurzelelement weitergeben, damit Layout (Abstände, Breite, Rasterposition)
von außen gesetzt werden kann. Farbe, Form, Typografie und Zustände SHALL
ausschließlich über Props (Variante, Größe, Farbe) steuerbar sein.

#### Scenario: Layoutklasse von außen
- **WHEN** ein Aufrufer `class="w-full mt-4"` an einen Button übergibt
- **THEN** trägt das Wurzelelement diese Klassen zusätzlich zu seinen eigenen

### Requirement: Primitives sind in Hell und Dunkel barrierefrei
Jede Variante jedes Primitives MUST in beiden Schemata die Kontrastanforderung
für ihren Inhalt erfüllen, per Tastatur bedienbar sein und den
Fokusindikator zeigen. Die Lighthouse-Accessibility-Bewertung der Website MUST
durch die Einführung der Primitives mindestens 0,9 bleiben.

#### Scenario: Tastaturbedienung
- **WHEN** ein Besucher per Tab zu einem Button navigiert und Enter oder Leertaste drückt
- **THEN** wird dieselbe Aktion ausgelöst wie bei einem Mausklick
