# Spec Delta

## Purpose

Besucher des Blogs erkennen den Autor eines Beitrags und gelangen von dort zu
seinem Profil oder zu seinen weiteren Beiträgen.

## ADDED Requirements

### Requirement: Die Byline verlinkt den Autor
Die Detailseite eines Blogartikels MUST jeden Autor mit Namen, Avatar und
Rolle zeigen und den Namen verlinken. Der Link SHALL bei einem Team-Autor auf
`/<locale>/team/<slug>` führen und bei einem externen Autor auf
`/<locale>/blog/author/<slug>`. Ein Autor-Slug ohne auflösbare Person MUST
ohne Fehler übergangen werden. Die Reihenfolge der Autoren folgt dem
Frontmatter.

#### Scenario: Team-Autor
- **WHEN** ein Artikel mit `author: themeinerlp` auf Deutsch geöffnet wird
- **THEN** führt der Autorenname auf `/de/team/themeinerlp`

#### Scenario: Externer Autor
- **WHEN** ein Artikel mit einem externen Autor geöffnet wird
- **THEN** führt der Autorenname auf `/<locale>/blog/author/<slug>`

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

### Requirement: Jeder Autor hat eine Seite unter einem Pfad
`/<locale>/blog/author/<slug>` MUST die Artikel des Autors zeigen: jeden
freigegebenen Artikel der Sprache, dessen `author` den Slug enthält (einzeln
oder in einer Liste), in der üblichen Reihenfolge. Die Seite MUST ohne
Query-String, Cookie oder Header auskommen; ihr Inhalt hängt allein am Pfad.
Die Liste SHALL serverseitig bestimmt werden und nach der Hydrierung
unverändert bleiben. Das Pfadsegment `author` MUST Vorrang vor der
Artikelroute haben; deshalb darf kein Artikel den Slug `author` tragen.

#### Scenario: Seite trifft
- **WHEN** `/en/blog/author/themeinerlp` geöffnet wird
- **THEN** zeigt die Liste genau die freigegebenen Artikel von `themeinerlp`

#### Scenario: Gemeinsamer Artikel
- **WHEN** ein Artikel `author: [themeinerlp, gast]` trägt und `/en/blog/author/gast` geöffnet wird
- **THEN** erscheint der Artikel in der Liste

#### Scenario: Nicht freigegebener Artikel
- **WHEN** ein Artikel des Autors seine `releaseDate` noch nicht erreicht hat
- **THEN** erscheint er auf der Autorenseite nicht

#### Scenario: Slug `author` als Artikel
- **WHEN** ein Blogartikel den Slug `author` trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt die Datei

### Requirement: Der Autorenkasten stellt den Autor vor
Die Autorenseite MUST über der Liste einen Autorenkasten mit Avatar, Namen,
Rolle und, falls vorhanden, Bio und Links zeigen. Bei einem externen Autor
SHALL der Kasten Bio und Links aus dem Autorenprofil zeigen. Bei einem
Team-Autor MUST er stattdessen auf `/<locale>/team/<slug>` verweisen. Links
MUST nur mit `http`, `https` oder `mailto` ausgegeben werden.

#### Scenario: Externer Autor
- **WHEN** `/en/blog/author/<externer-slug>` geöffnet wird
- **THEN** steht über der Liste ein Kasten mit Avatar, Name, Rolle, Bio und Links

#### Scenario: Team-Autor
- **WHEN** `/en/blog/author/themeinerlp` geöffnet wird
- **THEN** zeigt der Kasten den Namen und einen Link auf `/en/team/themeinerlp`

### Requirement: Eine Autorenseite existiert nur für Autoren mit Artikeln
Ein Slug, der zu keiner Person auflöst, MUST mit Status 404 antworten. Ebenso
MUST ein auflösbarer Slug ohne einen einzigen freigegebenen Artikel in dieser
Sprache mit 404 antworten, damit keine indexierbare leere Seite entsteht. Der
Fehler MUST serverseitig als fataler Fehler ausgelöst werden, nicht als
leere 200-Seite.

#### Scenario: Unbekannter Slug
- **WHEN** `/de/blog/author/niemand` geöffnet wird
- **THEN** antwortet die Seite mit 404

#### Scenario: Person ohne Artikel
- **WHEN** ein auflösbarer Slug, etwa ein Team-Mitglied ohne Artikel, geöffnet wird
- **THEN** antwortet die Seite mit 404

### Requirement: Die Autorenseite ist indexierbar und zweisprachig
Die Autorenseite MUST einen eigenen Canonical auf ihren eigenen Pfad
`/<locale>/blog/author/<slug>` tragen, ohne Query-Umgehung, und genau einen
Canonical ausliefern. Hreflang-Verweise und der Sprachwechsel SHALL auf
`/<de|en>/blog/author/<slug>` führen, wenn der Autor in der anderen Sprache
mindestens einen freigegebenen Artikel hat; sonst führen sie auf die
Blog-Übersicht dieser Sprache. Die Sitemap SHALL die Autorenseiten
enthalten, die nach den obigen Regeln mit 200 antworten.

#### Scenario: Canonical
- **WHEN** `/de/blog/author/themeinerlp` geöffnet wird
- **THEN** zeigt `rel=canonical` auf `/de/blog/author/themeinerlp`, und es gibt genau einen Canonical

#### Scenario: Sprachwechsel
- **WHEN** der Sprachwechsel auf `/de/blog/author/themeinerlp` auf Englisch gestellt wird
- **THEN** führt er auf `/en/blog/author/themeinerlp`

#### Scenario: Sitemap
- **WHEN** die Sitemap erzeugt wird
- **THEN** enthält sie `/de/blog/author/themeinerlp` und keinen Slug, der 404 ergäbe
