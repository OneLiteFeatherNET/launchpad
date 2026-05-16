---
name: seo-page-metadata
description: >-
  Ensure unique title and meta description per page and locale on this
  Nuxt 4 site. Use when adding/changing any page or its head/meta.
---

# Page Metadata

Single topic: title + meta description (CI-gated: `document-title`,
`meta-description`).

- Unique, descriptive `<title>` and meta description per page **and** per
  locale, via the project SEO composable (e.g. `usePageSeo`) — no
  hard-coded duplicates.
- OG/Twitter title/description resolve from the same source.

Verify: `pnpm seo:lighthouse` — `document-title`/`meta-description`
gates green; SEO ≥ 0.95.
