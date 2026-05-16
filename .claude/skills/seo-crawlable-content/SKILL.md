---
name: seo-crawlable-content
description: >-
  Keep primary content crawlable on this Nuxt 4 site. Use when adding
  pages/sections or content rendered conditionally on the client.
---

# Crawlable Content

Single topic: main content is in the server-rendered HTML (CI-gated:
`image-alt`, `link-text`).

- Primary content is server-rendered, not behind `<ClientOnly>`/client
  branching.
- Exactly one `<h1>`; meaningful `alt` on images; descriptive link text
  (no "click here").

Verify: `pnpm seo:lighthouse` — `image-alt`/`link-text` green; view
source shows the content.
