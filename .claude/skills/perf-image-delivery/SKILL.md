---
name: perf-image-delivery
description: >-
  Serve images efficiently on this Nuxt 4 site (formats, responsive
  sizes, dimensions, lazy-loading). Use when adding/changing any image.
  Mirrors web.dev Learn Performance "Images".
---

# Image Delivery

Single topic: minimise image bytes without visible quality loss (report:
`image-delivery-insight`, ~18-20 KiB).

- Use `<NuxtImg>`/`<NuxtPicture>` with the Cloudflare provider; serve
  `avif`/`webp` (config default, quality 75) — no raw `<img>` to large
  source files.
- Always set `width`/`height` (or aspect-ratio) so images don't shift
  layout (ties to `perf-cls-layout-stability`).
- Responsive `sizes`/`srcset` matched to the layout; never ship a
  desktop-sized image to mobile.
- Below-the-fold images `loading="lazy"`; the LCP image is **not** lazy
  (see `perf-lcp-element`).

Verify: `pnpm build`; mobile Lighthouse — `image-delivery-insight` /
`uses-responsive-images` not regressed.
