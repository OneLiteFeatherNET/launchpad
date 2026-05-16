---
name: seo-indexability
description: >-
  Control indexing and sitemap inclusion on this Nuxt 4 site
  (@nuxtjs/robots, @nuxtjs/sitemap). Use when adding routes or changing
  robots/sitemap/routeRules.
---

# Indexability

Single topic: correct robots/sitemap per route (CI-gated: `robots-txt`).

- Legal/utility routes that must not be indexed: `routeRules` with
  `robots: 'noindex, follow'` (existing imprint/privacy pattern).
- New public routes appear in the sitemap with correct lastmod/hreflang.
- Never disallow `/_nuxt/` (breaks crawler rendering).

Verify: `pnpm seo:lighthouse` `robots-txt` green; `pnpm run seo:check`
and `nuxt-link-checker` clean.
