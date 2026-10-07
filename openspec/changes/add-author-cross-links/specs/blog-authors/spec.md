# Spec Delta

## Purpose

Besucher des Blogs erkennen den Autor eines Beitrags und gelangen von dort zu
seinem Profil oder zu seinen weiteren Beiträgen.

## ADDED Requirements

### Requirement: Die Byline verlinkt den Autor
Die Detailseite eines Blogartikels MUST jeden Autor mit Namen, Avatar und
Rolle zeigen und den Namen verlinken. Der Link SHALL bei einem Team-Autor auf
`/<locale>/team/<slug>` führen und bei einem externen Autor auf
`/<locale>/blog?author=<slug>`. Ein Autor-Slug ohne auflösbare Person MUST
ohne Fehler übergangen werden. Die Reihenfolge der Autoren folgt dem
Frontmatter.

#### Scenario: Team-Autor
- **WHEN** ein Artikel mit `author: themeinerlp` auf Deutsch geöffnet wird
- **THEN** führt der Autorenname auf `/de/team/themeinerlp`

#### Scenario: Externer Autor
- **WHEN** ein Artikel mit einem externen Autor geöffnet wird
- **THEN** führt der Autorenname auf `/<locale>/blog?author=<slug>`

#### Scenario: Mehrere Autoren
- **WHEN** ein Artikel `author: [a, b]` trägt
- **THEN** erscheinen beide in dieser Reihenfolge, jeder mit eigenem Link

### Requirement: Die Artikelkarte nennt den Autor
Jede Artikelkarte der Blog-Übersicht und das hervorgehobene erste Element
MUST den Autor mit Namen zeigen und verlinken wie die Byline. Der Link der
Karte zum Artikel SHALL unverändert bleiben und der Autorenlink MUST darüber
anklickbar sein, ohne dass Links ineinander verschachtelt sind.

#### Scenario: Karte mit Autor
- **WHEN** die Blog-Übersicht einen Artikel von `themeinerlp` zeigt
- **THEN** nennt die Karte „TheMeinerLP“ als Link auf das Team-Profil, und der Titel führt weiter auf den Artikel

### Requirement: Die Übersicht filtert nach Autor
`/<locale>/blog?author=<slug>` MUST nur Artikel zeigen, deren `author` den Slug
enthält (einzeln oder in einer Liste), in der üblichen Reihenfolge und unter
der üblichen Freigaberegel für Artikel. Ohne `author` MUST die Übersicht
unverändert alle Artikel zeigen. Die gefilterte Liste SHALL serverseitig
bestimmt werden und nach der Hydrierung unverändert bleiben.

#### Scenario: Filter trifft
- **WHEN** `/en/blog?author=themeinerlp` geöffnet wird
- **THEN** zeigt die Liste genau die freigegebenen Artikel von `themeinerlp`

#### Scenario: Gemeinsamer Artikel
- **WHEN** ein Artikel `author: [themeinerlp, gast]` trägt und nach `gast` gefiltert wird
- **THEN** erscheint der Artikel in der Liste

#### Scenario: Nicht freigegebener Artikel
- **WHEN** ein Artikel des Autors seine `releaseDate` noch nicht erreicht hat
- **THEN** erscheint er auch in der gefilterten Liste nicht

### Requirement: Der Autorenkasten stellt den gefilterten Autor vor
Ist `author` ein auflösbarer Slug, MUST die Übersicht über der Liste einen
Autorenkasten mit Avatar, Namen, Rolle und, falls vorhanden, Bio und Links
zeigen. Bei einem externen Autor SHALL der Kasten Bio und Links aus dem
Autorenprofil zeigen. Bei einem Team-Autor MUST er stattdessen auf das
Team-Profil verweisen. Links MUST nur mit `http`, `https` oder `mailto`
ausgegeben werden.

#### Scenario: Externer Autor
- **WHEN** `/en/blog?author=<externer-slug>` geöffnet wird
- **THEN** steht über der Liste ein Kasten mit Avatar, Name, Rolle, Bio und Links

#### Scenario: Team-Autor
- **WHEN** `/en/blog?author=themeinerlp` geöffnet wird
- **THEN** zeigt der Kasten den Namen und einen Link auf `/en/team/themeinerlp`

### Requirement: Eine gefilterte Liste ist keine eigene Suchseite
Der Canonical von `/<locale>/blog?author=<slug>` MUST auf `/<locale>/blog`
zeigen, Hreflang-Verweise ebenso auf die Übersicht ohne Filter. Die
Übersicht MUST in der Sitemap nur ungefiltert stehen. Ein unbekannter Slug
SHALL mit Status 200, einem Leerzustand („Keine Beiträge dieses Autors“) und
`noindex` antworten, nicht mit 404 oder 500. Ein bekannter Slug ohne
freigegebene Artikel zeigt denselben Leerzustand, aber den Autorenkasten.

#### Scenario: Canonical
- **WHEN** `/de/blog?author=themeinerlp` geöffnet wird
- **THEN** zeigt `rel=canonical` auf `/de/blog`, und es gibt genau einen Canonical

#### Scenario: Unbekannter Autor
- **WHEN** `/de/blog?author=niemand` geöffnet wird
- **THEN** antwortet die Seite mit 200, zeigt den Leerzustand ohne Autorenkasten und trägt `noindex`

#### Scenario: Bekannter Autor ohne Artikel
- **WHEN** ein auflösbarer Autor keinen freigegebenen Artikel hat
- **THEN** zeigt die Seite den Autorenkasten und den Leerzustand
