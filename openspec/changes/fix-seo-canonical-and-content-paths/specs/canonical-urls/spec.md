# Spec Delta

## Purpose

Jede indexierbare Seite hat genau eine kanonische URL. Suchmaschinen sehen
keine zweite Adresse mit abschließendem Schrägstrich.

## ADDED Requirements

### Requirement: Kanonische URLs enden nicht auf einen Schrägstrich
`rel=canonical`, `og:url`, die `rel=alternate`-Hreflang-Links und das
`url`-Feld der Schema.org-Knoten einer Seite MUST ohne abschließenden `/`
ausgeliefert werden. Ausgenommen ist der nackte Ursprung
(`https://onelitefeather.net/`). Das gilt unabhängig davon, ob die Seite mit
oder ohne abschließenden Schrägstrich aufgerufen wurde. Query und Hash MUST
weiterhin entfallen.

#### Scenario: Artikel mit Schrägstrich aufgerufen
- **WHEN** `/en/blog/dev-blog-1-what-we-using/` geöffnet wird
- **THEN** lautet der Canonical `https://onelitefeather.net/en/blog/dev-blog-1-what-we-using`
- **AND** jeder Hreflang-Link endet nicht auf `/`

#### Scenario: Artikel ohne Schrägstrich aufgerufen
- **WHEN** `/en/blog/dev-blog-1-what-we-using` geöffnet wird
- **THEN** bleibt der Canonical unverändert `https://onelitefeather.net/en/blog/dev-blog-1-what-we-using`

#### Scenario: Ursprung
- **WHEN** eine Funktion die URL `https://onelitefeather.net/` normiert
- **THEN** bleibt der Schrägstrich erhalten

### Requirement: Die Schrägstrich-Variante einer Catch-all-Seite zeigt denselben Inhalt
Für Blog, Community-POI und Events MUST der Slug aus den nicht leeren
Segmenten des Catch-all-Params bestimmt werden. Ein abschließender `/` DARF
weder zu „kein Inhalt“ noch zu einem anderen Slug führen. Ein unbekannter Slug
SHALL weiterhin mit 404 antworten.

#### Scenario: Leeres Schlusssegment
- **WHEN** der Param `slug` den Wert `['dev-blog-1-what-we-using', '']` hat
- **THEN** ist der Slug `dev-blog-1-what-we-using`

#### Scenario: Nur leere Segmente
- **WHEN** der Param `slug` den Wert `['']` hat
- **THEN** gibt es keinen Slug
