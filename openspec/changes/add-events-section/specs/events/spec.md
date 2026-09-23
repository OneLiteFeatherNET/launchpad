# Spec Delta: events

## Purpose

Macht Community-Events (Bau-, Spiel-, Adventure-Events und Betas) auf der
Website auffindbar: mit eigener Übersicht und Detailseite, einem Lebenszyklus,
der Sichtbarkeit zeitgesteuert regelt, einer klaren Darstellung, wie man
teilnimmt, und automatischer Bewerbung auf der Startseite.

## ADDED Requirements

### Requirement: Events werden als lokalisierte Inhalte gepflegt
Jedes Event MUST als eigener Inhaltseintrag je Sprache (`de`, `en`) gepflegt
werden und SHALL mindestens `slug`, `title`, `summary`, `type` und
`event.startsAt` tragen. `event.endsAt` und `event.announceAt` SHALL optional
sein; alle Zeitpunkte MUST mit Zeitzonen-Offset angegeben werden. Ein Event
MUST höchstens ein Übersetzungspendant je Sprache haben, und die beiden
Fassungen SHALL über einen gemeinsamen Übersetzungsschlüssel verbunden sein.

#### Scenario: Minimaler Eintrag
- **WHEN** eine Datei unter `content/events/de/` nur `slug`, `title`, `summary`, `type: build` und `event.startsAt` enthält
- **THEN** wird das Event ohne Fehler geladen und mit Zugang `open` sowie Standard-Promotion behandelt

#### Scenario: Zeitpunkt ohne Zeitzone
- **WHEN** ein Eintrag `event.startsAt: 2026-10-01T18:00` ohne Offset enthält
- **THEN** schlägt die Inhaltsprüfung in der Testsuite mit Dateiname und Feldname fehl

#### Scenario: Widersprüchlicher Zeitraum
- **WHEN** `event.endsAt` vor `event.startsAt` oder `event.announceAt` nach `event.startsAt` liegt
- **THEN** schlägt die Inhaltsprüfung in der Testsuite mit Dateiname und den betroffenen Feldern fehl

### Requirement: Die Phase eines Events ergibt sich zur Anfragezeit aus seinen Zeitpunkten
Ein Event MUST sich zu jedem Zeitpunkt in genau einer Phase befinden:
*verborgen* vor `announceAt` (bzw. vor `startsAt`, wenn `announceAt` fehlt),
*angekündigt* ab `announceAt` bis `startsAt`, *läuft* ab `startsAt` bis
`endsAt`, *vergangen* ab `endsAt`. Ein Event ohne `endsAt` SHALL ab
`startsAt` dauerhaft *läuft* sein. Die Phase MUST beim Ausliefern der Seite
bestimmt werden, nicht beim Build, und Server- und Client-Darstellung MUST
dieselbe Phase zeigen.

#### Scenario: Wechsel ohne Deploy
- **WHEN** ein Event mit `startsAt` in einer Stunde deployt wird und die Detailseite zwei Stunden später erstmals frisch gerendert wird
- **THEN** zeigt sie das Event in der Phase *läuft*, ohne dass erneut deployt wurde

#### Scenario: Keine Ankündigung
- **WHEN** ein Event kein `announceAt` hat und `startsAt` in der Zukunft liegt
- **THEN** ist es in der Phase *verborgen*

#### Scenario: Phasengrenze zwischen Rendern und Hydrierung
- **WHEN** eine Seite serverseitig mit einem Event in der Phase *läuft* gerendert wurde und im Browser erst nach dessen `endsAt` hydriert
- **THEN** zeigt die hydrierte Seite weiterhin die serverseitig bestimmte Phase und die Konsole meldet keinen Hydration-Mismatch

### Requirement: Verborgene Events sind nirgends sichtbar
Ein Event in der Phase *verborgen* MUST NOT auf der Übersicht, im Carousel
oder in der Sitemap erscheinen, und seine Detailseite MUST mit Status 404
antworten.

#### Scenario: Direkter Aufruf vor der Ankündigung
- **WHEN** `/de/events/herbst-bauevent` vor dessen `announceAt` aufgerufen wird
- **THEN** antwortet die Seite mit 404 und `noindex`

### Requirement: Die Übersicht gliedert Events nach Phase
`/<locale>/events` MUST immer mit Status 200 erreichbar sein und SHALL drei
Sektionen in dieser Reihenfolge zeigen: *Aktuell* mit allen laufenden
Events, nach `startsAt` aufsteigend; *Demnächst* mit allen angekündigten
Events, nach `startsAt` aufsteigend; *Vergangen* mit allen vergangenen
Events, nach `endsAt` absteigend. Läuft kein Event, MUST *Aktuell* einen
Leerhinweis mit Verweis auf den Discord zeigen. Gibt es keine angekündigten
Events, MUST *Demnächst* entfallen. Gibt es keine vergangenen Events, MUST
*Vergangen* entfallen. Jede Event-Karte SHALL Titel, Zusammenfassung, Typ,
Zeitraum, Zugangsart (außer bei `open`) und – falls vorhanden – ein
Vorschaubild zeigen und zur Detailseite führen.

#### Scenario: Nichts läuft, Archiv vorhanden
- **WHEN** kein Event läuft, keines angekündigt ist und zwei vergangene Events existieren
- **THEN** zeigt die Seite den Leerhinweis unter *Aktuell*, keine Sektion *Demnächst* und beide Events unter *Vergangen*, das zuletzt beendete zuerst

#### Scenario: Noch nie ein Event
- **WHEN** keine Events existieren
- **THEN** antwortet `/en/events` mit 200 und zeigt nur *Aktuell* mit Leerhinweis

#### Scenario: Karte eines geschlossenen Events
- **WHEN** ein laufendes Event `access.mode: application` hat
- **THEN** trägt seine Karte eine Kennzeichnung „Bewerbung“ ohne eigene Button-Rolle

### Requirement: Die Detailseite erklärt das Event und seinen Stand
`/<locale>/events/<slug>` MUST für Events in den Phasen *angekündigt*,
*läuft* und *vergangen* mit Status 200 antworten und SHALL zeigen: Titel,
Typ, Zeitraum, einen Phasenhinweis, den Typ-Block, den Markdown-Text samt
Anleitungen, die Galerie (falls vorhanden), die Ressourcen (falls vorhanden)
und den Block „So nimmst du teil“. Der Phasenhinweis MUST bei *angekündigt*
den Start nennen und bei *vergangen* das Event als beendet kennzeichnen. Bei
*vergangen* MUST der Block „So nimmst du teil“ entfallen und das Ergebnis
MUST direkt unter dem Kopf der Seite stehen. Die URL MUST über alle Phasen
gleich bleiben.

#### Scenario: Angekündigtes Event
- **WHEN** ein Event in der Phase *angekündigt* aufgerufen wird
- **THEN** zeigt der Phasenhinweis „startet am“ mit Datum und Uhrzeit

#### Scenario: Beendetes Event
- **WHEN** ein Event in der Phase *vergangen* aufgerufen wird
- **THEN** zeigt die Seite den Hinweis „beendet“, keinen Teilnahme-Block und ist indexierbar

#### Scenario: Unbekannter Slug
- **WHEN** `/de/events/gibt-es-nicht` aufgerufen wird
- **THEN** antwortet die Seite mit 404

#### Scenario: Sprachwechsel ohne Übersetzung
- **WHEN** ein Event nur auf Deutsch existiert und der Besucher auf Englisch wechselt
- **THEN** führt der Sprachwechsel zu `/en/events` statt zu einer 404-Seite; die englische `hreflang`-Alternative der Detailseite zeigt dann ebenfalls auf `/en/events`, weil Umschalter und `hreflang` dieselben Routenparameter lesen

### Requirement: Zeiten werden eindeutig in Serverzeit angezeigt
Alle Zeitpunkte MUST in der Zeitzone `Europe/Berlin` angezeigt werden,
formatiert nach der Sprache der Seite und mit Zeitzonenkürzel, und MUST
maschinenlesbar als `<time datetime>` im ISO-Format ausgezeichnet sein.

#### Scenario: Besucher in anderer Zeitzone
- **WHEN** ein Besucher mit Browser-Zeitzone `America/New_York` ein Event mit `startsAt: 2026-10-01T18:00:00+02:00` aufruft
- **THEN** zeigt die Seite 18:00 mit dem Kürzel MESZ (bzw. CEST auf Englisch) und `datetime="2026-10-01T16:00:00.000Z"`

### Requirement: Der Zugang bestimmt, wie man teilnimmt
Jedes Event MUST genau eine Zugangsart haben: `open` (Standard), `signup`,
`application` oder `invite`. `signup` und `application` MUST eine
Teilnahme-URL tragen. Der Block „So nimmst du teil“ SHALL je Zugangsart
zeigen: bei `open` die Serververbindung bzw. den angegebenen Beitrittsweg;
bei `signup` eine Aktion „Anmelden“; bei `application` eine Aktion
„Bewerben“; bei `invite` einen Hinweis ohne Aktion. Optional angegebene
Voraussetzungen MUST als Liste und ein optionaler Hinweistext unverändert
erscheinen. Ist ein Anmeldezeitraum (`access.opens`, `access.closes`)
angegeben, MUST die Aktion außerhalb dieses Zeitraums als nicht verfügbar
dargestellt und der Zeitraum genannt werden.

#### Scenario: Anmeldung ohne URL
- **WHEN** ein Eintrag `access.mode: signup` ohne `access.url` enthält
- **THEN** schlägt die Inhaltsprüfung in der Testsuite mit Dateiname fehl

#### Scenario: Bewerbungsfrist abgelaufen
- **WHEN** ein laufendes Event `access.mode: application` und ein `access.closes` in der Vergangenheit hat
- **THEN** ist die Aktion „Bewerben“ nicht auslösbar und der Block nennt das Ende der Bewerbungsfrist

#### Scenario: Rang als Voraussetzung
- **WHEN** ein Event `access.mode: open` und `access.requirements: [Lite-Rang]` hat
- **THEN** zeigt der Block die Serververbindung und darüber die Voraussetzung „Lite-Rang“

### Requirement: Das Format bestimmt den typspezifischen Block
Ein Event MUST genau ein Format haben: `build`, `play`, `adventure` oder
`beta`. Die Detailseite SHALL je Format einen eigenen Block zeigen, der nur
die für das Format angegebenen Felder darstellt und bei fehlenden Feldern
entfällt. Ein Event vom Format `beta` MUST einen Gegenstand mit Art
(`gamemode`, `feature` oder `offer`) und Namen tragen, und die Detailseite
MUST beides nennen.

#### Scenario: Beta einer Funktion
- **WHEN** ein Event `type: beta`, `access.mode: open` und `subject: { kind: feature, name: Grundstücks-Tool }` hat
- **THEN** nennt die Detailseite „Open Beta“ und den getesteten Gegenstand „Grundstücks-Tool“ als Funktion

#### Scenario: Beta ohne Gegenstand
- **WHEN** ein Eintrag `type: beta` ohne `subject` enthält
- **THEN** schlägt die Inhaltsprüfung in der Testsuite mit Dateiname fehl

### Requirement: Anleitungen erklären ein Event je Rolle
Der Markdown-Text eines Events MUST Anleitungsblöcke mit optionaler Rolle
(Name, optional ein Symbol) enthalten können, deren Inhalt beliebiges Markdown
einschließlich Bildern und Listen ist. Enthält ein Event mehrere Anleitungen
mit Rolle, SHALL die Detailseite sie als Tabs darstellen, die per Tastatur
nach dem ARIA-Tabs-Muster bedienbar sind (Pfeiltasten wechseln, nur der aktive
Tab ist im Tab-Fokus). Eine einzelne Anleitung MUST ohne Tabs erscheinen.
Anleitungen MUST in allen sichtbaren Phasen angezeigt werden, auch nach dem
Ende des Events. Ohne JavaScript MUST jede Anleitung lesbar sein.

#### Scenario: Zwei Rollen
- **WHEN** ein Event die Anleitungen „Survivor“ und „Slender“ enthält
- **THEN** zeigt die Detailseite zwei Tabs, „Survivor“ ist aktiv, und Pfeil rechts aktiviert „Slender“ und zeigt dessen Inhalt

#### Scenario: Nachlesen nach dem Event
- **WHEN** ein Event mit Anleitungen in der Phase *vergangen* aufgerufen wird
- **THEN** sind die Anleitungen weiterhin vollständig sichtbar

### Requirement: Betas zeigen, was getestet wird und wie man Feedback gibt
Ein Event vom Format `beta` SHALL optional angeben können, worauf der Test
achtet, welche Probleme bekannt sind und wohin Feedback geht. Die Detailseite
MUST diese Angaben als eigenen Block zeigen, soweit vorhanden. Die Aktion
„Feedback melden“ MUST nur in den Phasen *angekündigt* und *läuft*
erscheinen; bekannte Probleme und Testschwerpunkte MUST auch danach lesbar
bleiben.

#### Scenario: Laufender Test
- **WHEN** ein laufendes Beta-Event zwei Testschwerpunkte, ein bekanntes Problem und eine Feedback-URL angibt
- **THEN** listet die Detailseite beide Schwerpunkte und das Problem und bietet „Feedback melden“ als Link auf die URL

#### Scenario: Beendeter Test
- **WHEN** dasselbe Event in der Phase *vergangen* aufgerufen wird
- **THEN** sind Schwerpunkte und Problem sichtbar, die Aktion „Feedback melden“ nicht

### Requirement: Beendete Events zeigen ihr Ergebnis
Jedes Event SHALL unabhängig vom Format ein Ergebnis tragen können aus
Kurzfazit, Platzierungen (Platz, Name, optional Minecraft-Name und Bild),
Kennzahlen (Bezeichnung und Wert) und einer Liste „Wie geht es weiter“. In der
Phase *vergangen* MUST die Detailseite das Ergebnis direkt unter dem Kopf
zeigen, Platzierungen nach Platz aufsteigend; ohne Ergebnis MUST dort der
Hinweis „Ergebnisse folgen“ stehen. In den übrigen Phasen MUST das Ergebnis
verborgen bleiben. Karten vergangener Events mit Platzierungen SHALL den
Erstplatzierten nennen.

#### Scenario: Ergebnis eines Bau-Events
- **WHEN** ein vergangenes Bau-Event drei Platzierungen in beliebiger Reihenfolge und die Kennzahl „Teilnehmer: 42“ hat
- **THEN** zeigt die Detailseite unter dem Kopf das Fazit, die Plätze 1, 2, 3 in dieser Reihenfolge und „Teilnehmer 42“, und die Archivkarte nennt den Erstplatzierten

#### Scenario: Ergebnis noch nicht eingetragen
- **WHEN** ein Event vergangen ist und kein Ergebnis hat
- **THEN** steht unter dem Kopf „Ergebnisse folgen“

#### Scenario: Ergebnis vor dem Ende
- **WHEN** ein laufendes Event bereits ein Ergebnis im Inhalt trägt
- **THEN** zeigt die Detailseite kein Ergebnis

### Requirement: Laufende Events werden im Startseiten-Carousel beworben
Ein Event MUST im Carousel der Startseite erscheinen, solange der Zeitpunkt
der Anfrage in seinem Promotionsfenster liegt und es nicht *verborgen* ist.
Das Promotionsfenster SHALL standardmäßig `startsAt` bis `endsAt` sein und
MUST sich über `promote.from` und `promote.until` einzeln überschreiben
lassen; `promote: false` MUST die Promotion abschalten. Beworbene Events
MUST vor allen redaktionell gepflegten Slides stehen, nach `startsAt`
aufsteigend sortiert, und es MUST höchstens zwei Event-Slides geben. Ein
Event-Slide SHALL zur Detailseite führen.

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

### Requirement: Die Hauptnavigation verlinkt die Events dauerhaft
Die Hauptnavigation MUST einen Eintrag „Events“ enthalten, der unabhängig
von laufenden Events immer sichtbar ist, auf `/<locale>/events` führt und
auf der Übersicht und allen Detailseiten als aktuell markiert ist.

#### Scenario: Aktiver Zustand auf Detailseite
- **WHEN** `/de/events/herbst-bauevent` angezeigt wird
- **THEN** trägt der Navigationseintrag „Events“ `aria-current="page"`

### Requirement: Die Sitemap enthält genau die sichtbaren Events
Die Sitemap MUST `/<locale>/events` sowie die Detailseite jedes Events in den
Phasen *angekündigt*, *läuft* und *vergangen* enthalten und MUST NOT Events
in der Phase *verborgen* enthalten. Die Phase MUST dabei zum Zeitpunkt der
Sitemap-Anfrage bestimmt werden.

#### Scenario: Ankündigung erreicht
- **WHEN** ein Event die Phase *angekündigt* erreicht und die Sitemap danach frisch erzeugt wird
- **THEN** enthält sie `/de/events/<slug>` bzw. `/en/events/<slug>` für jede vorhandene Sprachfassung

#### Scenario: Noch verborgen
- **WHEN** die Sitemap abgerufen wird, während ein Event *verborgen* ist
- **THEN** enthält sie dessen Detail-URL nicht

### Requirement: Detailseiten beschreiben das Event strukturiert
Die Detailseite MUST ein schema.org-`Event` mit Name, Beschreibung,
`startDate`, `endDate` (falls vorhanden), `eventAttendanceMode` Online,
einer `VirtualLocation` mit der Seiten-URL und einem `eventStatus`
ausliefern. Die Übersicht und Detailseiten SHALL den Titel, eine
Beschreibung und – falls vorhanden – das Vorschaubild als Open-Graph-Daten
setzen.

#### Scenario: Strukturierte Daten eines laufenden Events
- **WHEN** die Detailseite eines laufenden Events gerendert wird
- **THEN** enthält das JSON-LD genau einen Knoten vom Typ `Event` mit `eventStatus` `EventScheduled` und `eventAttendanceMode` `OnlineEventAttendanceMode`

### Requirement: Der Events-Bereich folgt dem Designsystem
Alle Komponenten und Seiten des Events-Bereichs MUST die Regeln des
Designsystem-Governance-Tests ohne Eintrag in dessen Migrations-Ausnahmeliste
erfüllen und interaktive Elemente aus den gemeinsamen Primitives beziehen.
Übersicht und Detailseite MUST in Hell und Dunkel die Barrierefreiheitsprüfung
der CI bestehen.

#### Scenario: Neue Event-Komponente mit Rohfarbe
- **WHEN** eine Komponente unter `layers/events/` eine Klasse wie `bg-gray-100` verwendet
- **THEN** schlägt der Governance-Test mit Datei, Zeile und Ersatzvorschlag fehl
