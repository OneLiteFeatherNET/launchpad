# about-page Specification

## ADDED Requirements

### Requirement: Die Seite stellt das Netzwerk in fünf Abschnitten vor
`/<locale>/about` MUST genau einen `h1` („Über uns“ / „About us“) tragen und
darunter in dieser Reihenfolge die Abschnitte „Wer wir sind“, „Was uns
ausmacht“, „Zahlen“, „Wie wir arbeiten“ und „Mitmachen“ zeigen, je mit einer
`h2`. Der Inhalt (Absätze, vier Säulen) MUST aus der Content-Sammlung `about`
der Sprache stammen; fehlt das Dokument, antwortet die Seite trotzdem mit 200
und zeigt nur die übrigen Abschnitte.

#### Scenario: Deutsche Seite
- **WHEN** `/de/about` geöffnet wird
- **THEN** stehen eine `h1` und fünf `h2` in der genannten Reihenfolge, der Text nennt „2021“

#### Scenario: Englische Seite
- **WHEN** `/en/about` geöffnet wird
- **THEN** sind alle Texte englisch, die Struktur ist dieselbe

### Requirement: Vier Säulen verlinken auf ihre Bereiche
Der Abschnitt „Was uns ausmacht“ MUST vier Säulen als Liste zeigen, je mit
Symbol (dekorativ, `aria-hidden`), Titel, Text und einem Link auf `/<locale>/community-poi`,
`/<locale>/projects`, `/<locale>/events` beziehungsweise `/<locale>/blog`. Jeder
Link SHALL einen Namen tragen, der das Ziel nennt.

#### Scenario: Säulenlinks
- **WHEN** `/de/about` gerendert wird
- **THEN** führen die vier Säulenlinks auf `/de/community-poi`, `/de/projects`, `/de/events` und `/de/blog`

### Requirement: Die Zahlen sind der vorhandene Community-Streifen
Der Abschnitt „Zahlen“ MUST den Community-Zahlenstreifen mit Discord-Mitgliedern,
Team, Bauten und Unterstützern zeigen und auf `/<locale>/community` verlinken.
Die Seite darf dafür keine eigene Abfrage der Domänen enthalten.

#### Scenario: Link zur Community
- **WHEN** `/en/about` gerendert wird
- **THEN** führt der Link des Streifens auf `/en/community`

### Requirement: Mitmachen bietet vier Wege
Der Abschnitt „Mitmachen“ MUST vier Links zeigen: Spielen (`/<locale>#connect`),
Discord (die zentrale Einladung `https://1lf.link/discord`), Bewerben
(`/<locale>/team`) und Unterstützen (`https://opencollective.com/onelitefeather`).
Externe Links SHALL in neuem Tab mit `rel="noopener noreferrer"` öffnen.

#### Scenario: Alle Ziele
- **WHEN** `/de/about` gerendert wird
- **THEN** enthält der Abschnitt Links auf `/de#connect`, `https://1lf.link/discord`, `/de/team` und `https://opencollective.com/onelitefeather`

### Requirement: Die Aussagen über Finanzierung und Projekte sind belegbar
Der Text SHALL die Finanzierung über freiwillige Spenden auf OpenCollective
nennen und dass Buchungen dort öffentlich einsehbar sind, den Lite-Rang als
Dankeschön ohne spielerischen Vorteil, und als offene Projekte nur solche, die
unter `OneLiteFeatherNET` veröffentlicht sind.

#### Scenario: Kein Vorteil für Unterstützer
- **WHEN** der Abschnitt „Wie wir arbeiten“ gelesen wird
- **THEN** steht dort, dass Unterstützer keinen spielerischen Vorteil erhalten

### Requirement: Die Seite ist eigenständig indexierbar und beschreibt die Organisation
Die Seite MUST einen Canonical ohne Schrägstrich am Ende auf sich selbst,
hreflang-Alternates für beide Sprachen, Titel, Beschreibung und Open-Graph-Daten
über `usePageSeo` und einen Eintrag in der Sitemap tragen. Das JSON-LD MUST einen
Knoten vom Typ `AboutPage` enthalten, dessen `about` auf den vorhandenen
Organization-Knoten verweist, und keinen zweiten Organization-Knoten. Die
Organization MUST `foundingDate` `2021` tragen. Ihr Inhalt hängt allein am Pfad:
keine Query, kein Cookie, kein Header.

#### Scenario: Strukturierte Daten
- **WHEN** `/de/about` gerendert wird
- **THEN** enthält das JSON-LD genau einen Knoten `Organization` mit `foundingDate` „2021“ und einen `AboutPage`, dessen `about` dessen `@id` nennt

#### Scenario: Sitemap
- **WHEN** die Sitemap abgerufen wird
- **THEN** listet sie `/de/about` und `/en/about`

### Requirement: Die Fußzeile führt auf die Über-uns-Seite
Der Fußzeilen-Link „Über uns“ / „About“ MUST auf `/<locale>/about` führen.

#### Scenario: Lokalisiert
- **WHEN** die Fußzeile unter `/en` gerendert wird
- **THEN** führt „About“ auf `/en/about`
