# Proposal: Überschriften, Titel- und Beschreibungslängen, Blog-Links ohne Sprache

Ausgeliefert als `fix(seo)`. Pull-Request-Titel:
`fix(seo): tidy headings, title and description lengths and locale-less blog links`

## Why

Fünf Befunde aus dem SEO-Audit nach `fix-seo-brand-signals` und
`tidy-seo-leftovers`, alle Signale auf einzelnen Seiten:

1. **Zwei `<h1>` auf `/<locale>/blog`.** `pages/blog/index.vue:59` hat ein
   `sr-only`-`<h1>` („Übersicht"), `layers/blog/components/Top1.vue:27` macht
   den Titel des Top-Artikels ebenfalls zum `<h1>`. Die Seite hat zwei
   Hauptüberschriften, und die sichtbare ist ein Artikeltitel, nicht der
   Seitenname.
2. **Titel der deutschen Startseite zu lang.** `index.title` in
   `i18n/locales/de.json:96` (`OneLiteFeather – Deutscher Minecraft-Server &
   Open Source`) wird in Suchergebnissen abgeschnitten.
3. **Meta-Descriptions über 155 Zeichen.** `index.description` hat in `de`
   und `en` je 170 Zeichen; 11 Blogartikel haben Beschreibungen zwischen 159
   und 237 Zeichen, fünf Projekt-/POI-Zusammenfassungen (`summary`), die als
   Description dienen, liegen bei 156–193. Google kürzt ab etwa 155–160.
   `scripts/seo-check.mjs` lässt bis 200 durch (`DESCRIPTION_MAX`) und warnt
   deshalb nie.
4. **`/blog/<slug>` ohne Sprache liefert 404.** Alte oder von Hand gesetzte
   Links ohne Locale-Präfix laufen ins Leere; die Seite hat kein Gegenstück
   unter `/en/blog/<slug>`.
5. **Zwei kleine Schema.org-Unstimmigkeiten:** Das Organization-`logo`
   (`nuxt.config.ts:377`) ist nur eine URL-Zeichenkette ohne Maße, und
   `WebPage.inLanguage`/`Article.inLanguage` tragen `en`/`de`, während
   `<html lang>` und `WebSite.inLanguage` `en-US`/`de-DE` sagen.

## What Changes

- `Top1.vue`: `<h1>` wird `<h2>`; Optik bleibt (`text-headline-small`). Das
  `sr-only`-`<h1>` bleibt die einzige Hauptüberschrift der Seite.
- `de.json` `index.title` wird gekürzt (Marke zuerst, siehe `design.md`).
- Alle Meta-Descriptions werden auf höchstens 155 Zeichen gekürzt: zwei
  i18n-Keys, die betroffenen Blog-Frontmatter-`description`, die betroffenen
  `summary`-Felder. Die Liste mit Ist-Längen steht in `design.md`.
- Neue Route-Regel `'/blog/**'` → `/en/blog/**` und `'/blog'` → `/en/blog`,
  beide 301.
- Das Organization-`logo` wird ein `ImageObject` mit `width: 512` und
  `height: 512` (reale Größe von `public/images/logo.png`).
- `usePageSeo` und `useArticleSeo` schreiben `inLanguage` aus
  `localeProperties.language` (`en-US`/`de-DE`), wie `WebSite.inLanguage`.
- Tests halten die Invarianten fest; `scripts/seo-check.mjs` bekommt
  `DESCRIPTION_MAX = 155`.

## Capabilities

### New Capabilities

- `page-meta-lengths`: Titel- und Description-Grenzen je Sprache, eine
  Hauptüberschrift pro Seite, `inLanguage` wie `<html lang>`.
- `legacy-blog-urls`: Blog-URLs ohne Locale-Präfix leiten dauerhaft weiter.

### Modified Capabilities

- `site-identity` (aus `fix-seo-brand-signals`): Organization-Logo mit Maßen;
  die Länge der Startseiten-Description wird dort von 50–200 auf 50–155
  gesenkt.

## Impact

- `layers/blog/components/Top1.vue`, `i18n/locales/{de,en}.json`,
  `content/blog/**`, `content/{projects,community-poi}/**` (nur Beschreibung),
  `nuxt.config.ts` (`routeRules`, `schemaOrg.identity.logo`),
  `layers/content-core/composables/usePageSeo.ts`,
  `layers/blog/composables/useArticleSeo.ts`, `scripts/seo-check.mjs`
- `tests/seo/` (neue Tests, `brand-name.spec.ts` angepasst)
- Keine neuen Abhängigkeiten. Die Redirect-Regel ändert nur Antworten, die
  heute 404 sind.
