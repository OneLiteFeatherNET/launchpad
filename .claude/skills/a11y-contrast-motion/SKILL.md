---
name: a11y-contrast-motion
description: >-
  Ensure sufficient colour contrast, reduced-motion support, and
  adequate tap targets on this Nuxt 4 site. Use when changing colours,
  Tailwind tokens, animations, or control sizing.
---

# Contrast & Motion

Single topic: visual accessibility (report: `color-contrast` fail on
`text-neutral-500` on surface).

- Text/background contrast meets WCAG AA (4.5:1; 3:1 large text);
  verify against tokens in `assets/css/tokens.css`.
- Animations/transitions respect `prefers-reduced-motion` (handled
  globally in `tokens.css` — don't reintroduce unconditional long
  transitions).
- Tap targets ≥ 24×24 px.

Verify: `pnpm seo:lighthouse` `color-contrast` gate not regressed;
DevTools contrast check on changed text.
