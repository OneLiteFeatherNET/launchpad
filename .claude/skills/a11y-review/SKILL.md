---
name: a11y-review
description: >-
  Audit Vue/Nuxt components and pages in this repo for accessibility (WCAG 2.1
  AA) and UX-flow issues. Use whenever adding or changing UI, before opening a
  PR with visual changes, or when the user asks for an accessibility check.
---

# Accessibility & UX-Flow Review

Apply this checklist to every changed `.vue` file under `components/`,
`layouts/`, and `pages/`. Report findings as a short list grouped by
severity (blocker / should-fix / nice-to-have) with `file:line` refs.

## Structure & semantics
- One `<h1>` per page; headings increase by one level (no skipped levels).
- Use semantic elements (`<button>`, `<nav>`, `<main>`, `<header>`,
  `<footer>`) instead of `div`/`span` with click handlers.
- Exactly one `<main id="main-content">`; landmark roles are not duplicated
  with identical `aria-label`s.
- Interactive `<div>`/`<span>` is forbidden — use a real `<button>`/`<a>`.

## Keyboard & focus
- Every interactive element is reachable and operable by keyboard.
- Visible focus style (`focus-visible:ring-*`) on all focusable elements.
- Disclosure/menu toggles expose `aria-expanded` and `aria-controls`.
- Overlays/dialogs trap focus, restore focus on close, close on `Escape`.
- The skip link in `layouts/default.vue` still targets `#main-content`.

## Names, labels, i18n
- Icon-only controls have an `aria-label` sourced from i18n
  (`accessibility.*`), never a hard-coded string.
- All `<img>`/`<NuxtImg>` have meaningful `alt` (empty `alt=""` only for
  purely decorative images).
- Form fields have associated `<label>`s.
- Add new strings to both `i18n/locales/en.json` and `de.json`.

## Visual & motion
- Text/background contrast meets WCAG AA (4.5:1, or 3:1 for large text);
  verify against Tailwind tokens in `assets/css/tokens.css`.
- Animations/transitions respect `prefers-reduced-motion` (covered globally
  in `tokens.css` — do not reintroduce unconditional long transitions).
- Tap targets are at least 24x24 px.

## Verification
- Run `pnpm lint` (eslint-plugin-vuejs-accessibility is wired in).
- For page-level changes, run `pnpm seo:lighthouse` and keep the
  `categories:accessibility` gate (error, minScore 0.9) green.
