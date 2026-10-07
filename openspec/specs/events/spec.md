# events Specification

## Purpose
TBD - created by archiving change add-author-cross-links. Update Purpose after archive.

## Requirements

### Requirement: Events nennen ihre Gastgeber
Ein Event MAY im Frontmatter `hosts` tragen, eine Liste von Personen-Slugs;
ohne Angabe hat es keine Gastgeber. Jeder Slug MUST wie bei Blogautoren über
den Team-Roster und die externen Autoren aufgelöst werden. Die Detailseite
SHALL die Gastgeber in Frontmatter-Reihenfolge mit Namen und Avatar zeigen
und jeden Namen auf das Profil verlinken (Team: `/<locale>/team/<slug>`,
extern: `/<locale>/blog/author/<slug>`). Ohne `hosts` MUST kein Abschnitt
erscheinen. Ein nicht auflösbarer Slug MUST ohne Fehler übergangen werden. Die
Platzierungen in den Ergebnissen eines Events SHALL nicht verlinkt werden.

#### Scenario: Event mit Gastgeber
- **WHEN** die Detailseite eines Events mit `hosts: [themeinerlp]` auf Deutsch geöffnet wird
- **THEN** nennt sie „TheMeinerLP“ als Gastgeber mit Link auf `/de/team/themeinerlp`

#### Scenario: Event ohne Gastgeber
- **WHEN** ein Event kein `hosts` trägt
- **THEN** zeigt die Detailseite keinen Gastgeber-Abschnitt

#### Scenario: Ergebnis-Platzierung
- **WHEN** ein beendetes Event eine Platzierung mit dem Namen eines Teammitglieds zeigt
- **THEN** ist dieser Name nicht verlinkt

#### Scenario: Übersetzungen
- **WHEN** zwei Übersetzungen eines Events verschiedene `hosts` tragen
- **THEN** schlägt die Inhaltsprüfung fehl und nennt beide Dateien
