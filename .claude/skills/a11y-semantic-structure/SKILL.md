---
name: a11y-semantic-structure
description: >-
  Enforce semantic structure and landmarks in changed Vue files on this
  Nuxt 4 site. Use when adding/altering markup in components/layouts/pages.
---

# Semantic Structure & Landmarks

Single topic: correct semantics/landmarks/headings.

- One `<h1>` per page; heading levels increase by one (no skips).
- Semantic elements (`<button>`, `<nav>`, `<main>`, `<header>`,
  `<footer>`) instead of click-handler `div`/`span`.
- Exactly one `<main id="main-content">`; landmark roles not duplicated
  with identical `aria-label`s.

Verify: `pnpm lint` (vuejs-accessibility) clean; accessibility-tree
check in DevTools.
