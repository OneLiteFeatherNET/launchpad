---
name: a11y-review
description: >-
  Audit Vue/Nuxt components and pages in this repo for accessibility (WCAG 2.1
  AA) and UX-flow issues. Use whenever adding or changing UI, before opening a
  PR with visual changes, or when the user asks for an accessibility check.
---

# Accessibility & UX-Flow Review (web.dev "Accessible")

This is the **Accessibility pillar** of the web.dev-aligned skill suite
(siblings: `lighthouse-perf`, `web-security`, `seo-discoverability`,
`privacy-consent`, `network-caching`). Section structure follows the
web.dev "Learn Accessibility" topics; the bar is WCAG 2.1 AA.

Apply this checklist to every changed `.vue` file under `components/`,
`layouts/`, and `pages/`. Report findings as a short list grouped by
severity (blocker / should-fix / nice-to-have) with `file:line` refs.

## Content structure & semantics
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

## ARIA & dynamic content
- Prefer native semantics over ARIA; only add ARIA when no native
  element fits ("no ARIA is better than bad ARIA").
- Visible-text controls: the accessible name must contain the visible
  label (the report flagged `label-content-name-mismatch` — an
  `aria-label` that doesn't match/contain the visible text).
- Dynamic updates (copy-to-clipboard feedback, async content) use an
  appropriate `aria-live` region; state toggles expose `aria-pressed`/
  `aria-expanded` and keep it in sync.

## Names, labels, language & forms
- Icon-only controls have an `aria-label` sourced from i18n
  (`accessibility.*`), never a hard-coded string.
- All `<img>`/`<NuxtImg>` have meaningful `alt` (empty `alt=""` only for
  purely decorative images).
- Every form field has a programmatically associated `<label>`; group
  related controls with `<fieldset>`/`<legend>`; errors are linked via
  `aria-describedby` and announced, not colour-only.
- Page/document language is correct per locale; add new strings to both
  `i18n/locales/en.json` and `de.json`.

## Visual & motion
- Text/background contrast meets WCAG AA (4.5:1, or 3:1 for large text);
  verify against Tailwind tokens in `assets/css/tokens.css`.
- Animations/transitions respect `prefers-reduced-motion` (covered globally
  in `tokens.css` — do not reintroduce unconditional long transitions).
- Tap targets are at least 24x24 px.

## Verification (automated + manual)
- Run `pnpm lint` (eslint-plugin-vuejs-accessibility is wired in).
- For page-level changes, run `pnpm seo:lighthouse` and keep the
  `categories:accessibility` gate (error, minScore 0.9) green.
- web.dev review method: also do a manual pass — keyboard-only walk of
  the changed flow and an accessibility-tree/contrast check in DevTools;
  automated tools catch only a subset.
