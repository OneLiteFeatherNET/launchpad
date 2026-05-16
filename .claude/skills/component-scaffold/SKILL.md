---
name: component-scaffold
description: >-
  Scaffold a new feature in this Nuxt repo following the house pattern:
  domain types first, then a composable, then section/UI components, then wire
  the page. Use when adding any new feature, section, or page.
---

# Feature Scaffold (types -> composables -> sections -> page)

Follow this order strictly; it is the repo convention from `AGENTS.md`.

1. **Domain types** — add to `types/` (e.g. `types/<feature>.ts`). Model the
   data the feature renders before touching UI.
2. **Composable** — add `composables/use<Feature>.ts` that loads/derives the
   data and exposes a typed, reactive API. Keep data logic out of components.
3. **Section / UI components** — build under
   `components/features/<feature>/`, reusing `components/base/*` primitives.
   Use `<script setup lang="ts">`, 2-space indent, `PascalCase.vue`.
4. **Page assembly** — the route file in `pages/` only composes sections and
   calls the composable; it contains no business logic.

## Build the web.dev quality pillars in from the start
Don't retrofit quality — apply the relevant **atomic** skill while
scaffolding, not after. Only the ones the feature touches:
- **Accessible**: `a11y-semantic-structure`, `a11y-keyboard-focus`,
  `a11y-names-labels-i18n` (+ `a11y-forms`, `a11y-aria-dynamic`,
  `a11y-contrast-motion` as relevant).
- **Fast**: `perf-defer-third-party-scripts`, `perf-lcp-element`,
  `perf-cls-layout-stability`, `perf-reduce-unused-js`;
  `net-resource-hints`/`net-font-loading` if adding origins/fonts.
- **Discoverable**: `seo-page-metadata`, `seo-crawlable-content`
  (+ `seo-canonical-hreflang`, `seo-indexability` for new routes).
- **Safe**: `sec-no-mixed-content`, `sec-safe-links-embeds`
  (+ `sec-content-security-policy` if adding origins).
- **Privacy**: `privacy-consent-gating` for any tracking.

## Constraints
- Do not add new dependencies or config presets without clear justification.
- Respect the existing directory structure; extend, don't rearrange.
- Every new string goes into both `i18n/locales/en.json` and `de.json`.
- Before finishing, apply the atomic a11y skills to the new components,
  plus the atomic skill(s) matching what the feature touches (scripts →
  `perf-defer-third-party-scripts` + `privacy-consent-gating`, new
  route/content → `seo-*`, external resources → `sec-*`), and ensure
  `pnpm lint` and `pnpm build` pass.
