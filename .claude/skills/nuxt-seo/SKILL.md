---
name: nuxt-seo
description: >-
  Covers SEO for this Nuxt 4 site — canonical and hreflang ownership via
  @nuxtjs/i18n's strictSeo, @nuxtjs/i18n locale objects, @nuxtjs/seo module version
  floors, site URL resolution, Schema.org identity and @ids, robots directives,
  sitemap sources, and OG image generation with nuxt-og-image. Use when editing the
  i18n, site, sitemap, robots, schemaOrg or ogImage blocks in nuxt.config.ts, when
  touching usePageSeo, useArticleSeo, useHead, useSeoMeta,
  defineOgImage or JSON-LD, when adding a locale or a page that needs metadata, or
  when hreflang, canonical tags, og:image, robots.txt or sitemap.xml entries are
  missing, duplicated or wrong.
---

Nuxt 4.6 · @nuxtjs/seo 6.0 · @nuxtjs/i18n 10.6 · @nuxt/content 3.16 · Tailwind 4.3 · Cloudflare Workers + D1

## Emitter ownership map

| tag | emitted by | file |
|---|---|---|
| `rel=canonical`/`rel=alternate` (hreflang), `og:locale`, `<html lang/dir>` | `@nuxtjs/i18n`, `experimental.strictSeo` | `nuxt.config.ts` (`i18n`) |
| title/description, robots, OG/Twitter, per-page JSON-LD | `usePageSeo()`/`useArticleSeo()` | `layers/*/composables/*Seo.ts` |
| sitemap: extra sources / a collection's own `path`-`loc` fix | `sitemap.sources` / — | `server/api/__sitemap__/` / `content.config.ts` (`nuxt-content-cms`) |

Hard rule: no `rel: 'canonical'`/`rel: 'alternate'` in app code, and no
`useLocaleHead()`. `strictSeo` owns those tags, and AGENTS.md says
`useLocaleHead` is not allowed in this mode.

## Locale objects need `language`, never `iso`

`@nuxtjs/i18n` reads `locale.language` to build the hreflang map
(`node_modules/@nuxtjs/i18n/dist/runtime/kit/head.js`, `createLocaleMap`) — a
locale with no `language` is skipped with a console warning and gets no
alternate link at all. Write `{code: 'de', language: 'de-DE', …}`, never
`{code: 'de', iso: 'de-DE', …}`. TypeScript never flags it — `LocaleObject`
carries an index signature, so `iso` type-checks fine and is ignored at
runtime. Grep any diff that adds a locale for `iso:`; that string should not
appear in it.

## Env blocks concatenate arrays

`$production` (and `$env.<name>`, and layer `extends`) merge into the base
config through `c12`'s `merger`, which for two arrays does `obj[key] =
obj[key].concat(value)` (`@nuxt/kit`'s `loadNuxtConfig`), never a replace. An
array declared in both the base config and `$production` is doubled, not
overridden. `tests/architecture/production-config.spec.ts` enforces this. Add a
locale (or a `sameAs` link) to the base config only — never to both.

## `@nuxtjs/seo` is a meta-module — read `node_modules/`, not the lockfile

It ships no features of its own. It declares a floor per sub-module in
`moduleDependencies` (`@nuxtjs/seo@6.0.1`'s `dist/module.mjs`); Nuxt resolves
each name from the **project's** `node_modules` and semver-checks it there.
Those floors, not the `dependencies` ranges, are what fails a build:

| module | floor | module | floor | module | floor |
|---|---|---|---|---|---|
| `@nuxtjs/robots` | ≥7.0 | `@nuxtjs/sitemap` | ≥9.0.1 | `nuxt-schema-org` | ≥7.0 |
| `nuxt-og-image` | ≥7.0.1 | `nuxt-seo-utils` | ≥9.0 | `nuxt-site-config` | ≥5.0.1 |
| `nuxt-link-checker` | ≥6.0 | `nuxt-skew-protection` | ≥2.0.1 | `nuxt-ai-ready` | ≥3.0.1 |

Diagnostic: what loads is whatever `node_modules/<pkg>/package.json` says. A
lockfile can list more than one copy of a module, so read `node_modules`, not
the lockfile. Current resolved versions: `@nuxtjs/robots` 7.0.2,
`@nuxtjs/sitemap` 9.1.0, `nuxt-schema-org` 7.0.1, `nuxt-og-image` 7.0.7 (direct
pins in `package.json`), `nuxt-seo-utils` 9.0.1, `nuxt-site-config` 5.0.3 and
`nuxt-link-checker` 6.0.1 (not direct dependencies; resolved through
`@nuxtjs/seo` under `node_modules/.pnpm/`). All clear the floors above.

`@nuxtjs/seo` 6 also installs `nuxt-ai-ready` (llms.txt, markdown responses
negotiated from `Accept`) and `nuxt-skew-protection`. `nuxt.config.ts` sets
`aiReady: false` and `skewProtection: false`: the first would add routes and a
request middleware to cached pages, the second polls for new builds. Do not
remove those lines without checking the edge-cache rules first.

The sitemap and schema-org content helpers are `defineSitemapSchema` (from
`@nuxtjs/sitemap/content`) and `defineSchemaOrgSchema` (from
`nuxt-schema-org/content`), both used inside a collection's `schema`.
`asSitemapCollection` and `asSchemaOrgCollection` still exist but are
deprecated and warn on every build.

## One site URL — `i18n.baseUrl` outranks the config block

`site.url` in `nuxt.config.ts` is a fallback, not the production source. In
`nuxt-site-config` 5 the stack priorities are `config` (-3, the `site` block),
`i18n` (-2, from `i18n.baseUrl`) and `runtime` (0). So `i18n.baseUrl` beats
`site.url`, and at request time `NUXT_SITE_URL` / `NUXT_PUBLIC_SITE_*` (pushed at
`runtime`) beats both. This repo sets `i18n.baseUrl` to the production domain, so
the env var is only needed to point a preview at another origin; don't
hand-edit `site.url` per environment block.

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
   `npx nuxt-og-image eject NuxtSeo` copies it to
   `components/OgImage/NuxtSeo.satori.vue`, where you own it. Current state:
   `layers/content-core/composables/usePageSeo.ts` and
   `layers/blog/composables/useArticleSeo.ts` call
   `defineOgImage('NuxtSeo.satori', …)`. The module's own copy matches that
   name too, so confirm the rendered image, not just the call.
3. **The renderer suffix matches the template file** — `.satori.vue`,
   `.takumi.vue` or `.browser.vue`; v6 picks the renderer from the filename,
   not a `defaults` config key (`nuxt-og-image/dist/runtime/types.d.ts`).
   The suffix in the call name (`'NuxtSeo.satori'`) is what selects the
   Satori variant when the module also ships a takumi one.

Current state: `nuxt.config.ts` sets `ogImage.zeroRuntime: true` (line ~447)
and has no `nitro` block, so precondition 1 fails and no OG images are
generated. Pages fall back to `/images/og-default.png`
(`layers/content-core/utils/socialImage.ts`). The ejected template
`components/OgImage/NuxtSeo.satori.vue` still renders the Nuxt SEO logo and
wordmark, so it has to be replaced with brand artwork before a prerender pass
ships its output.

nuxt-og-image 7 signs runtime image URLs with a key derived from
`runtimeConfig.appSecret` (`NUXT_APP_SECRET`, 32+ characters); without it
runtime OG image requests answer 500. With `zeroRuntime: true` and no
generated images nothing is signed, so the build needs no secret today. The
moment a prerender pass or a runtime image route is added, set the secret as a
Worker secret as well.

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
   `rel="alternate"` (one per locale the page publishes route params for;
   `strictSeo` omits the rest) — more than one canonical, or an alternate
   missing for a locale that has the page, means a second emitter crept in.
4. CI gates: `.github/workflows/seo.yml` runs the same check plus Lighthouse
   against `.lighthouserc.json` (`categories:seo` ≥ 0.95). Repeat from step 1
   until both pass locally.
