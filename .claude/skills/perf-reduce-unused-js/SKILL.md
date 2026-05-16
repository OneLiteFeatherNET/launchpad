---
name: perf-reduce-unused-js
description: >-
  Cut unused first-party JavaScript on this Nuxt 4 site via code-splitting
  and tree-shaking. Use when adding components/pages or pulling in
  libraries that increase the bundle.
---

# Reduce Unused JavaScript

Single topic: ship less first-party JS (report: largest `_nuxt/*.js`
chunks ~75 KiB unused).

- Use dynamic `import()` / `defineAsyncComponent` for below-the-fold and
  interaction-only UI; rely on route-level code splitting.
- Import only the FontAwesome icons used (SVG core tree-shakes) — never
  whole icon packs.
- Don't pull a heavy library for a small need; prefer a local helper.

Verify: `pnpm build`; check the `unused-javascript` audit did not grow.
