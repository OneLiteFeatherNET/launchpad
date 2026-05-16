---
name: perf-cls-layout-stability
description: >-
  Prevent cumulative layout shift on this Nuxt 4 site. Use when adding
  images, embeds, async content, fonts, or anything inserted after load.
---

# CLS / Layout Stability

Single topic: no unexpected layout shift (report: mobile CLS 0.28,
culprit is the `<footer>` in `components/features/footer/Footer.vue`).

- Reserve space for async/late content: fixed dimensions or `min-h-*` on
  images, embeds, and blocks whose content arrives after hydration.
- Never insert content above existing content after load.
- Web fonts must not reflow (handled in `net-font-loading`).

Verify: `pnpm build`; mobile Lighthouse — report before/after CLS.
