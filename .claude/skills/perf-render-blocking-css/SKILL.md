---
name: perf-render-blocking-css
description: >-
  Keep CSS from blocking first paint on this Nuxt 4 site. Use when adding
  global CSS, changing `nuxt.config.ts` `css[]`, or large stylesheets.
---

# Render-Blocking CSS

Single topic: minimise render-blocking stylesheets (report:
`entry.*.css` is render-blocking).

- Keep critical CSS inlined; defer non-critical CSS.
- Do not add global imports to `nuxt.config.ts` `css[]` without
  justification (FontAwesome core + tailwind are the deliberate set).
- Prefer scoped/component CSS over new global stylesheets.

Verify: `pnpm build`; confirm `render-blocking-insight` did not regress.
