# nuxt-seo-utils defaults active with no config

`nuxt-seo-utils` (bundled by `@nuxtjs/seo`) runs an `applyDefaults()` plugin
with `automaticDefaults: true` by default — no config in this repo turns it
on, it just runs. It pushes its own `og:locale`, `og:url`, `og:site_name`,
title template and a `rel="canonical"` link, all at `tagPriority: 'low'`. In
practice this means it's a **fallback**, not a second live emitter: Unhead's
tag-priority dedup keeps `layouts/default.vue`'s normal-priority
`useLocaleHead()` canonical over this low-priority one, so the "one emitter"
rule in the top-level `Emitter ownership map` still holds today. It only
becomes live output if the app-wide `useLocaleHead()` call is ever removed —
worth knowing before you assume canonical has no other source when tracing a
head-rendering bug.

## `canonicalLowercase` (default: `true`)

The fallback canonical above lowercases the URL path
(`url.toLocaleLowerCase(locale)`). `useLocaleHead()`'s hreflang self-reference
does **not** lowercase. `usePageSeo.ts`'s own comment states canonical "must
be byte-identical to this locale's self-referencing hreflang entry" — if this
fallback ever becomes the active canonical (see above) on a route with any
uppercase path segment (a slug, for instance), that byte-identity breaks
silently. Currently masked by the low-priority override, not fixed.

## `canonicalQueryWhitelist` (default: a fixed list)

Defaults to `['page', 'sort', 'filter', 'search', 'q', 'category', 'tag']`
(see `nuxt-seo-utils/dist/module.mjs`) — only these query keys survive
onto the fallback canonical; everything else (tracking params, etc.) is
stripped. `usePageSeo.ts`'s own `cleanUrl()` already strips the query
entirely for the canonical it computes, so this whitelist only matters for
the low-priority fallback path above, not the tag that's actually live today.

## `redirectToCanonicalSiteUrl` (default: `false`)

When `true` and not in dev, a Nitro middleware **301**-redirects a request whose
host doesn't match `site.url` to the canonical host — but only if
`siteConfig.env === 'production'` and the request isn't a prerender, an asset
path, or `/_nuxt`/`/api` (`runtime/server/middleware/redirectCanonical.js`).
Off by default and not enabled in this repo — if a future incident involves an
unexpected 301 on a non-primary domain, check this flag before assuming it's a
Cloudflare-side rule.

## `fallbackTitle` (default: `true`)

Provides the `%s %separator %siteName` title template and a document
`description` fallback when nothing else sets one. With `@nuxtjs/i18n` present
it registers the `titlesWaitI18n` plugin (`titles` without i18n), which fires
after i18n is ready via `dependsOn: ["nuxt-site-config:i18n"]`. The separate
`automaticDefaults` option is what swaps `defaults` for `defaultsWaitI18n` —
don't conflate the two plugins.
`usePageSeo.ts` already supplies its own title/description fallbacks
(`opts.title || site.name`, then `t('seo.default_description')`) at normal
priority, so this default rarely surfaces — it's the last-resort net under a
page that skips `usePageSeo`/`useArticleSeo` entirely.
