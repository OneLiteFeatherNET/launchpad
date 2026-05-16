---
name: a11y-names-labels-i18n
description: >-
  Ensure accessible names, image alt text, and language are correct and
  i18n-sourced on this Nuxt 4 site. Use when adding controls, images, or
  strings.
---

# Names, Labels & Language

Single topic: accessible names + alt + language.

- Icon-only controls have an `aria-label` from i18n (`accessibility.*`),
  never hard-coded.
- All `<img>`/`<NuxtImg>` have meaningful `alt` (`alt=""` only if purely
  decorative).
- Document/page language correct per locale; add new strings to both
  `i18n/locales/en.json` and `de.json`.

Verify: `pnpm lint` clean; spot-check accessible names per locale.
