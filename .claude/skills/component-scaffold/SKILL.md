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

## Constraints
- Do not add new dependencies or config presets without clear justification.
- Respect the existing directory structure; extend, don't rearrange.
- Every new string goes into both `i18n/locales/en.json` and `de.json`.
- Before finishing, run the `a11y-review` skill on the new components and
  ensure `pnpm lint` and `pnpm build` pass.
