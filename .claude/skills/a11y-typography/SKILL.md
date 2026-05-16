---
name: a11y-typography
description: >-
  Ensure readable, accessible typography on this Nuxt 4 site (font size,
  line length/height, spacing, zoom/reflow). Use when changing text
  styles or Tailwind type tokens. Mirrors web.dev Learn Accessibility
  "Typography".
---

# Accessible Typography

Single topic: text is readable for everyone (contrast itself lives in
`a11y-contrast-motion`).

- Body text uses relative units and is comfortably sized (no fixed tiny
  `px`); respects user font-size settings.
- Line length, `line-height`, and paragraph spacing aid readability;
  don't justify body text.
- Layout reflows without loss of content at 200% zoom / 320px width (no
  horizontal scroll for text).
- Don't convey meaning by typographic styling alone.

Verify: zoom to 200% and narrow to 320px on changed views — content
reflows, nothing clipped; `pnpm lint` clean.
