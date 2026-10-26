# Spec Delta

## Purpose

Suchmaschinen sehen eine Website auf Domain-Ebene mit einem Namen, bekannten
Alternativnamen und einer Organisation, deren Angaben der Seite nicht
widersprechen.

## ADDED Requirements

### Requirement: Ein WebSite-Knoten auf Domain-Ebene
Jede Seite unter `/en/**` und `/de/**` MUST im JSON-LD genau einen Knoten vom
Typ `WebSite` ausliefern. Seine `@id` MUST `<site-origin>/#website` sein und
seine `url` MUST `<site-origin>/` sein, unabhängig von der Locale der Seite.
Der Knoten MUST NOT `translationOfWork` oder `workTranslation` tragen.

#### Scenario: Englische Startseite
- **WHEN** `/en` im Produktions-Build abgerufen wird
- **THEN** enthält der Graph genau einen `WebSite`-Knoten mit `@id` `https://onelitefeather.net/#website` und `url` `https://onelitefeather.net/`

#### Scenario: Deutsche Unterseite
- **WHEN** `/de/team` abgerufen wird
- **THEN** hat der `WebSite`-Knoten dieselbe `@id` und `url` wie auf `/en`
- **AND** trägt weder `translationOfWork` noch `workTranslation`

### Requirement: Der WebSite-Knoten nennt Marke und Alternativnamen
`name` des WebSite-Knotens MUST `OneLiteFeather` sein; `alternateName` MUST
`OneLiteFeather Network`, die kleingeschriebene Domain `onelitefeather.net`
und das Kürzel `OLF` enthalten. `description` SHALL der lokalisierten
Site-Beschreibung der Seitensprache entsprechen.

#### Scenario: Alternativnamen
- **WHEN** `/en` abgerufen wird
- **THEN** enthält `alternateName` `OneLiteFeather Network`, `onelitefeather.net` und `OLF`

#### Scenario: Lokalisierte Beschreibung
- **WHEN** `/de/team` abgerufen wird
- **THEN** ist die `description` des `WebSite`-Knotens der deutsche Text aus `nuxtSiteConfig.description`

### Requirement: Die WebPage gehört zur WebSite der Domain
Der `WebPage`-Knoten jeder Seite MUST mit `isPartOf.@id` auf
`<site-origin>/#website` verweisen.

#### Scenario: Artikel
- **WHEN** ein Blogartikel unter `/en/blog/<slug>` abgerufen wird
- **THEN** ist `isPartOf.@id` des `WebPage`-Knotens `https://onelitefeather.net/#website`

### Requirement: Root-Verhalten bleibt unverändert
`/` MUST weiterhin per 302 nach Locale weiterleiten, `no-store` tragen und
nicht in der Sitemap stehen. Canonical, Hreflang und `x-default` MUST
unverändert bleiben. Kein Render DARF dafür Query, Cookies oder
Request-Header lesen.

#### Scenario: Root
- **WHEN** `/` ohne Cookie abgerufen wird
- **THEN** antwortet die Site mit 302 auf eine Locale-Startseite und `cloudflare-cdn-cache-control: no-store`

### Requirement: Organization ohne Widerspruch
Die Organization (`<site-origin>/#identity`) MUST als `description` denselben
Text tragen wie die Site-Beschreibung der Seitensprache
(`nuxtSiteConfig.description` in `de.json` bzw. `en.json`); der Grundwert in
`nuxt.config.ts` MUST der englische Text sein. Ihr `logo` MUST auf ein Rasterbild (PNG) von mindestens
112×112 Pixeln zeigen. `name` MUST `OneLiteFeather` bleiben,
`alternateName` `OneLiteFeather Network`.

#### Scenario: Grundwert
- **WHEN** die Organization-Konfiguration in `nuxt.config.ts` gelesen wird
- **THEN** ist ihre `description` gleich `nuxtSiteConfig.description` aus `i18n/locales/en.json`

#### Scenario: Deutsche Seite
- **WHEN** `/de/team` im Produktions-Build abgerufen wird
- **THEN** ist die `description` der Organization der deutsche Text aus `nuxtSiteConfig.description`
- **AND** `/en/team` liefert den englischen Text

#### Scenario: Logo
- **WHEN** der `#logo`-Knoten im Produktions-Build gelesen wird
- **THEN** endet seine `url` auf `.png` und die Datei existiert unter `public/`

### Requirement: Die Startseite nennt die Domain
Die Meta-Description der Startseite MUST in beiden Sprachen mit
`OneLiteFeather` beginnen und `onelitefeather.net` enthalten. Der Titel MUST
weiter mit `OneLiteFeather ` beginnen.

#### Scenario: Deutsche Startseite
- **WHEN** `/de` abgerufen wird
- **THEN** enthält `<meta name="description">` den Text `onelitefeather.net`
