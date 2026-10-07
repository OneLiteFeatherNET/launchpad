# Spec Delta

## Purpose

Ein Slug in Inhalten (Blog-`author`, Event-`hosts`) bezeichnet immer dieselbe
Person und führt an dieselbe Stelle, gleichgültig, ob sie im Team ist oder
als externer Autor geführt wird.

## ADDED Requirements

### Requirement: Ein Slug wird zu genau einer Person aufgelöst
Das System MUST einen Personen-Slug in einer Sprache zu einer normalisierten
Person auflösen, bestehend aus `slug`, `name`, `avatar`, `role`, `kind` und
`profilePath`. Es MUST zuerst den Team-Roster dieser Sprache durchsuchen und
nur bei keinem Treffer die externen Autoren. Ein Slug ohne Treffer in beiden
SHALL zu keiner Person führen (kein Fehler). Dieselbe Auflösung MUST für
Blog und Events gelten.

#### Scenario: Team-Mitglied
- **WHEN** `themeinerlp` in der Sprache `de` aufgelöst wird
- **THEN** ist `kind` gleich `team`, `name` gleich „TheMeinerLP“ und `profilePath` gleich `/de/team/themeinerlp`

#### Scenario: Externer Autor
- **WHEN** ein Slug aufgelöst wird, der nur unter den externen Autoren steht
- **THEN** ist `kind` gleich `external`, und `profilePath` ist `/<locale>/blog?author=<slug>`

#### Scenario: Team gewinnt
- **WHEN** ein Slug sowohl im Team-Roster als auch unter den externen Autoren stünde
- **THEN** liefert die Auflösung das Team-Mitglied

#### Scenario: Unbekannter Slug
- **WHEN** ein Slug weder im Roster noch bei den externen Autoren steht
- **THEN** liefert die Auflösung keine Person und wirft nicht

### Requirement: Der Team-Roster hält die Identität einer Person
Externe Autoren MUST nur Personen umfassen, die nicht im Team-Roster stehen.
Kein Slug SHALL zugleich im Team-Roster (`content/team/<locale>/home.json`)
und unter `content/authors/` vorkommen. Die Byline eines Team-Mitglieds MUST
dessen Team-Namen zeigen; ein separates Feld für einen Klarnamen existiert
nicht.

#### Scenario: Doppelter Slug
- **WHEN** ein Slug in `content/authors/` und im Team-Roster auftaucht
- **THEN** schlägt die Inhaltsprüfung fehl und nennt den Slug

#### Scenario: Migrierter Autor
- **WHEN** ein Blogartikel von Phillipp Glanz geöffnet wird
- **THEN** nennt die Byline „TheMeinerLP“ und verlinkt auf das Team-Profil `themeinerlp`

### Requirement: Jeder referenzierte Personen-Slug löst auf
Jeder Slug in `author` eines Blogartikels und in `hosts` eines Events MUST
in jeder Sprache, in der der Inhalt existiert, zu einer Person auflösen. Die
Inhaltsprüfung SHALL jeden nicht auflösbaren Slug mit Datei und Feld nennen.

#### Scenario: Tippfehler im Autor
- **WHEN** ein Blogartikel `author: themeinerp` trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt Datei, Feld `author` und den Slug

#### Scenario: Gastgeber ohne Profil
- **WHEN** ein Event `hosts: [unbekannt]` trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt Datei, Feld `hosts` und den Slug

### Requirement: Das Blog-Feld `teamMembers` entfällt
Das Frontmatter-Feld `teamMembers` MUST nicht mehr zum Schema der Blogartikel
gehören, und ein Artikel MUST keinen Block „Featured team members“ mehr
zeigen. Die Verbindung zwischen Artikel und Team-Mitglied besteht allein
über `author`.

#### Scenario: Artikel ohne Block
- **WHEN** ein Blogartikel geöffnet wird
- **THEN** erscheint kein Abschnitt „Featured team members“
