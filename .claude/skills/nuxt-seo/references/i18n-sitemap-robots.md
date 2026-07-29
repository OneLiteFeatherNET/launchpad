# i18n, sitemap and robots mechanics

## Locale-scoped sitemaps happen automatically

Under `i18n.strategy: 'prefix'` (this repo's setting), `@nuxtjs/sitemap`
detects `@nuxtjs/i18n` and — with no `sitemap.sitemaps` config at all, as in
this repo — auto-splits the single sitemap into one child sitemap per locale
(`/sitemap_de.xml`, `/sitemap_en.xml`, aggregated under `/sitemap.xml`), each
internally flagged `includeAppSources: true`. Two consequences:

- If you ever add an explicit `sitemap.sitemaps` block yourself, a top-level
  `sitemap.sources` or `sitemap.includeAppSources` in `nuxt.config.ts` is
  **ignored** with a console warning — move it into the specific child
  sitemap's config instead. This repo hasn't hit that yet because it never
  sets `sitemap.sitemaps`.
- Every entry ends up tagged `_sitemap: '<locale code>'` (from
  `locale._sitemap`), which is how the module knows which child sitemap file
  an entry belongs to. It's an internal field — don't set it by hand.

## `_i18nTransform`: how hreflang alternates get attached

An entry without `_i18nTransform` gets its `alternatives` (hreflang link set)
computed by finding sibling entries that share the same path with the locale
prefix stripped — this is how a normal locale-prefixed page (including
`@nuxt/content` page collections, see `nuxt-content-cms`) gets its alternates
for free. An entry with `_i18nTransform: true` instead gets fully expanded
into one entry per configured locale from a single un-prefixed source entry —
used internally for i18n `pages` mappings, not something a hand-written
`sitemap.sources` handler needs to set.

## `sitemap.sources`: registering data-collection URLs

Content that isn't a URL-bearing page collection (this repo's `team`, a
`type: 'data'` collection) doesn't produce sitemap entries on its own.
`server/api/__sitemap__/team.ts` is registered via `sitemap.sources: ['/api/__sitemap__/team']`
in `nuxt.config.ts` and returns a flat `{ loc }[]` array, one entry per
locale × member — the same pattern to follow for any other non-page content
that needs sitemap URLs. See `nuxt-content-cms` for the split: page
collections' own `path`/`loc` bugs are fixed in `content.config.ts`; sources
like this one live in `nuxt.config.ts`/`server/api/__sitemap__/`.

## The XSL viewer hides hreflang unless you ask

`/sitemap.xml` embeds `<xhtml:link rel="alternate" hreflang="...">` entries
per URL, but the human-readable XSL stylesheet
(`runtime/server/routes/sitemap.xsl.js`) only renders whatever columns
`sitemap.xslColumns` declares — it does not surface `xhtml:link` alternates
as a column by default, so a browser view of `/sitemap.xml` looks like
hreflang is missing even when it isn't. This repo's `nuxt.config.ts` already
adds a `Language` column with `select: 'sitemap:hreflang'` for exactly this
reason. Diagnostic: if hreflang looks wrong, don't trust the XSL-rendered
table — view-source or `curl` the XML directly and grep for `hreflang=`.

## Robots: `routeRules` is not auto-translated per locale

`@nuxtjs/robots` can expand a single path into every locale's translated
equivalent (`autoI18n`'s `mapPathForI18nPages`), but only when `@nuxtjs/i18n`'s
own `i18n.pages` config maps that path to per-locale slugs. This repo sets no
`i18n.pages`, so there is nothing to expand from — that's why `routeRules` in
`nuxt.config.ts` lists `/en/imprint` and `/de/imprint` as two separate,
hand-written entries rather than one path relying on auto-expansion. If
`i18n.pages` is ever added, re-check whether those duplicated `routeRules`
entries are still needed or now redundant.

`_skipI18n` is an internal per-group flag (`config.groups`) some `robots`
integrations set to opt a `User-agent` group out of the locale-path expansion
entirely — relevant if a third-party rule set (e.g. from a layer) should
apply verbatim, without the locale prefixes appended.
