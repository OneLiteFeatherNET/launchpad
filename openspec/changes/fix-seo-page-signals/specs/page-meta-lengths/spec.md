# Spec Delta

## Purpose

Titel, Beschreibung, Überschriften und Sprachangabe einer Seite passen in die
Grenzen, die Suchergebnisse und Screenreader erwarten.

## ADDED Requirements

### Requirement: Descriptions sind höchstens 155 Zeichen lang
Jede Meta-Description einer Seite, in beiden Sprachen, MUST zwischen 50 und
155 Zeichen lang sein. Das gilt für i18n-Keys, Blog-Frontmatter
(`seo.description`, sonst `description`) und `summary`-Felder, aus denen
`usePageSeo` eine Description macht.

#### Scenario: Startseite
- **WHEN** `index.description` in `de.json` und `en.json` gelesen wird
- **THEN** ist jede höchstens 155 Zeichen lang und beginnt mit `OneLiteFeather`

#### Scenario: Blogartikel
- **WHEN** die Frontmatter aller Artikel gelesen werden
- **THEN** ist keine Meta-Description länger als 155 Zeichen

### Requirement: Titel passen in die Ergebnisliste
Der gerenderte `<title>` jeder Seite MUST höchstens 60 Zeichen lang sein, in
beiden Sprachen; bei Seiten mit dem Suffix ` | OneLiteFeather` zählt der
Suffix mit. Die deutsche Startseite beginnt mit der Marke.

#### Scenario: Deutsche Startseite
- **WHEN** `index.title` in `de.json` gelesen wird
- **THEN** beginnt er mit `OneLiteFeather` und ist höchstens 60 Zeichen lang

### Requirement: Eine Hauptüberschrift pro Seite
Eine Seite MUST genau ein `<h1>` tragen. Auf der Blog-Übersicht ist das das
Seitenname-`<h1>`; der Titel des Top-Artikels ist ein `<h2>` mit unveränderter
Optik.

#### Scenario: Blog-Übersicht
- **WHEN** `/en/blog` abgerufen wird
- **THEN** enthält das HTML genau ein `<h1>`
- **AND** der Titel des Top-Artikels steht in einem `<h2>`

### Requirement: inLanguage entspricht der HTML-Sprache
`WebPage.inLanguage` und `Article.inLanguage` MUST dem `language` der Locale
entsprechen (`en-US`, `de-DE`), wie `<html lang>` und `WebSite.inLanguage`.
Das Organization-`logo` MUST ein `ImageObject` mit `width` und `height` sein,
gleich den Pixelmaßen der Datei.

#### Scenario: Englische Seite
- **WHEN** `/en` abgerufen wird
- **THEN** ist `WebPage.inLanguage` `en-US` und `<html lang>` `en-US`

#### Scenario: Logo
- **WHEN** das JSON-LD gelesen wird
- **THEN** hat das Organization-`logo` `width` 512 und `height` 512
