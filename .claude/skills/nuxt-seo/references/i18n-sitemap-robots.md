# i18n, sitemap and robots mechanics

## Locale-scoped sitemaps happen automatically

Under `i18n.strategy: 'prefix'` (this repo's setting), `@nuxtjs/sitemap`
detects `@nuxtjs/i18n` and — with no `sitemap.sitemaps` config at all, as in
this repo — auto-splits the single sitemap into one child sitemap per locale,
each internally flagged `includeAppSources: true`.

The children do **not** live at `/sitemap_<code>.xml`. They live under
`sitemapsPathPrefix` (default `/__sitemap__/`), named from
`_sitemap = locale.language || locale.code`. The module normalises a legacy
`iso:` key into `language` itself (`dist/module.mjs`, `normalizeLocales`), so
this repo's `iso: 'de-DE'` entries still yield `/__sitemap__/de-DE.xml` and
`/__sitemap__/en-US.xml`. The index is `/sitemap_index.xml`; `/sitemap.xml`
does not aggregate them — it gets a `routeRules` **redirect** to
`/sitemap_index.xml`. Fetch `/sitemap_index.xml` when you want the list of
children, and don't guess a child's filename from the locale `code` alone.

Two further consequences:

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

## The XSL viewer hides hreflang, and this repo's column doesn't fix it

Each `<url>` embeds its alternates as `<xhtml:link rel="alternate"
hreflang="…" />` (`runtime/server/sitemap/builder/xml.js`), but the
human-readable XSL stylesheet (`runtime/server/routes/sitemap.xsl.js`) only
renders the columns `sitemap.xslColumns` declares, emitting each one as
`<xsl:value-of select="{c.select}"/>` inside a `for-each` over
`sitemap:urlset/sitemap:url`.

This repo's `nuxt.config.ts` adds a `Language` column with
`select: 'sitemap:hreflang'` — that XPath asks for a child *element* named
`hreflang` in the sitemap namespace, and no such element exists, so the column
renders empty on every row. The alternates are an *attribute* on an element in
the `xhtml` namespace (which the stylesheet does declare), so the expression
would have to be something like `xhtml:link/@hreflang`. Fixing `nuxt.config.ts`
is out of scope here — just don't read the empty column as "hreflang missing".
Diagnostic: never trust the XSL-rendered table; view-source or `curl` the XML
directly and grep for `hreflang=`.

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
