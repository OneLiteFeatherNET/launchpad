---
name: net-font-loading
description: >-
  Load web fonts without blocking render or causing layout shift on this
  Nuxt 4 site. Use when adding/changing fonts or `assets/css`.
---

# Font Loading

Single topic: fonts don't block paint or shift layout.

- `font-display: swap`; `preload` only the one critical face.
- Prefer self-hosted woff2 with `size-adjust`/metric overrides to avoid
  the swap reflow (contributes to CLS — see `perf-cls-layout-stability`).
- No render-blocking font CSS from third-party origins.

Verify: `pnpm build`; mobile Lighthouse — no font-induced CLS.
