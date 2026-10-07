# Spec Delta

## ADDED Requirements

### Requirement: Nicht gelistete Events sind nur per Link erreichbar
Ein Event MAY im Frontmatter `unlisted: true` tragen; ohne Angabe ist es
öffentlich. Die Detailseite eines nicht gelisteten Events MUST in jeder
Phase, auch *verborgen*, mit Status 200 antworten. Ein nicht gelistetes
Event MUST NOT auf der Übersicht, im Carousel oder in der Sitemap erscheinen,
unabhängig von Phase und `promote`. Seine Detailseite MUST `noindex`
ausliefern. Hreflang-Verweise und der Sprachwechsel SHALL auf die
Übersetzung führen wie bei öffentlichen Events.

#### Scenario: Link vor der Ankündigung
- **WHEN** `/de/events/slender` mit `unlisted: true` vor dessen `announceAt` aufgerufen wird
- **THEN** antwortet die Seite mit 200, zeigt den Inhalt samt Anleitungen und trägt `noindex`

#### Scenario: Laufend, aber nicht gelistet
- **WHEN** ein nicht gelistetes Event läuft
- **THEN** erscheint es weder unter *Aktuell* auf der Übersicht noch im Carousel noch in der Sitemap, und seine Detailseite antwortet mit 200 und `noindex`

#### Scenario: Nach dem Ende
- **WHEN** ein nicht gelistetes Event vergangen ist
- **THEN** erscheint es nicht unter *Vergangen*, und seine Detailseite zeigt weiterhin Inhalt und Ergebnis

#### Scenario: Unbekannter Slug bleibt 404
- **WHEN** ein Slug aufgerufen wird, zu dem kein Event existiert
- **THEN** antwortet die Seite mit 404, unabhängig davon, ob es nicht gelistete Events gibt

### Requirement: Die Vorschau eines noch nicht angekündigten Events ist als solche erkennbar
Zeigt die Detailseite ein nicht gelistetes Event in der Phase *verborgen*,
MUST sie statt des Phasen-Kennzeichens ein Kennzeichen „Vorschau“ (en:
„Preview“) und einen Hinweis mit dem Startzeitpunkt zeigen. Die Vorschau
MUST serverseitig bestimmt werden und nach der Hydrierung unverändert
bleiben.

#### Scenario: Vorschau mit Startzeit
- **WHEN** ein nicht gelistetes Event vor `announceAt` aufgerufen wird
- **THEN** zeigt der Kopf das Kennzeichen „Vorschau“ und den Hinweis „Startet am“ mit dem Zeitraum in Serverzeit

#### Scenario: Ankündigung erreicht
- **WHEN** dasselbe Event nach `announceAt` frisch gerendert wird
- **THEN** zeigt es das Kennzeichen „Angekündigt“ und bleibt weiterhin nicht gelistet

### Requirement: Widersprüchliche Sichtbarkeit wird bei der Inhaltsprüfung abgelehnt
Ein Event mit `unlisted: true` und einem `promote`-Objekt MUST die
Inhaltsprüfung der Testsuite mit Dateiname und Feldnamen fehlschlagen lassen.
`unlisted: true` zusammen mit `promote: false` SHALL zulässig sein.
Sprachfassungen mit demselben `translationKey` MUST denselben Wert für
`unlisted` haben, sonst schlägt die Inhaltsprüfung mit beiden Dateinamen
fehl.

#### Scenario: Beworbenes, nicht gelistetes Event
- **WHEN** eine Event-Datei `unlisted: true` und `promote: { from: … }` enthält
- **THEN** schlägt die Inhaltsprüfung mit dem Dateinamen und den Feldern `unlisted` und `promote` fehl

#### Scenario: Nur eine Sprachfassung nicht gelistet
- **WHEN** `events/de/slender.md` `unlisted: true` trägt und die englische Fassung mit demselben `translationKey` nicht
- **THEN** schlägt die Inhaltsprüfung mit beiden Dateinamen fehl

## MODIFIED Requirements

### Requirement: Verborgene Events sind nirgends sichtbar
Ein Event in der Phase *verborgen* MUST NOT auf der Übersicht, im Carousel
oder in der Sitemap erscheinen, und seine Detailseite MUST mit Status 404
antworten, es sei denn, das Event ist nicht gelistet (`unlisted: true`).
Dann gilt die Anforderung „Nicht gelistete Events sind nur per Link
erreichbar“.

#### Scenario: Direkter Aufruf vor der Ankündigung
- **WHEN** `/de/events/herbst-bauevent` ohne `unlisted` vor dessen `announceAt` aufgerufen wird
- **THEN** antwortet die Seite mit 404 und `noindex`

### Requirement: Die Übersicht gliedert Events nach Phase
`/<locale>/events` MUST immer mit Status 200 erreichbar sein und SHALL drei
Sektionen in dieser Reihenfolge zeigen: *Aktuell* mit allen laufenden
gelisteten Events, nach `startsAt` aufsteigend; *Demnächst* mit allen
angekündigten gelisteten Events, nach `startsAt` aufsteigend; *Vergangen*
mit allen vergangenen gelisteten Events, nach `endsAt` absteigend. Nicht
gelistete Events MUST in keiner Sektion erscheinen. Läuft kein gelistetes
Event, MUST *Aktuell* einen Leerhinweis mit Verweis auf den Discord zeigen.
Gibt es keine angekündigten gelisteten Events, MUST *Demnächst* entfallen.
Gibt es keine vergangenen gelisteten Events, MUST *Vergangen* entfallen.
Jede Event-Karte SHALL Titel, Zusammenfassung, Typ, Zeitraum, Zugangsart
(außer bei `open`) und – falls vorhanden – ein Vorschaubild zeigen und zur
Detailseite führen.

#### Scenario: Nichts läuft, Archiv vorhanden
- **WHEN** kein Event läuft, keines angekündigt ist und zwei vergangene Events existieren
- **THEN** zeigt die Seite den Leerhinweis unter *Aktuell*, keine Sektion *Demnächst* und beide Events unter *Vergangen*, das zuletzt beendete zuerst

#### Scenario: Noch nie ein Event
- **WHEN** keine Events existieren
- **THEN** antwortet `/en/events` mit 200 und zeigt nur *Aktuell* mit Leerhinweis

#### Scenario: Nur ein nicht gelistetes Event läuft
- **WHEN** das einzige laufende Event `unlisted: true` hat
- **THEN** zeigt *Aktuell* den Leerhinweis

#### Scenario: Karte eines geschlossenen Events
- **WHEN** ein laufendes Event `access.mode: application` hat
- **THEN** trägt seine Karte eine Kennzeichnung „Bewerbung“ ohne eigene Button-Rolle

### Requirement: Laufende Events werden im Startseiten-Carousel beworben
Ein Event MUST im Carousel der Startseite erscheinen, solange der Zeitpunkt
der Anfrage in seinem Promotionsfenster liegt, es nicht *verborgen* ist und
es gelistet ist. Das Promotionsfenster SHALL standardmäßig
`startsAt` bis `endsAt` sein und MUST sich über `promote.from` und
`promote.until` einzeln überschreiben lassen; `promote: false` MUST die
Promotion abschalten. Beworbene Events MUST vor allen redaktionell
gepflegten Slides stehen, nach `startsAt` aufsteigend sortiert, und es MUST
höchstens zwei Event-Slides geben. Ein Event-Slide SHALL zur Detailseite
führen.

#### Scenario: Standard-Promotion
- **WHEN** ein Event ohne `promote`-Angabe läuft
- **THEN** ist es der erste Slide des Carousels und verlinkt auf seine Detailseite

#### Scenario: Werbung schon während der Ankündigung
- **WHEN** ein angekündigtes Event `promote.from` vor seinem `startsAt` hat und dieser Zeitpunkt erreicht ist
- **THEN** erscheint es im Carousel, obwohl es noch nicht läuft

#### Scenario: Mehr als zwei laufende Events
- **WHEN** drei Events gleichzeitig im Promotionsfenster liegen
- **THEN** zeigt das Carousel die zwei mit dem frühesten `startsAt`, gefolgt von den redaktionellen Slides

#### Scenario: Keine Promotion gewünscht
- **WHEN** ein laufendes Event `promote: false` hat
- **THEN** erscheint es nicht im Carousel, wohl aber unter *Aktuell* auf der Übersicht

#### Scenario: Nicht gelistetes Event läuft
- **WHEN** ein nicht gelistetes Event ohne `promote`-Angabe läuft
- **THEN** erscheint es nicht im Carousel

### Requirement: Die Sitemap enthält genau die sichtbaren Events
Die Sitemap MUST `/<locale>/events` sowie die Detailseite jedes gelisteten
Events in den Phasen *angekündigt*, *läuft* und *vergangen* enthalten und
MUST NOT Events in der Phase *verborgen* oder nicht gelistete Events
enthalten. Die Phase MUST dabei zum Zeitpunkt der Sitemap-Anfrage bestimmt
werden.

#### Scenario: Ankündigung erreicht
- **WHEN** ein gelistetes Event die Phase *angekündigt* erreicht und die Sitemap danach frisch erzeugt wird
- **THEN** enthält sie `/de/events/<slug>` bzw. `/en/events/<slug>` für jede vorhandene Sprachfassung

#### Scenario: Noch verborgen
- **WHEN** die Sitemap abgerufen wird, während ein Event *verborgen* ist
- **THEN** enthält sie dessen Detail-URL nicht

#### Scenario: Nicht gelistet
- **WHEN** die Sitemap abgerufen wird, während ein nicht gelistetes Event läuft
- **THEN** enthält sie dessen Detail-URL nicht
