# Proposal: Marken- und Site-Name-Signale, strukturierte Daten und Robots-Header

Ausgeliefert als `fix(seo)`. Pull-Request-Titel:
`fix(seo): give google one root website identity and consistent page signals`

## Why

Ein Audit der Live-Site am 2026-10-26 (Crawl aller Sitemap-URLs, JSON-LD jeder
Seite, validator.schema.org) zeigt:

1. **Google findet die Site für „OneLiteFeather Network“, nicht für
   „OneLiteFeather“ oder „onelitefeather.net“.** Die Marke heißt erst seit
   #543 (2026-10-15) einheitlich „OneLiteFeather“; ein Teil ist Crawl-Verzug.
   Was die Site selbst steuert, widerspricht aber Googles Site-Name-Regeln
   (developers.google.com/search/docs/appearance/site-names): Der einzige
   `WebSite`-Knoten stammt aus dem i18n-Default von `nuxt-schema-org` und
   heißt `https://onelitefeather.net/en#website` mit `url` `/en` (bzw. `/de`),
   also auf Unterverzeichnis-Ebene, die Google nicht unterstützt, und ohne
   `alternateName`. „OneLiteFeather Network“ steht nur als `alternateName`
   der Organization. Deren `description` ist englisch, nennt OneLiteFeather
   „a Minecraft Network focusing on the development tools…“ und widerspricht
   der Meta-Description. Die Domain steht weder in Titel, H1 noch
   Meta-Description der Startseite.
2. **Strukturierte Daten.** `primaryImageOfPage` ist auf jeder Seite das
   SVG-Logo, auch wo ein og:image existiert; das Organization-Logo gibt es
   nur als SVG. `ProfilePage` (`pages/team/[slug].vue`) hat kein
   `mainEntity`. validator.schema.org meldet `codeRepository` auf
   `SoftwareApplication` als unbekannte Eigenschaft.
3. **Indexierung und Titel.** Dünne Teamprofile tragen absichtlich
   `<meta name="robots" content="noindex, follow">`, der Header
   `X-Robots-Tag` sagt aber `index, follow` (gemessen an
   `/de/team/morelia0815`, `/de/team/joltras`, `/en/team/mrs_sunday`).
   Dasselbe trifft ungelistete Events. Deutsche Seiten zeigen teils englische
   Titel („Community Points of Interest“), die Blog-Übersicht heißt nur
   „Übersicht“ / „Overview“.
4. **Keine Prüfung.** CI prüft nur, dass JSON-LD vorhanden und parsebar ist,
   nicht, was drinsteht. Jeder Punkt oben wäre durch eine inhaltliche Prüfung
   aufgefallen.

## What Changes

- **Ein WebSite-Knoten für die Domain, auf allen Locales gleich:**
  `@id` `https://onelitefeather.net/#website`, `url`
  `https://onelitefeather.net/`, `name` `OneLiteFeather`, `alternateName`
  `["OneLiteFeather Network", "onelitefeather.net", "OLF"]`, beide Sprachen
  in `inLanguage`. Der i18n-Default des Moduls wird ersetzt, nicht ergänzt; der
  302 auf `/` bleibt (Variante (a), siehe `design.md`).
- Der Default-`WebPage`-Knoten verweist mit `isPartOf` auf diesen Knoten statt
  auf `/en#website` bzw. `/de#website`.
- **Organization:** `description` je Sprache gleich der lokalisierten
  Site-Beschreibung (`nuxtSiteConfig.description`, DE und EN); die Konfiguration
  in `nuxt.config.ts` trägt den englischen Text als Grundwert, das Plugin
  überschreibt ihn per zweitem Merge mit dem Text der Seitensprache.
  Zusätzlich ein PNG-Logo (512×512) statt nur SVG.
- **Startseite:** eigene Meta-Description je Sprache, die die Domain
  `onelitefeather.net` nennt. Titel und H1 bleiben.
- **`primaryImageOfPage`** ist das Social-Image der Seite (eigenes Bild oder
  `og-default.png`), nicht mehr das Logo; Artikel ebenso.
- **ProfilePage** bekommt `mainEntity` → `@id` der Person.
- **`codeRepository`** wandert von `SoftwareApplication` nach `sameAs`
  (Repository-URL als Identitätslink); sonst keine Änderung an
  `SoftwareApplication`.
- **Robots:** `usePageSeo` setzt seine Direktive über `useRobotsRule` von
  `@nuxtjs/robots`, das Meta-Tag und `X-Robots-Tag` gemeinsam schreibt.
  Meta und Header stimmen damit auf jeder Seite überein.
- **Titel:** Deutsche Seitentitel, die unübersetzt sind, werden übersetzt
  (u. a. `/de/events` heißt „Veranstaltungen“); die Blog-Übersicht und die
  Autorenseite bekommen sprechende Titel; DevBlog #1 einen `seo.title` je
  Sprache. Eigennamen und gebräuchliche Lehnwörter (BlueMap, Community,
  Teamnamen, „Slender: Halloween 2026“) bleiben gleich.
- **CI-Prüfung des JSON-LD-Inhalts:** reine Prüffunktionen in
  `scripts/jsonld-checks.mjs` (Vitest-getestet), aufgerufen von
  `scripts/seo-check.mjs` gegen den Produktions-Build (`seo.yml`). Geprüft:
  WebSite (Root-`url`, `name`, `alternateName`), Organization, Article
  (Pflicht- und empfohlene Felder), ProfilePage `mainEntity` auflösbar,
  `isPartOf` auflösbar, Meta-Robots gleich `X-Robots-Tag`.
- Nicht in diesem Change: Event- und SoftwareApplication-Eignung für Rich
  Results, neue Rich-Result-Typen, `/` als 200-Seite, Änderungen an
  Canonical/Hreflang/Sitemap. Das Entfernen des FAQPage-Markups
  (`FaqSection.vue`) übernimmt ein eigener Chore-Change; `favicon.ico` und
  Doku-Korrekturen kommen in `tidy-seo-leftovers` und `refresh-seo-docs`.

## Capabilities

### New Capabilities

- `site-identity`: Ein WebSite-Knoten auf Domain-Ebene, Organization mit
  konsistenter Beschreibung und Raster-Logo, Domain im Startseiten-Text.
- `structured-data`: `primaryImageOfPage`, ProfilePage `mainEntity`,
  gültige Eigenschaften auf `SoftwareApplication`, und eine CI-Prüfung des
  JSON-LD-Inhalts.
- `page-indexing-signals`: Meta-Robots und `X-Robots-Tag` stimmen überein;
  deutsche Seitentitel sind deutsch, außer bei Eigennamen.

### Modified Capabilities

Keine.

## Impact

- `layers/content-core/plugins/site-identity.server.ts` (neu),
  `layers/content-core/utils/siteIdentity.ts` (neu),
  `layers/content-core/utils/schema-ids.ts` (`websiteId`)
- `layers/content-core/composables/usePageSeo.ts`,
  `layers/blog/composables/useArticleSeo.ts`,
  `layers/home/composables/useHomeSeo.ts`, `pages/team/[slug].vue`,
  `layers/projects/utils/softwareApplication.ts`
- `nuxt.config.ts` (`schemaOrg.identity`: `description`, `logo`; `site.description`),
  `public/images/logo.png` (neu)
- `i18n/locales/de.json`, `i18n/locales/en.json`, `pages/blog/index.vue`,
  `content/blog/{de,en}/dev-blog-1.md`
- `scripts/jsonld-checks.mjs` (neu), `scripts/seo-check.mjs`
- Tests unter `tests/seo/`, `tests/projects/`, `tests/scripts/`
- Keine neuen Abhängigkeiten. Keine Änderung an `routeRules`, Caching,
  Sitemap, Canonical oder Hreflang.
