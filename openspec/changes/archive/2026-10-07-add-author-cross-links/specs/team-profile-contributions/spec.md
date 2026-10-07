# Spec Delta

## Purpose

Das Team-Profil zeigt, was die Person beigetragen hat: ihre Blogartikel und
die Events, die sie ausrichtet.

## ADDED Requirements

### Requirement: Das Profil listet die Beiträge der Person
`/<locale>/team/<slug>` MUST einen Abschnitt „Beiträge“ zeigen, der jeden
freigegebenen Blogartikel der aktuellen Sprache enthält, dessen `author` den
Slug enthält, neueste zuerst, jeweils mit Titel als Link auf den Artikel und
Veröffentlichungsdatum. Ohne solche Artikel MUST der Abschnitt samt
Überschrift entfallen. Ein Artikel mit `releaseDate` in der Zukunft SHALL
nicht erscheinen.

#### Scenario: Profil mit Beiträgen
- **WHEN** `/de/team/themeinerlp` geöffnet wird
- **THEN** listet „Beiträge“ alle freigegebenen deutschen Artikel mit `author` `themeinerlp`, neueste zuerst

#### Scenario: Mitglied ohne Beiträge
- **WHEN** das Profil eines Mitglieds ohne Artikel geöffnet wird
- **THEN** erscheint kein Abschnitt „Beiträge“

#### Scenario: Geplanter Artikel
- **WHEN** ein Artikel von `themeinerlp` eine `releaseDate` in der Zukunft hat
- **THEN** fehlt er im Abschnitt

### Requirement: Das Profil listet die Events der Person
Das Profil MUST einen Abschnitt „Events“ zeigen, der jedes Event der aktuellen
Sprache enthält, dessen `hosts` den Slug enthalten und das nach der
bestehenden Sichtbarkeitsregel gelistet ist. Nicht gelistete (`unlisted`) und
verborgene Events MUST NOT erscheinen. Jeder Eintrag SHALL Titel als Link auf
die Event-Seite, Zeitraum und Phase zeigen. Ohne solche Events MUST der
Abschnitt samt Überschrift entfallen.

#### Scenario: Laufendes Event
- **WHEN** ein gelistetes, laufendes Event `hosts: [themeinerlp]` trägt
- **THEN** erscheint es unter „Events“ auf `/de/team/themeinerlp`

#### Scenario: Nicht gelistetes Event
- **WHEN** ein Event `unlisted: true` ist und `hosts: [themeinerlp]` trägt
- **THEN** erscheint es nicht im Profil

#### Scenario: Verborgenes Event
- **WHEN** ein öffentliches Event vor seiner Ankündigung `hosts: [themeinerlp]` trägt
- **THEN** erscheint es nicht im Profil

### Requirement: Die Abschnitte entstehen in der Seite, nicht im Team-Layer
Die Abschnitte „Beiträge“ und „Events“ MUST in `pages/team/[slug].vue`
zusammengesetzt werden. Der Team-Layer SHALL weder Blog noch Events kennen.
Die Inhalte MUST serverseitig bestimmt werden und nach der Hydrierung
unverändert bleiben; die Sichtbarkeit der Events SHALL zur Anfragezeit
entschieden und in der Nutzlast übertragen werden, nicht beim Hydrieren
neu berechnet.

#### Scenario: Keine Layer-Abhängigkeit
- **WHEN** die Architekturprüfung läuft
- **THEN** importiert und nennt `layers/team` weder `blog` noch `events`
