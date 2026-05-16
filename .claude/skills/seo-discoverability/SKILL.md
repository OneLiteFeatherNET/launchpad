---
name: seo-discoverability
description: >-
  Audit changes against web.dev "Discoverable" guidance for this Nuxt 4
  site — crawlable content, titles/meta descriptions, canonical, i18n
  hreflang, structured data (schema.org), sitemap/robots. Use when adding
  or changing pages, routes, content, metadata, or `nuxt.config.ts` SEO.
---

# SEO & Discoverability Review (web.dev "Discoverable")

The Lighthouse SEO score is **1.0 — the bar is to keep it there** (CI
gate: `categories:seo` error, minScore 0.95, plus per-audit gates for
`canonical`, `hreflang`, `meta-description`, `document-title`,
`image-alt`, `link-text`, `robots-txt`). Stack: `@nuxtjs/seo`,
`@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`, `nuxt-og-image`,
`@nuxtjs/i18n` (prefix strategy, `de`/`en`).

Apply to changed `pages/`, `content/`, components rendering head/meta,
and `nuxt.config.ts`.

## Per-page essentials
- Unique, descriptive `<title>` and meta description per page and per
  locale — via the project's SEO composable (e.g. `usePageSeo`), not
  hard-coded duplicates.
- Exactly one canonical; correct `hreflang` pairs for `de`/`en` (the
  i18n `baseUrl` must stay the production domain).
- One `<h1>`; crawlable text content (no critical content client-only).
- Meaningful `alt` on every image; descriptive link text (no "click
  here") — these are CI-gated.

## Routing & indexability
- New legal/utility routes that must not be indexed go in `routeRules`
  with `robots: 'noindex, follow'` (existing pattern for imprint/privacy).
- New routes appear in the sitemap with correct lastmod/hreflang; don't
  block `/_nuxt/` in robots (breaks rendering for crawlers).

## Structured data & social
- Keep `nuxt-schema-org` org/identity accurate; add appropriate
  page-level schema (Article/BreadcrumbList) for new content types.
- OG/Twitter tags resolve (built OG images via `nuxt-og-image`
  `zeroRuntime`); verify the generated image for new page types.

## Verification
- `pnpm seo:lighthouse` — SEO ≥ 0.95 and all per-audit SEO gates green.
- `pnpm run seo:check` and `nuxt-link-checker` clean (no broken links).
