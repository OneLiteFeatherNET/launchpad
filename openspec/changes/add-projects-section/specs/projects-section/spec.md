# Spec Delta

## Purpose

Besucher finden die Software von OneLiteFeather, ihre Dokumentation, den
Quellcode und die Downloads an einer Stelle.

## ADDED Requirements

### Requirement: Die Übersicht listet alle Projekte der Sprache
`/<locale>/projects` MUST genau einen `h1` tragen und alle Projekte der Sprache
als Liste von Karten zeigen (Logo oder Platzhalter, Titel, Kurzbeschreibung,
Status). Aktive Projekte SHALL vor Projekten in Wartung und archivierten stehen,
innerhalb eines Status das jüngere `releasedAt` zuerst, danach nach Titel. Jede
Karte MUST genau einen Link auf die Detailseite tragen. Ohne Projekte MUST ein
Leerzustand erscheinen, die Seite antwortet trotzdem mit 200.

#### Scenario: Übersicht mit einem Projekt
- **WHEN** `/de/projects` geöffnet wird
- **THEN** zeigt die Seite die Karte „Anti-RedstoneClock Remastered“ mit Link auf `/de/projects/anti-redstoneclock-remastered`

#### Scenario: Reihenfolge
- **WHEN** ein archiviertes und ein aktives Projekt existieren
- **THEN** steht das aktive zuerst

### Requirement: Die Detailseite zeigt das Projekt mit Fakten, Links und Maintainern
`/<locale>/projects/<slug>` MUST Titel (`h1`), Kurzbeschreibung, Status, den
Markdown-Text, die Fakten (Plattformen, Lizenz, Veröffentlichung, soweit
angegeben) und die Links (Dokumentation, Quellcode, Fehlerverfolgung,
Downloads) zeigen. Externe Links SHALL in neuem Tab mit `rel="noopener noreferrer"`
öffnen und das dem Screenreader sagen. Maintainer MUST in Frontmatter-Reihenfolge
mit Name und Avatar erscheinen und auf das Profil führen (Team:
`/<locale>/team/<slug>`, extern: `/<locale>/blog/author/<slug>`); ein
nicht auflösbarer Slug MUST ohne Fehler übergangen werden. Ohne Maintainer,
Fakten oder Links MUST der jeweilige Abschnitt entfallen. Ein unbekannter Slug
MUST mit Status 404 antworten.

#### Scenario: Bekanntes Projekt
- **WHEN** `/en/projects/anti-redstoneclock-remastered` geöffnet wird
- **THEN** zeigt die Seite Links auf die Dokumentation und das GitHub-Repository

#### Scenario: Unbekannter Slug
- **WHEN** `/de/projects/gibt-es-nicht` geöffnet wird
- **THEN** antwortet der Server mit 404

### Requirement: Die Seiten sind indexierbar und stehen in der Sitemap
Übersicht und Detailseite MUST einen Canonical ohne Schrägstrich am Ende auf sich
selbst und hreflang-Alternates für beide Sprachen tragen, soweit eine Übersetzung
existiert; ohne Übersetzung entfällt die Alternate der anderen Sprache. Jede
Detailseite MUST in der Sitemap mit Pfad `/<locale>/projects/<slug>` stehen, mit
`lastmod` nur aus einem echten Inhaltsdatum. Der Inhalt hängt allein am Pfad:
keine Query, kein Cookie, kein Header. Die Detailseite SHALL Schema.org
`SoftwareApplication` mit Name, Beschreibung, URL und, soweit angegeben, Lizenz
und Veröffentlichungsdatum liefern.

#### Scenario: Sitemap
- **WHEN** die Sitemap abgerufen wird
- **THEN** enthält sie `/de/projects/anti-redstoneclock-remastered` und `/en/projects/anti-redstoneclock-remastered` mit gegenseitigen Alternates

### Requirement: Die Navigation führt zu den Projekten
Die Hauptnavigation MUST einen Eintrag „Projekte“ / „Projects“ auf die Übersicht
tragen, der auf Detailseiten als aktiv gilt.

#### Scenario: Navigationseintrag
- **WHEN** eine Seite unter `/de` gerendert wird
- **THEN** enthält die Navigation einen Link „Projekte“ auf `/de/projects`
