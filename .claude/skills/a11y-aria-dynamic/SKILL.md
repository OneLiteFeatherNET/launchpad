---
name: a11y-aria-dynamic
description: >-
  Use ARIA correctly for dynamic content on this Nuxt 4 site. Use when
  adding live updates, toggles, or non-native interactive patterns.
---

# ARIA & Dynamic Content

Single topic: minimal, correct ARIA.

- Prefer native semantics; add ARIA only when no native element fits
  ("no ARIA is better than bad ARIA").
- The accessible name must contain the visible label (report:
  `label-content-name-mismatch`).
- Dynamic updates use an appropriate `aria-live`; toggles expose
  `aria-pressed`/`aria-expanded` kept in sync.

Verify: screen-reader/accessibility-tree check of the changed control;
`pnpm lint` clean.
