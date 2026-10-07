# project-content Specification

## Purpose
Projekte sind redaktionelle Inhalte mit festen Pflichtangaben, die pro Sprache
gepflegt und über `translationKey` gepaart werden.

## Requirements

### Requirement: Ein Projekt ist eine lokalisierte Markdown-Datei
Projekte MUST unter `content/projects/<locale>/*.md` liegen. Pflicht sind `slug`,
`title`, `summary` und `status` (`active`, `maintenance` oder `archived`). Optional
sind `translationKey`, `logo`, `logoAlt`, `releasedAt` (Datum), `updatedAt`
(Datum), `platforms` (Liste), `license`, `links` und `maintainers`. `links` kennt
`docs`, `source`, `issues` (je eine `https`-URL) und `downloads` (Liste aus
`label` und `url`). Ein `logo` MUST einen `logoAlt` haben. Der Slug MUST je
Sprache eindeutig sein. Der Markdown-Text ist die Beschreibung.

#### Scenario: Fehlender Alt-Text
- **WHEN** ein Projekt ein `logo` ohne `logoAlt` trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt die Datei

#### Scenario: Doppelter Slug
- **WHEN** zwei Projekte einer Sprache denselben Slug tragen
- **THEN** schlägt die Inhaltsprüfung fehl und nennt beide Dateien

### Requirement: Übersetzungen stimmen in den Fakten überein
Zwei Projekte mit gleichem `translationKey` MUST in `status`, `releasedAt`,
`license`, `platforms`, `maintainers` und `links` identisch sein. Jeder
`translationKey` MUST in beiden Sprachen vorkommen, und die `alternates` MUST
wie bei Blog und POIs gegenseitig bestätigt sein.

#### Scenario: Abweichender Status
- **WHEN** die deutsche Fassung `status: active` und die englische `status: archived` trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt beide Dateien

### Requirement: Maintainer sind Personen-Slugs
Jeder Slug in `maintainers` MUST in jeder Sprache, in der das Projekt existiert,
über den Team-Roster oder die externen Autoren auflösbar sein.

#### Scenario: Unbekannter Maintainer
- **WHEN** ein Projekt `maintainers: [unbekannt]` trägt
- **THEN** schlägt die Inhaltsprüfung fehl und nennt Datei und Slug

### Requirement: Listenabfragen tragen keine Pfade und keinen Text
Die Listen der Übersicht und der Karten MUST nur die angezeigten Felder liefern:
weder den Markdown-Text noch `path` oder `stem` noch die Links. Einzelabfragen
MUST `path` und `stem` entfernen.

#### Scenario: Übersichtsabfrage
- **WHEN** die Projekte einer Sprache für die Übersicht geladen werden
- **THEN** enthält keine Zeile `body`, `path` oder `stem`
