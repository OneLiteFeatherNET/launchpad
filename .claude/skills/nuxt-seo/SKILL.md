---
name: nuxt-seo
description: >-
  Covers SEO for this Nuxt 4 site — canonical and hreflang ownership via
  useLocaleHead, @nuxtjs/i18n locale objects, @nuxtjs/seo module version floors,
  site URL resolution, Schema.org identity and @ids, robots directives, sitemap
  sources, and OG image generation with nuxt-og-image. Use when editing the i18n,
  site, sitemap, robots, schemaOrg or ogImage blocks in nuxt.config.ts, when
  touching usePageSeo, useArticleSeo, useLocaleHead, useHead, useSeoMeta,
  defineOgImage or JSON-LD, when adding a locale or a page that needs metadata, or
  when hreflang, canonical tags, og:image, robots.txt or sitemap.xml entries are
  missing, duplicated or wrong.
---

Nuxt 4.2 · @nuxtjs/seo 5.1 · @nuxtjs/i18n 10.3 · @nuxt/content 3.14 · Tailwind 4.1 · Cloudflare Workers + D1

## Emitter ownership map

| tag | emitted by | file |
|---|---|---|
| `rel=canonical`/`rel=alternate` (hreflang), `og:locale` | `useLocaleHead()` | `layouts/default.vue` |
| title/description, robots, OG/Twitter, per-page JSON-LD | `usePageSeo()`/`useArticleSeo()` | `composables/*Seo.ts` |
| sitemap: extra sources / a collection's own `path`-`loc` fix | `sitemap.sources` / — | `server/api/__sitemap__/` / `content.config.ts` (`nuxt-content-cms`) |

Hard rule: no `rel: 'canonical'`/`rel: 'alternate'` outside `layouts/default.vue`.

## Locale objects need `language`, never `iso`

`@nuxtjs/i18n` reads `locale.language` to build the hreflang map
(`node_modules/@nuxtjs/i18n/dist/runtime/kit/head.js`, `createLocaleMap`) — a
locale with no `language` is skipped with a console warning and gets no
alternate link at all. This repo's `nuxt.config.ts` writes `iso: 'de-DE'` /
`iso: 'en-US'` in every locale object instead:

```ts
// wrong — silently produces no hreflang for this locale
{code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json'}
// correct
{code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json'}
```

TypeScript never flags this: `LocaleObject` carries an index signature, so an
unrecognised key like `iso` type-checks fine and just gets ignored at runtime.
Migrating the existing `de`/`en` entries off `iso:` is out of scope here —
that scope note does **not** license copying the same mistake into a new
entry. Every locale you add, first or fifth, must use `language:` from the
start, even though the two entries already in the file don't. Grep the diff
for `iso:` in an `i18n.locales` entry — that string should not appear in any
diff that adds a locale, existing entries aside.

## Env blocks concatenate arrays

`$production` (and `$env.<name>`, and layer `extends`) merge into the base
config through `c12`'s `merger`, which for two arrays does `obj[key] =
obj[key].concat(value)` (`@nuxt/kit`'s `loadNuxtConfig`), never a replace. Four
concrete footguns in this repo's `$production` block: `i18n.locales`,
`schemaOrg.identity.sameAs`, `schemaOrg.identity.contactPoint`, and
`image.format` are each restated in full there — under `concat` that doubles
every entry that also exists in the base config. Adding a locale (or a
`sameAs` link) to only the base config is correct; adding it to *both* blocks
is the bug this skill's own baseline reproduced. Only put genuinely
new-in-production entries in an env block, never a restatement of the base
array.

## `@nuxtjs/seo` is an alias — check the lockfile

| module | floor | module | floor | module | floor |
|---|---|---|---|---|---|
| `@nuxtjs/robots` | ≥6 | `@nuxtjs/sitemap` | ≥8 | `nuxt-schema-org` | ≥6 |
| `nuxt-og-image` | ≥6.2 | `nuxt-seo-utils` | ≥8.1 | `nuxt-site-config` | ≥4 |
| `nuxt-link-checker` | ≥5 | — | — | — | — |

Diagnostic: read the lockfile's `@nuxtjs/seo` importer, not `package.json` — it pins its own versions; `defineSitemapSchema` export ⇒ v8, only `asSitemapCollection` ⇒ v7.

## One site URL: `NUXT_SITE_URL`

`site.url` in `nuxt.config.ts` is a fallback, not the production source.
`nuxt-site-config` reads any `NUXT_SITE_URL` / `NUXT_PUBLIC_SITE_*` env var at
the highest merge priority, above `nuxt.config.ts` and above `@nuxtjs/i18n`'s
own `baseUrl`. Set the real domain once as `NUXT_SITE_URL` in the deploy
environment; don't hand-edit `site.url` per environment block.

## Robots via `routeRules`, once

Per-route `robots` directives belong in `nuxt.config.ts`'s `routeRules`
(`'/en/imprint': { robots: 'noindex, follow' }`), not scattered `useSeoMeta`
calls — `routeRules` is also what `@nuxtjs/robots` reads to keep those routes
out of the sitemap automatically.

## `zeroRuntime` has three preconditions

`ogImage: { zeroRuntime: true }` only works if all three hold:

1. **Prerendering runs at all.** The zero-runtime route
   (`runtime/server/routes/__zero-runtime/image.js`) only renders when
   `import.meta.dev || import.meta.prerender`; every other request throws
   `"Not supported in zeroRuntime mode."` — you need an `nitro.prerender`
   block that actually visits every page needing an image.
2. **Every `defineOgImage()` call uses a locally-owned template**, not a
   community one. `nuxt-og-image`'s own CLI hardcodes
   `COMMUNITY_TEMPLATES = ["NuxtSeo", "Brutalist", "SimpleBlog"]`
   (`dist/cli.cjs`) and its own migration tooling warns "Community templates
   detected that must be ejected for production" — those templates ship
   inside the module, not under this repo's `components/OgImage/`. In this
   repo, `composables/usePageSeo.ts` and `composables/useArticleSeo.ts` both
   call `defineOgImage('NuxtSeo', …)`, and only `TeamMember.satori.vue` exists
   locally — `NuxtSeo` was never ejected. `npx nuxt-og-image eject NuxtSeo`
   copies it to `components/OgImage/NuxtSeo.satori.vue`, where you own it.
3. **The renderer suffix matches the template file** — `.satori.vue` or
   `.takumi.vue`; v6 picks the renderer from the filename, not a `defaults`
   config key.

Fixing precondition 1 alone (adding `nitro.prerender`) is not enough — a
prerender crawl still renders the un-ejected community template unless 2 is
also done. Both are real, open defects in this repo; fixing them is out of
scope here.

## References

- `references/og-images.md` — Satori island boundary, v6 renames, fonts, the `nitro.prerender` recipe.
- `references/i18n-sitemap-robots.md` — sitemap/robots under `strategy: 'prefix'`, the XSL stylesheet, `sitemap.sources`.
- `references/seo-utils-defaults.md` — the four `nuxt-seo-utils` defaults active with no config.
- `references/schema-org-and-site-identity.md` — localised identity, `schemaOrg.identity` vs `useSchemaOrg`, stable `@id`s.

Canonical module order (see `nuxt-content-cms`'s "Module order" for why
`@nuxtjs/sitemap`/`@nuxtjs/seo` must precede `@nuxt/content`):

```ts
modules: [
  '@vueuse/nuxt', 'nuxt-link-checker', 'nuxt-site-config', '@nuxt/eslint',
  '@nuxtjs/i18n', '@nuxtjs/seo', '@nuxtjs/robots', '@nuxtjs/sitemap',
  '@nuxt/image', 'nuxt-og-image', '@nuxt/content', 'nuxt-posthog',
  'nuxt-gtag', 'nuxt-vitalizer'
]
```

## Verify

1. `pnpm seo:check -- --base http://localhost:3000` (needs `pnpm dev` running).
2. Read every reported failure — title/description length, missing OG/Twitter
   fields, a `noindex` route that still appears in the sitemap.
3. Fix the composable or config the failure points at; re-run step 1.
4. View-source a page and count `rel="canonical"` (must be 1) and
   `rel="alternate"` (must equal the locale count) occurrences — more than one
   canonical, or one missing alternate, means a second emitter crept in.
5. CI gates: `.github/workflows/seo.yml` runs the same check plus Lighthouse
   against `.lighthouserc.json` (`categories:seo` ≥ 0.95). Repeat from step 1
   until both pass locally.
