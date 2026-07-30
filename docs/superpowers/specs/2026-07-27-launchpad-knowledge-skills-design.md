# Launchpad Knowledge Skills — Design

Date: 2026-07-27
Status: approved, ready for implementation planning

## 1. Goal

Give every agent session working on this repository a shared, checked-in body of
knowledge about the four areas that drive most of the work here: SEO, project
structure, the content layer, and styling.

The skills live at `.claude/skills/<name>/` and ship with the repo, so CLI, web,
and CI sessions all get the same standards.

## 2. Context

`.claude/` was removed in `21ebaef` and `883d57c`, which deleted roughly 40
atomic, Lighthouse-audit-driven skills (`seo-*`, `perf-*`, `a11y-*`, `sec-*`,
`net-*`, `bp-*`, `privacy-*`) plus one `*-reviewer` agent per skill.
`AGENTS.md:45-92` still advertises all of them. That section is currently wrong
and is rewritten as part of this work.

The new skills are **not** a restoration of the deleted set. The old skills were
audit checklists ("keep `document-title` green"). These are knowledge skills:
they carry the framework behaviour that agents get wrong, and point at where
that behaviour is implemented here.

## 3. Non-goals

- Restoring the deleted `perf-*`, `a11y-*`, `sec-*`, `net-*`, `bp-*`,
  `privacy-*` skills.
- Restoring the `*-reviewer` agents.
- Fixing the production defects found during research (see §11) — tracked
  separately.
- Documenting anything a competent current model already produces unprompted.

## 4. Research basis

The content plan was produced by a nine-agent research workflow: one docs-research
agent per topic reading the primary sources, one repo-reconciliation agent per
topic verifying every claim against real files, then a synthesis pass.

Primary sources: `nuxtseo.com`, `nuxt.com/docs/4.x`, `content.nuxt.com`,
`tailwindcss.com/docs`, and the Google Search SEO starter guide.

Every finding was sorted into three buckets, and only the first two survive into
a skill:

1. **Version deltas** — where the installed major version differs from the
   previous one. Highest value: a model trained mostly on the older version will
   confidently emit the old API.
2. **Non-obvious rules** — ordering constraints, where a call is legal, config
   that silently no-ops.
3. **Evergreen** — what any competent model already knows. Explicitly excluded.

Authoring rules follow Anthropic's official skill-authoring guidance and the
`superpowers:writing-skills` skill.

## 5. Authoring rules

These apply to every skill produced under this spec.

| Rule | Source |
|---|---|
| SKILL.md under 150 lines (official limit is 500; we stay well under) | Anthropic, progressive disclosure |
| References linked one level deep from SKILL.md only — never reference-to-reference | Anthropic: nested references get partially read via `head -100` |
| Reference files over 100 lines open with a table of contents | Anthropic |
| `description` in third person; states what the skill covers **and** the triggering conditions; loaded with searchable keywords (error strings, symbols, file names) | Anthropic + SDO |
| No time-sensitive phrasing. Superseded APIs go in a collapsed `<details><summary>Old patterns (…)</summary>` block | Anthropic |
| One default with an escape hatch, never a menu of options | Anthropic: "avoid offering too many options" |
| Forward slashes in all paths | Anthropic |
| Consistent terminology within a skill | Anthropic |
| Only content the model does not already reliably have | Anthropic: "Only add context Claude doesn't already have" |
| Every skill ends with a `Verify` section that is a real feedback loop (run → read output → fix → repeat), not a single command | Anthropic: validator loops |
| Each skill carries repo pointers (5-8 concern → path entries). Pointers only — behavioural rules for contributors stay in `AGENTS.md` | Project decision |

On the last rule: the pointers are **integrated into the section where they are
needed**, not appended as a separate `In this repo` block. Each skill has one
section that doubles as its pointer table — `Emitter ownership map` in
`nuxt-seo`, `Layout map` in `nuxt-structure`, `The repository boundary` in
`nuxt-content-cms`, `The token contract` in `tailwind-design`. A separate block
would restate those paths a second time.

## 6. Architecture

```
.claude/skills/
  nuxt-seo/            SKILL.md  (~134 lines)
    references/og-images.md
    references/i18n-sitemap-robots.md
    references/seo-utils-defaults.md
    references/schema-org-and-site-identity.md
  nuxt-structure/      SKILL.md  (~140 lines)
    references/nuxt4-runtime-deltas.md
    references/server-and-shared.md
  nuxt-content-cms/    SKILL.md  (~140 lines)
    references/body-and-prose.md
    references/cloudflare-d1.md
    references/v2-to-v3-migration.md
  tailwind-design/     SKILL.md  (~115 lines)
    references/theme-authoring.md
    references/v4-utility-changes.md
    references/prose-and-code-blocks.md
```

Version anchor for all four: Nuxt 4.2 · `@nuxtjs/seo` 5.1 · `@nuxtjs/i18n` 10.3 ·
`@nuxt/content` 3.14 · Tailwind 4.1 · Cloudflare Workers + D1.

## 7. Skill specifications

### 7.1 `nuxt-seo`

**Description:** covers canonical and hreflang ownership via `useLocaleHead`,
`@nuxtjs/i18n` locale objects, `@nuxtjs/seo` module version floors, site URL
resolution, Schema.org identity and `@id`s, robots directives, sitemap sources,
and OG image generation. Triggers: editing the `i18n` / `site` / `sitemap` /
`robots` / `schemaOrg` / `ogImage` blocks in `nuxt.config.ts`; touching
`usePageSeo`, `useArticleSeo`, `useLocaleHead`, `useHead`, `useSeoMeta`,
`defineOgImage` or JSON-LD; adding a locale or a page needing metadata; hreflang,
canonical, `og:image`, `robots.txt` or `sitemap.xml` entries missing, duplicated
or wrong.

**SKILL.md sections:**

| Section | ~Lines | Content |
|---|---|---|
| Emitter ownership map | 14 | Which file emits what: canonical/hreflang/`og:locale`/`html lang` → `layouts/default.vue`; per-page meta + WebPage JSON-LD → `composables/usePageSeo.ts`; article meta + Article JSON-LD → `composables/useArticleSeo.ts`; `@id`s → `utils/schema-ids.ts`. Hard rule: no `rel=canonical` or `rel=alternate` outside the layout. |
| Locale objects need `language`, never `iso` | 16 | The silent-failure chain: `createLocaleMap()` skips a locale without `language` → no alternates, no `x-default`, no `og:locale`, no `htmlAttrs.lang`. TypeScript never flags it because `LocaleObject` has an index signature. Correct/wrong code pair, plus `isCatchallLocale`. |
| Env blocks concatenate arrays | 14 | `$production` / `$development` / layers merge through `createDefu` with a concat branch. Rule: env blocks override scalars and add keys — never restate an array. Named footguns: `i18n.locales`, `schemaOrg.identity.sameAs`, `contactPoint`, `image.format`. |
| `@nuxtjs/seo` is an alias — check the lockfile | 18 | Version floor table (robots ≥6, sitemap ≥8, schema-org ≥6, og-image ≥6.2, seo-utils ≥8.1, site-config ≥4, link-checker ≥5). Diagnostic: read the lockfile root importer, not `package.json`. Tell: `asSitemapCollection` compiling means the v4 generation resolved; `defineSitemapSchema` means v5. |
| One site URL: `NUXT_SITE_URL` | 12 | Site Config is the single source for canonical, hreflang, sitemap `loc`, absolute `og:image` and Schema.org `@id`. Never a literal in `nuxt.config`, never a parallel `runtimeConfig.public.siteUrl`. |
| Robots via `routeRules`, once | 10 | One declaration yields the meta tag, the `X-Robots-Tag` header and the `robots.txt` entry. Never also pass `robots` to a head composable. |
| `zeroRuntime` has three preconditions | 16 | (a) the route is prerendered via `nitro.prerender`; (b) bundled community templates are stripped from the build — copy locally first; (c) the `.satori.vue` / `.takumi.vue` suffix. There is no fallback: not prerendered means no image. |
| Verify | 8 | `pnpm seo:check`; view-source and count `rel=canonical` / `rel=alternate`; CI wiring in `.github/workflows/seo.yml` and `.lighthouserc.json` (SEO ≥ 0.95). |

**references/**

| File | Scope | ~Lines |
|---|---|---|
| `og-images.md` | OG templates end to end: the island boundary (no locale prefix, no cookies, no messages → resolve i18n in the page and pass props), og-image v6 renames, fonts, and the concrete `nitro.prerender` recipe that makes `zeroRuntime` viable | 75 |
| `i18n-sitemap-robots.md` | Sitemap and robots under `strategy: 'prefix'`: `includeAppSources`, `_i18nTransform`, `_sitemap`, the XSL stylesheet hiding `xhtml:link` alternates, robots `autoI18n` path expansion, `_skipI18n`, registering data-collection sources | 85 |
| `seo-utils-defaults.md` | Four opinionated defaults active with no config: `canonicalLowercase` (and how it invalidates hreflang targets), `canonicalQueryWhitelist`, `redirectToCanonicalSiteUrl`, `fallbackTitle` | 55 |
| `schema-org-and-site-identity.md` | Localised identity via `nuxtSiteConfig.*` message keys; identity in config **or** `useSchemaOrg(defineOrganization())`, never both (they merge, not replace); `schemaOrg.reactive`; stable `@id` builders | 70 |

**Baseline scenarios:**

1. *"Add French as a third locale."* Expected failure: emits `iso: 'fr-FR'`
   without `language:`, and adds the locale to both the base config and
   `$production`. Falsifiable: the diff contains `iso:` and no `language:`,
   and/or `$production.i18n.locales` is restated.
2. *"The /partners page needs proper hreflang and a canonical URL."* Expected
   failure: adds `useHead({ link: [{ rel: 'canonical' … }] })` in the page or in
   `usePageSeo`. Falsifiable: `rel: 'canonical'` or `rel: 'alternate'` appears in
   any file other than `layouts/default.vue`.
3. *"OG images are blank for blog articles in production — fix it."* Expected
   failure: edits the template or disables `zeroRuntime`, never adding
   prerendering or a local template copy. Falsifiable: no `nitro.prerender` block
   and no new `components/OgImage/*.satori.vue`.

### 7.2 `nuxt-structure`

**Description:** explains where code lives in this Nuxt 4 repository and how its
data layer behaves — the root-level `srcDir` with no `app/` directory,
auto-import scan rules, the layout/page/`app.vue` ownership split, the Nitro
server directories, and the `useAsyncData` conventions every composable follows.
Triggers: adding or moving a page, component, composable, util, layout, plugin,
middleware or server route; writing `useAsyncData`, `useState`, `definePageMeta`
or `runtimeConfig` code; a `~/...` import or auto-import failing to resolve;
considering a migration to the `app/` layout.

**SKILL.md sections:**

| Section | ~Lines | Content |
|---|---|---|
| Layout map + the `app/` rule | 22 | Directory table for the root-level layout. **Never create a file under `app/`** — `srcDir` is auto-detected, and one non-exempt entry flips it, unmounting every route and auto-import with no error. Only `spa-loading-template.html` and `router.options.*` are exempt. Never run `npx codemod nuxt/4/file-structure`. If the repo ever moves, it moves wholesale in one commit. |
| Where new code goes | 16 | `types/` → `composables/` → `components/features/<domain>/` → `pages/`. Auto-import scans only the **top level** of `composables/` and `utils/` — which is why `utils/content/*` is imported explicitly while `utils/schema-ids.ts` is used bare. |
| The house `useAsyncData` shape | 24 | Full code block: reactive getter key + repository handler + `watch: [activeLocale]`, and why the key is a getter. Corollary: two composables fetching one resource use distinct keys deliberately. |
| Nuxt 4 data semantics | 16 | `data`/`error` default to `undefined`, not `null` (hence `?? []`); `data` is a `shallowRef` — never mutate in place; `experimental.purgeCachedData` defaults true. |
| Ownership: layout, app.vue, page | 14 | The layout owns the single `<main id="main-content">` and all head link tags; `app.vue` owns `titleTemplate` and icon/manifest links; pages add neither. Pointers to `nuxt-seo` and `nuxt-content-cms`. |
| Server boundary | 16 | `server/api/**` is `/api`-prefixed; `server/routes/**` is not and beats a module's own handler; only `server/utils/**` auto-imports; app `utils/` and `composables/` are unreachable from Nitro — dual-context code belongs in `shared/utils` and `shared/types`. `useRuntimeConfig(event)`. |
| SSR determinism | 12 | No `Date.now()` / `Math.random()` / `localStorage` in setup or template on an SSR route; module-scope mutable state is shared across requests on Workers; `<ClientOnly>` needs a sized `#fallback`. |
| Verify | 7 | `pnpm nuxt prepare` after adding composables/utils/server routes; the symptom of a stale `.nuxt` is every `~/...` resolving to `<root>/app/...`. |

**references/**

| File | Scope | ~Lines |
|---|---|---|
| `nuxt4-runtime-deltas.md` | Only the Nuxt 3→4 changes a realistic edit here can trip: `getCachedData(key, nuxtApp, ctx)` running on every fetch, `dedupe: 'cancel' \| 'defer'`, `pending` derived from `status`, `route.name` not `route.meta.name`, `generate.routes` → `nitro.prerender`, Unhead v2 dropping `hid`/`vmid`/`children`/`body`. Plus `definePageMeta` macro constraints. | 105 (ToC) |
| `server-and-shared.md` | Nitro in depth: `serverDir` is rootDir-relative; file-route-beats-module-handler precedence with `[sitemap].xml.ts` as the worked example; `shared/` auto-import restrictions and the `#shared` alias; nested dirs needing both `imports.dirs` and `nitro.imports.dirs`. | 70 |

**Baseline scenarios:**

1. *"Add a global route middleware redirecting `/blog/feed` to `/blog`."*
   Expected failure: creates `app/middleware/feed.global.ts`. Falsifiable: any
   file created under `app/`.
2. *"Add a helper used by both `composables/useBlogContent.ts` and
   `server/api/__sitemap__/team.ts`."* Expected failure: places it in `utils/`
   and imports `~/utils/...` from the Nitro handler. Falsifiable: a file under
   `server/` with a runtime value import from `~/utils`, `~/composables` or
   `~/types`.
3. *"Add a `useTimelineContent()` composable for the active locale."* Expected
   failure: `useAsyncData('timeline', …)` with a static string key and no
   `watch`. Falsifiable: the key is a string literal, and/or `watch` is absent.

**Kill criterion.** This is the marginal skill: four of its sections are pointers
to the other three. At review, if the drafted SKILL.md contains more than ~15
lines a competent Nuxt agent would produce unprompted (file-based routing,
`components/` prefixing, `useState` basics, `runtimeConfig` basics), delete the
skill and move the `app/` rule and the Nitro import boundary into `AGENTS.md` as
two bullets.

### 7.3 `nuxt-content-cms`

**Description:** covers the `@nuxt/content` v3 content layer — per-locale
collections in `content.config.ts`, zod schemas as SQL column definitions, the
`ContentRepository` / `nuxtContentAdapter` boundary, how a page collection's
`path` is derived and what that means for the sitemap, the differing app and
Nitro `queryCollection` signatures, Prose overrides, and the minimark body
format. Triggers: adding or editing a collection, a frontmatter field, a markdown
or YAML content file, a content query or a Prose override; content pages missing
from `sitemap.xml`; a frontmatter value reading as `undefined`; a query returning
null or empty; a "no such column" error.

**SKILL.md sections:**

| Section | ~Lines | Content |
|---|---|---|
| The repository boundary | 22 | `queryCollection` from `#imports` is called in exactly one app file: `utils/content/nuxtContentAdapter.ts`. Everything else depends on `ContentRepository` + `~/types/*` via `useContentRepository()` **inside `useAsyncData`** — each collection touched on the client costs a lazy dump download plus SQLite-WASM init. Add-a-content-type checklist: `content.config.ts` → `repository.ts` → `nuxtContentAdapter.ts` → composable → component. |
| The schema is a DDL, not a validator | 22 | Undeclared frontmatter keys are neither rejected nor dropped — they move to the `meta` JSON column, so `item.myField` is `undefined` and `.where('myField', …)` errors with "no such column". `.passthrough()` creates no columns. Worked example: the live `releaseDate` defect. |
| Localized collections | 18 | `<name>_<locale>` with an **underscore** — a dash makes `resolveCollection()` warn and drop the collection, so every query returns null or `[]`. Generate with `defineLocalizedCollections()`; shared frontmatter through `withI18nMeta()`. |
| `path` is derived, not chosen | 24 | For `type: 'page'`, `path` is the file path plus the auto-extracted static leading glob segment. It is unrelated to `slug` frontmatter and to the i18n route: `blog/${locale}/**/*.md` yields `/blog/en/foo`, not `/en/blog/foo`. Fix with `source: { include, prefix }`. Per-file `sitemap.loc` is an escape hatch only if **every** file gets one, because `@nuxtjs/sitemap` filters `sitemap IS NOT NULL`. Use `type: 'data'` for content with no URL. |
| Two call signatures | 12 | App: auto-imported `queryCollection('blog_en')`. Nitro: `import { queryCollection } from '@nuxt/content/server'` and `queryCollection(event, 'blog_en')`. |
| Module order | 7 | `@nuxtjs/seo`, `@nuxtjs/sitemap` and `nuxt-og-image` must precede `@nuxt/content`, or `asSitemapCollection` / `asSchemaOrgCollection` never merge. Pointer to `nuxt-seo` for the full array. |
| Indexes | 10 | `indexes: [{ columns: ['slug'] }]` for every `.where()` / `.order()` column. On D1 an unindexed WHERE bills every row scanned; invisible locally on better-sqlite3. |
| Verify | 10 | Build, then read `dist/__nuxt_content/<collection>/sql_dump.txt` to confirm the columns, the `path` values and the `CREATE INDEX` statements. |

**references/**

| File | Scope | ~Lines |
|---|---|---|
| `body-and-prose.md` | The stored body is minimark, not HTML and not the v2 tree — use `utils/content.ts` `extractPlainText`; `<ContentRenderer :excerpt>`; `rawbody: z.string()` as the only route to the original markdown. Plus how a Prose override resolves: copy the original from `@nuxtjs/mdc`, keep prop parity, identical filename, not `global: true`. | 80 |
| `cloudflare-d1.md` | Deployment contract: `nitro.preset: 'cloudflare_module'`, `compatibilityDate >= 2024-09-19`, `externals.inline: ['@nuxt/content']`, the `DB` binding; `content.database = { type: 'sqlite' }` is force-overridden with only a warning, and a missing binding fails on first query, not at build. | 55 |
| `v2-to-v3-migration.md` | One collapsed `<details><summary>Old patterns (@nuxt/content v2)</summary>` block: `queryContent`→`queryCollection`, `.findOne()`→`.first()`, `fetchContentNavigation`→`queryCollectionNavigation`, `.findSurround`→`queryCollectionItemSurroundings`, `doc._path`→`doc.path`, `useContent()` removed, `<ContentDoc>`→`<ContentRenderer>`, `_dir.yml`→`.navigation.yml`, the `ProseCode`/`ProsePre` rename. | 60 |

**Baseline scenarios:**

1. *"Add an `updatedAt` date to blog posts and show it on the article page."*
   Expected failure: adds the frontmatter and reads `article.updatedAt`, never
   touching `blogSchema`. Falsifiable: the diff modifies `content/**/*.md` and a
   `.vue` file but not `content.config.ts` — the value is permanently
   `undefined`, with no error.
2. *"Add an `events` collection with German and English markdown."* Expected
   failure: calls `queryCollection('events')` directly in the page, and/or names
   collections `events-de`, and/or skips the repository layer. Falsifiable:
   `queryCollection(` outside `utils/content/nuxtContentAdapter.ts` and
   `server/`, or a collection key containing a hyphen or dot.
3. *"The English blog posts are missing from sitemap.xml — fix it."* Expected
   failure: adds per-file `sitemap:` blocks or a new sitemap source, treating the
   symptom rather than the derived `path`. Falsifiable: no change to the
   collection's `source`.

### 7.4 `tailwind-design`

**Description:** covers styling with Tailwind CSS v4 — the `@theme` token
contract in `assets/css/tailwind.css`, which brand utility names actually
compile, the `light-dark()` and `dark:` split, where custom CSS belongs, the
focus-ring convention, and how to verify a class survived the build. Triggers:
adding or changing utility classes; adding a color, gradient, spacing or
animation token; building a dark-mode toggle; styling Prose output or code
blocks; editing `tailwind.css`, `tokens.css` or `tailwind.config.mts`; a utility
class or focus ring appearing to have no effect.

**SKILL.md sections:**

| Section | ~Lines | Content |
|---|---|---|
| The token contract | 22 | `assets/css/tailwind.css` `@theme` is the only source of tokens. `tailwind.config.mts` is inert dead code — no `@config` references it — so never edit it to add a color. Two-column table: **use** `bg-brand-primary`, `text-brand-accent`, `bg-secondary-cyan`, `bg-bg`, `bg-surface`, `text-text`, `text-muted`, `border-border`. **Never** `*-primary`, `*-secondary`, `*-accent`, `*-brand-<number>` — they compile to nothing, and existing usages will reinforce the wrong answer if copied. |
| Arbitrary `var()` classes must resolve | 14 | An unresolvable custom property invalidates the whole declaration, so a `box-shadow`-based ring disappears rather than degrading. Rule: an arbitrary-value class is valid only if the token exists in `@theme`. |
| Dark mode: two mechanisms, one OS signal | 18 | `:root { color-scheme: light dark }` with `light-dark()` neutral tokens, running alongside `dark:` utilities that compile to `prefers-color-scheme` because there is no `@custom-variant dark` and no toggle. Adding a class toggle requires **both** `@custom-variant dark (&:where(.dark, .dark *));` after the `@import` **and** replacing every `light-dark()` token — half the migration leaves surfaces on the OS while text follows the class. |
| Where custom CSS goes | 18 | `assets/css/tokens.css` is imported from a `<style>@import</style>` in `app.vue`, not from `nuxt.config` `css` — separate compilation, no theme context (so `@apply` there needs `@reference`), unlayered so its rules beat utilities. Default for a new shared class: `@utility name { … }` in `tailwind.css`, because only that form accepts variants. |
| Focus rings | 14 | House pattern is `focus-visible:ring-2` plus a resolvable ring token; prefer `focus-visible:outline-hidden` over `outline-none`, which in v4 genuinely removes the forced-colors fallback. The Lighthouse a11y gate makes this enforceable. |
| Verify | 16 | `pnpm build`, then grep the built stylesheet for the escaped full token: `grep -o '\.ring-brand-500' dist/_nuxt/*.css`. Nothing else catches a dead class — ESLint does not check class names and the build succeeds with the no-ops in place. |

**references/**

| File | Scope | ~Lines |
|---|---|---|
| `theme-authoring.md` | Rules for editing `@theme`: top-level only (never nested in `.dark {}`), `@theme inline` when a token's value is itself a `var()`, `@theme static` for tokens consumed only via arbitrary values or JS, `--animate-*` keyframes inside the block, and the rule that a token should exist only if it mints a utility. | 55 |
| `v4-utility-changes.md` | Component-class policy — `@utility` over `@layer components`, and why the zero-`@apply` state is deliberate. Then a collapsed `<details><summary>Old patterns (Tailwind v3)</summary>` block: `flex-shrink-*`→`shrink-*`, `!x`→`x!`, `bg-[--var]`→`bg-(--var)`, opacity utilities→slash modifier, variant stacking direction, scale shifts, `outline outline-2`→`outline-2`, gradient mid-stops persisting across `dark:`. | 70 |
| `prose-and-code-blocks.md` | Styling map for `@nuxt/content` output: the `components/content/Prose*.vue` overrides, the missing `ProseCode` override, and the Shiki dual-theme contract — the config emits per-theme custom properties but nothing consumes them, so code blocks stay light-themed until a `--shiki-dark` rule is written. Pointer to `nuxt-content-cms` for how an override resolves. | 55 |

**Baseline scenarios:**

1. *"Add a 'Beta' badge chip in the brand primary color."* Expected failure:
   emits `bg-primary/10 text-primary ring-primary/20` or invents `bg-brand-500`.
   Falsifiable: any class matching
   `(bg|text|ring|border|from|to)-(primary|secondary|accent)\b` or `brand-\d{2,3}`
   — none exist in the built CSS. Correct: `bg-brand-primary`, `text-brand-accent`,
   `bg-secondary-cyan`.
2. *"Add a light/dark theme toggle to the navigation."* Expected failure: toggles
   a `.dark` class and sets `darkMode: 'class'` in the dead config file.
   Falsifiable: the diff edits `tailwind.config.mts`, and/or `tailwind.css` gains
   no `@custom-variant dark`, and/or the `light-dark()` tokens are untouched.
3. *"The keyboard focus ring on the main nav is invisible — fix it."* Expected
   failure: bumps `ring-2` to `ring-4` or swaps `focus:` for `focus-visible:`,
   leaving the unresolvable ring token in place. Falsifiable: the patch keeps a
   `var(--color-secondary)` reference without defining that token.

## 8. Boundaries

Nine topics sit on skill borders. Each has exactly one owner; the others carry a
one-line pointer and no duplicated prose.

| Topic | Owner | Boundary rule |
|---|---|---|
| Canonical / hreflang / head tag ownership | `nuxt-seo` | `nuxt-structure` says only "the layout owns all head link tags and the single `<main>`; pages add neither — see `nuxt-seo`" |
| `queryCollection` / repository boundary | `nuxt-content-cms` | `nuxt-structure` carries one line: "app code reaches content only through `useContentRepository()`" |
| `useAsyncData` shape | `nuxt-structure` | `nuxt-content-cms` keeps only the consequence — wrap content queries or pay a per-collection dump download — and does not restate the pattern |
| `modules: []` ordering | `nuxt-seo` | `nuxt-content-cms` keeps one line plus the content-specific consequence |
| Sitemap correctness | split by where the fix goes | Fix in `content.config.ts` → `nuxt-content-cms`. Fix in `nuxt.config` or `server/api/__sitemap__/` → `nuxt-seo`. Both state the split in one line |
| Cloudflare Workers / D1 / prerendering | split by consequence | D1 binding and dump restore → `nuxt-content-cms`. `zeroRuntime` and the `nitro.prerender` recipe → `nuxt-seo`. `nuxt-structure` carries no deployment reference |
| CSS entry points / `inlineStyles` | `tailwind-design` | `nuxt-structure` names the two CSS entry points in its layout map only |
| Prose components | split by question | *How does an override resolve?* → `nuxt-content-cms`. *What classes go inside, and why are code blocks light-themed?* → `tailwind-design` |
| OG image templates | `nuxt-seo` | `tailwind-design` excludes `components/OgImage/**` from its scope in one line — those render in a Satori island, not the app CSS pipeline |

pnpm commands, Lighthouse gates, the i18n roster, commit conventions and
PostHog/BlueMap config belong in `AGENTS.md`, not in any skill.

## 9. What not to build

1. **No `nuxt-structure/references/rendering-and-deployment.md`.** Every fact has
   a better home: D1 → `nuxt-content-cms`, `zeroRuntime` → `nuxt-seo`,
   `inlineStyles` → `tailwind-design`. Building it creates a fourth copy of the
   deployment story that will drift.
2. **No full Nuxt 4 upgrade laundry list.** Ship only the six deltas a realistic
   edit here can trip. Drop module-authoring deltas — there is no `modules/`
   directory and no local Nuxt module. Drop every `npx codemod nuxt/4/*`
   invocation; the file-structure codemod creates `app/` and would trigger the
   exact failure `nuxt-structure` exists to prevent.
3. **No separate OG-image island reference.** It merges into
   `nuxt-seo/references/og-images.md`; splitting it would force a
   reference-to-reference link.
4. **No `*-reviewer` agents** in this round.

## 10. Development process

Skills are written test-first, per `superpowers:writing-skills` and Anthropic's
evaluation-driven development guidance. One skill at a time, fully finished
before the next.

Per skill:

1. **RED** — run the three baseline scenarios against a fresh subagent **without**
   the skill. Record the actual output verbatim, including which falsifiable
   marker fired.
2. **GREEN** — write the skill addressing only the observed failures. Content
   with no corresponding baseline failure is a candidate for deletion.
3. **Verify** — re-run the same scenarios with the skill loaded. The marker must
   no longer fire.
4. **REFACTOR** — for each new failure mode observed, add a counter and re-test.

A skill whose baseline shows the agent already behaving correctly does not get
written. That outcome is a valid and useful result, not a failure.

## 11. Out of scope: verified production defects

Research surfaced defects while gathering evidence. They are **not** fixed under
this spec, but they are recorded here because each is the exact failure its skill
warns about, and they should be tracked separately.

| Defect | Evidence | Effect |
|---|---|---|
| `iso:` instead of `language:` in `i18n.locales` | `nuxt.config.ts:83-84`, `:206-207`; `@nuxtjs/i18n/dist/runtime/kit/head.js:33-36` skips locales without `language` | No hreflang alternates, no `x-default`, no `og:locale`, empty `<html lang>` |
| `$production` restates whole arrays | `nuxt.config.ts:205-207`, `:262`, `:288`; `@nuxt/kit/dist/index.mjs:855` concatenates | Production gets `locales = [de, en, de, en]` and duplicated `sameAs` entries. Dev is clean, so it only shows once deployed |
| `ogImage.zeroRuntime` without prerendering | `nuxt.config.ts:323`; no `nitro.prerender` anywhere; both default calls target the bundled `NuxtSeo` template that zeroRuntime strips | No OG image producible in production |
| `releaseDate` missing from `blogSchema` | used in `composables/useBlogContent.ts:12`, typed in `types/blog.ts:46`, absent from `content.config.ts` | Field lands in the `meta` column and reads `undefined` — scheduled posts publish immediately |
| Dead Tailwind classes | 33 occurrences of `(bg\|text\|ring\|border)-(primary\|secondary\|accent)` across `components/`, `pages/`, `layouts/`; tokens are named `brand-primary`, `secondary-cyan` | Classes compile to nothing; the build succeeds |
| Undefined `--color-secondary` | 24 references; never defined in `assets/css/` | The referenced focus rings do not render |
| Inert `tailwind.config.mts` | No `@config` in `assets/css/` or `nuxt.config.ts` | Edits to it have no effect |

## 12. Deliverables

- Four skill directories under `.claude/skills/`, each written test-first.
- A rewritten "Reusable Agents & Skills" section in `AGENTS.md` replacing the
  stale list of ~40 removed skills.
- Recorded baseline results per skill, so a future editor can tell which content
  earned its place.
