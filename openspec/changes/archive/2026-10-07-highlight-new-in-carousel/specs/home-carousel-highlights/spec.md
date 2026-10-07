# Spec Delta

## Purpose

Besucher sehen auf der Startseite zuerst, was auf der Website neu ist.

## ADDED Requirements

### Requirement: Neues der letzten 30 Tage führt das Karussell an
Das Startkarussell MUST Inhalte, deren Veröffentlichungsdatum auf der Website
höchstens 30 Tage vor „jetzt“ liegt und nicht in der Zukunft, als Slides mit dem
Hinweis „Neu“ (de) bzw. „New“ (en) zeigen, das jüngste zuerst. Quellen sind
freigegebene Blogartikel (`releaseDate`, sonst `pubDate`), Community-POIs und
Projekte (je `publishedAt`). Es SHALL höchstens 6 solche Slides geben. Ein Inhalt
ohne Datum MUST nie als neu gelten.

#### Scenario: Neues Projekt
- **WHEN** ein Projekt `publishedAt` vor 3 Tagen trägt
- **THEN** steht sein Slide mit dem Hinweis „Neu“ vor allen kuratierten Slides

#### Scenario: Zu alt oder zukünftig
- **WHEN** ein Inhalt vor 31 Tagen oder erst morgen veröffentlicht wird
- **THEN** erzeugt er keinen Slide

#### Scenario: Mehr als sechs
- **WHEN** acht Inhalte im Fenster liegen
- **THEN** erscheinen die sechs jüngsten

#### Scenario: Noch nicht freigegebener Artikel
- **WHEN** ein Artikel ein `releaseDate` in der Zukunft hat
- **THEN** erscheint er nicht

### Requirement: Events folgen der bestehenden Bewerbungsregel
Beworbene Events (gelistet, im Bewerbungsfenster, höchstens 2) MUST wie bisher vor
den übrigen Slides stehen. Ein unlisted oder verborgenes Event MUST nie
erscheinen. Der Hinweis „Neu“ SHALL nur erscheinen, wenn `announceAt` im
30-Tage-Fenster liegt.

#### Scenario: Unlisted Event
- **WHEN** ein unlisted Event im Bewerbungsfenster liegt
- **THEN** erzeugt es keinen Slide

### Requirement: Slides stammen aus dem Quelldokument
Titel, Bild, Auszug und Autor eines erzeugten Slides MUST aus dem Quelldokument
kommen; Autoren werden über den Personen-Resolver in Namen aufgelöst. Die Payload
MUST weder `path` noch `stem` enthalten.

#### Scenario: Autor
- **WHEN** ein neuer Artikel `author: themeinerlp` trägt
- **THEN** zeigt der Slide den aufgelösten Namen, nicht den Slug

### Requirement: Kuratiertes füllt auf und ist der Rückfall
Slides aus `content/carousel/<locale>/home.json` MUST nach den erzeugten Slides
stehen. Ein kuratierter Slide mit gleichem `href` wie ein erzeugter MUST entfallen.
Ist nichts neu, MUST das Karussell genau die kuratierten Slides zeigen.

#### Scenario: Nichts neu
- **WHEN** kein Inhalt im Fenster liegt
- **THEN** zeigt das Karussell nur die kuratierten Slides

### Requirement: Ein dünnes Karussell wird aufgefüllt
Hat das Karussell nach beworbenen Events, neuen und kuratierten Slides weniger
als 5 Slides, MUST es mit den jüngsten freigegebenen Blogartikeln, Projekten und
Community-POIs aufgefüllt werden, die nicht neu sind, ohne Hinweis „Neu“, das
jüngste zuerst, ohne einen `href`, der schon vorkommt, bis 5 erreicht sind oder
die Quellen erschöpft sind. Das Datum eines Eintrags ist bei Artikeln
`releaseDate ?? pubDate`, bei POIs `publishedAt ?? updatedAt ?? startedAt`, bei
Projekten `publishedAt ?? releasedAt`; ein Eintrag mit Datum in der Zukunft MUST
entfallen.

#### Scenario: Wenig Neues
- **WHEN** nur ein neuer und zwei kuratierte Slides existieren und genug ältere Inhalte
- **THEN** zeigt das Karussell 5 Slides, die letzten beiden ohne Hinweis „Neu“

#### Scenario: Genug Slides
- **WHEN** schon 5 Slides existieren
- **THEN** wird nichts aufgefüllt

### Requirement: „Jetzt“ ist ein Parameter
Die Auswahl MUST eine reine Funktion von Daten und einem übergebenen Zeitpunkt
sein; der Zeitpunkt MUST auf dem Server einmal entschieden und in der Payload
übergeben werden.

#### Scenario: Fester Zeitpunkt
- **WHEN** dieselben Daten mit demselben Zeitpunkt zweimal ausgewertet werden
- **THEN** sind die Slides identisch

### Requirement: Der Hinweis ist zugänglich
Der Hinweis MUST sichtbarer Text sein, und das Label des Slides (`getSlideLabel`,
Live-Region, `aria-label`) MUST ihn tragen („Neu: Titel“). Texte MUST in de und en
übersetzt sein.

#### Scenario: Slide-Ansage
- **WHEN** ein neuer Slide aktiv wird
- **THEN** nennt die Live-Region „Neu: <Titel>“ samt Position
