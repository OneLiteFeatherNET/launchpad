---
name: perf-minify-js
description: >-
  Ensure all first-party JS is minified in production builds on this
  Nuxt 4 site. Use when changing build/Vite/Nitro output config.
---

# Minify JavaScript

Single topic: no un-minified first-party JS in production (report:
`unminified-javascript`, ~11 KiB).

- Do not disable minification in Vite/Nitro/Nuxt build config.
- Inline/raw scripts added to the app must also be minified or removed.

Verify: `pnpm build`; confirm `unminified-javascript` audit passes.
