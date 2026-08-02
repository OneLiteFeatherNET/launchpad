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

Nuxt 4.4 · @nuxtjs/seo 5.1 · @nuxtjs/i18n 10.3 · @nuxt/content 3.14 · Tailwind 4.3 · Cloudflare Workers + D1

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
`iso: 'en-US'` instead: write `{code: 'de', language: 'de-DE', …}`, never
`{code: 'de', iso: 'de-DE', …}`. TypeScript never flags it — `LocaleObject`
carries an index signature, so `iso` type-checks fine and is ignored at
runtime. Migrating the existing `de`/`en` entries is out of scope; that does
**not** license copying the mistake into a new one. Grep any diff that adds a
locale for `iso:`; that string should not appear in it.

## Env blocks concatenate arrays

`$production` (and `$env.<name>`, and layer `extends`) merge into the base
config through `c12`'s `merger`, which for two arrays does `obj[key] =
obj[key].concat(value)` (`@nuxt/kit`'s `loadNuxtConfig`), never a replace. Four
footguns in this repo's `$production` block: `i18n.locales`,
`schemaOrg.identity.sameAs`, `schemaOrg.identity.contactPoint` and
`image.format` are each restated in full there, so `concat` doubles every entry
that also exists in the base config. Add a locale (or a `sameAs` link) to the
base config only — never to both, the bug this skill's own baseline reproduced.

## `@nuxtjs/seo` is a meta-module — read `node_modules/`, not the lockfile

It ships no features of its own. It declares a floor per sub-module in
`moduleDependencies` (`@nuxtjs/seo@5.1.4`'s `dist/module.mjs`); Nuxt resolves
each name from the **project's** `node_modules` and semver-checks it there.
Those floors, not the `dependencies` ranges, are what fails a build:

| module | floor | module | floor | module | floor |
|---|---|---|---|---|---|
| `@nuxtjs/robots` | ≥5.5 | `@nuxtjs/sitemap` | ≥7.4 | `nuxt-schema-org` | ≥5.0 |
| `nuxt-og-image` | ≥6.4.4 | `nuxt-seo-utils` | ≥7.0 | `nuxt-site-config` | ≥3.2 |
| `nuxt-link-checker` | ≥4.3 | — | — | — | — |

Diagnostic: what loads is whatever `node_modules/<pkg>/package.json` says. A
direct pin in this repo's `package.json` wins over the newer copy `@nuxtjs/seo`
drags into its own tree, and a lockfile lists both — so the lockfile alone can
never answer this. Worked example: `package.json` pins robots 5.7.1, sitemap
7.6.0, schema-org 5.0.10; `@nuxtjs/seo`'s `dependencies` additionally resolve
6.1.2 / 8.0.15 / 6.2.3 under `node_modules/.pnpm/`. Only the pins load (grep
`.nuxt/` for `.pnpm/@nuxtjs+sitemap@`), all clear the floors above, and the
build is clean — but the API you get is v7's. Tell the two apart by export:
`defineSitemapSchema` ⇒ sitemap v8, only `asSitemapCollection` ⇒ v7 (this repo).

## One site URL — but `i18n.baseUrl` outranks it

`site.url` in `nuxt.config.ts` is a fallback, not the production source.
`nuxt-site-config` reads `NUXT_SITE_URL` / `NUXT_PUBLIC_SITE_*` into a stack
entry at `_priority: -1`, above `nuxt.config.ts`'s `site` block (`-3`). But the
entry it pushes from `i18n.baseUrl` carries **no** `_priority` (so, 0) and is
pushed last, and the stack sorts ascending with later entries overwriting — so
`i18n.baseUrl` beats `NUXT_SITE_URL`, at build and at request time. This repo
sets `i18n.baseUrl` (`nuxt.config.ts:94`), so setting `NUXT_SITE_URL` alone
would silently do nothing. Change `i18n.baseUrl` too, or drop it so the env var
can win; either way don't hand-edit `site.url` per environment block.

## Robots via `routeRules`, once

Per-route `robots` directives belong in `nuxt.config.ts`'s `routeRules`
(`'/en/imprint': { robots: 'noindex, follow' }`), not scattered `useSeoMeta`
calls — `routeRules` is also what `@nuxtjs/robots` reads to keep those routes out
of the sitemap automatically.

## `zeroRuntime` has three preconditions

`ogImage: { zeroRuntime: true }` only works if all three hold:

1. **Prerendering runs at all.** The zero-runtime route
   (`runtime/server/routes/__zero-runtime/image.js`) only renders when
   `import.meta.dev || import.meta.prerender`; every other request throws
   `"Not supported in zeroRuntime mode."` — you need an `nitro.prerender`
   block that actually visits every page needing an image.
2. **Every `defineOgImage()` call uses a locally-owned template**, not one of
   the 12 the module ships under `runtime/app/components/Templates/Community/`
   — they live inside the module, not under this repo's `components/OgImage/`.
   Here `composables/usePageSeo.ts` and `composables/useArticleSeo.ts` both call
   `defineOgImage('NuxtSeo', …)` while only `TeamMember.satori.vue` exists
   locally. `npx nuxt-og-image eject NuxtSeo` copies it to
   `components/OgImage/NuxtSeo.satori.vue`, where you own it.
3. **The renderer suffix matches the template file** — `.satori.vue`,
   `.takumi.vue` or `.browser.vue`; v6 picks the renderer from the filename,
   not a `defaults` config key (`nuxt-og-image/dist/runtime/types.d.ts`).

Precondition 1 alone is not enough: a prerender crawl still renders the
un-ejected community template unless 2 is also done. Both are real, open
defects here; fixing them is out of scope.

## References

- `references/og-images.md` — Satori island boundary, v6 renames, fonts, the `nitro.prerender` recipe.
- `references/i18n-sitemap-robots.md` — sitemap/robots under `strategy: 'prefix'`, the XSL stylesheet, `sitemap.sources`.
- `references/seo-utils-defaults.md` — the four `nuxt-seo-utils` defaults active with no config.
- `references/schema-org-and-site-identity.md` — localised identity, `schemaOrg.identity` vs `useSchemaOrg`, stable `@id`s.

Canonical module order (`nuxt.config.ts`'s `modules` array — see
`nuxt-content-cms`'s "Module order" for why `@nuxtjs/sitemap`/`@nuxtjs/seo`
must precede `@nuxt/content`):

```ts
['@vueuse/nuxt', 'nuxt-link-checker', 'nuxt-site-config', '@nuxt/eslint',
 '@nuxtjs/i18n', '@nuxtjs/seo', '@nuxtjs/robots', '@nuxtjs/sitemap',
 '@nuxt/image', 'nuxt-og-image', '@nuxt/content', 'nuxt-posthog',
 'nuxt-vitalizer']
```

`nuxt-gtag` was removed: it loaded a Google Ads tag with no consent layer in
front of it. Do not add it — or any other analytics module — back without one.
PostHog stays, but runs with `opt_out_capturing_by_default: true` until a
consent mechanism exists.

## Verify

1. `pnpm seo:check -- --base http://localhost:3000` (needs `pnpm dev` running).
2. Read every reported failure — title/description length, missing OG/Twitter
   fields, a `noindex` route that still appears in the sitemap. Fix the
   composable or config it points at; re-run step 1.
3. View-source a page and count `rel="canonical"` (must be 1) and
   `rel="alternate"` (must equal the locale count) — more than one canonical,
   or one missing alternate, means a second emitter crept in.
4. CI gates: `.github/workflows/seo.yml` runs the same check plus Lighthouse
   against `.lighthouserc.json` (`categories:seo` ≥ 0.95). Repeat from step 1
   until both pass locally.
