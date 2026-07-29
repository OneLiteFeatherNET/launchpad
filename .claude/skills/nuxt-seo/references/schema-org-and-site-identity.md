# Schema.org identity and site config

## One identity source, never two

`nuxt.config.ts`'s `schemaOrg.identity: defineOrganization({...})` and a
runtime `useSchemaOrg(defineOrganization({...}))` call both resolve to the
same graph node (the `@id` schema-org keys as "identity"). `nuxt-schema-org`
dedupes nodes by graph key with its own `merge()` (`dist/schema.mjs`,
`dedupedNodes[nodeKey] = merge(dedupedNodes[nodeKey], n)`), and for array
fields that merge concatenates rather than replaces — the same failure shape
as the top-level "Env blocks concatenate arrays" section, just at the
schema.org layer instead of the Nuxt config layer. Declare the organization's
identity in exactly one place. This repo uses `nuxt.config.ts`'s
`schemaOrg.identity`; if a page ever needs to add to it (not just reference
it), extend that one config object — don't call `defineOrganization()` again
from a composable expecting it to replace anything.

## Localised name/description via i18n message keys

`nuxt-site-config` resolves `site.name`/`site.description` (what
`useSiteConfig()` returns, and what `usePageSeo.ts` falls back to) from i18n
message keys when they exist: `nuxtSiteConfig.name` and
`nuxtSiteConfig.description`, checked with `i18n.te()` before use
(`nuxt-site-config`'s `i18n.js` plugin, `resolveName`/`resolveDescription`).
Add those keys under each locale file
(`i18n/locales/de.json`/`en.json`) to get a translated site name/description
without touching `nuxt.config.ts`'s `site` block — the i18n-sourced value
takes priority (`SiteConfigPriority.i18n`) over the static config-level one.
Neither key exists in this repo's locale files today, so `site.name`'s single
English string is what every locale currently sees.

## `schemaOrg.reactive` and this repo's SSR mode

`nuxt-schema-org` defaults `reactive` to `nuxt.options.dev || !nuxt.options.ssr`
— true in dev, but **false** in this repo's production build, which is SSR
(`nitro.preset: 'cloudflare_module'`, no `ssr: false` anywhere). In
production that means the schema.org graph resolves in `mode: 'server'`
only: correct for the first SSR render of a page, but a client-side route
transition to another page (e.g. blog list → blog post via `<NuxtLink>`)
does **not** recompute the JSON-LD graph unless `schemaOrg.reactive: true` is
set. If a client-navigated page's structured data looks stale in a rendered
DOM snapshot but correct on a hard reload, this is the first thing to check
— not a caching bug.

## Stable `@id` builders

`utils/schema-ids.ts` is the one place that builds schema.org `@id` URLs:
`organizationId(siteUrl)`, `personId(siteUrl, slug)`,
`sponsorId(siteUrl, name)`, `personProfileUrl(siteUrl, locale, slug)`. They
exist so the same logical entity (a team member, the org itself) keeps one
`@id` across every page it appears on — `useArticleSeo.ts`'s `Article.author`
and `Article.publisher` both reference these builders rather than inlining a
URL fragment. Adding a new entity type that needs a stable identity (a
sponsor page, say) should add a builder here, not hand-write the fragment
format at the call site — the format only needs to change in one place if
`site.url` or the fragment scheme ever changes.
