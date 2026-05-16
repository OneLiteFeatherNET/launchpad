# Repository Guidelines

## Project Structure & Module Organization
- `pages/`: Route-driven Vue pages (e.g. `index.vue`, `blog/[...slug].vue`).
- `components/`: Reusable UI, grouped by domain (e.g. `components/blog`, `components/ui`, `components/sections`).
- `layouts/`: Shared page layouts and chrome.
- `content/`: Markdown/content files used by `@nuxt/content`.
- `server/`: Nitro server routes and backend utilities.
- `composables/` & `utils/`: Shared logic and helpers in TypeScript (e.g. `useHomeContent`, `useBlogOverview`, `useTeamProfile`).
- `assets/` & `public/`: Styles (Tailwind) and static assets.

## Build, Test, and Development Commands
- Install dependencies: `pnpm install`
- Local dev server: `pnpm dev`
- Production build: `pnpm build`
- Static generation: `pnpm generate`
- Preview production build: `pnpm preview`
- Lint on demand (no script): `pnpm exec eslint .`

## Coding Style & Naming Conventions
- Use Vue 3 Composition API with `<script setup lang="ts">` in SFCs.
- Prefer TypeScript in `composables/`, `utils/`, and server code.
- Components are `PascalCase.vue`; pages follow route-oriented names (e.g. `imprint.vue`).
- Use 2-space indentation and keep templates focused; reuse shared components where possible.
- Let ESLint (via `eslint.config.mjs` and Nuxt defaults) guide formatting and imports.

## Testing Guidelines
- No formal automated test suite is configured yet.
- When adding tests, prefer Vitest for unit/component tests with filenames like `*.spec.ts`.
- Co-locate small tests with source files or under a `tests/` directory.
- Add at least smoke tests for new features and critical utilities.

## Commit & Pull Request Guidelines
- Follow the existing style: short, imperative messages (e.g. `chore: refine OL styles`, `feat: add team page`).
- Group related changes into single commits; avoid mixing refactors and features.
- PRs should include: a concise summary, rationale, screenshots for UI changes, and links to relevant issues.
- Ensure `pnpm build` (and any tests you add) pass locally before opening a PR.

## Agent-Specific Instructions
- Prefer minimal, focused diffs aligned with existing Nuxt patterns.
- For neue Features zuerst Domain-Typen unter `types/` und Composables unter `composables/` anlegen, dann Sections/UI-Komponenten bauen und die Seite nur noch daraus zusammensetzen.
- Do not introduce new dependencies or configuration presets without clear justification.
- Respect the existing directory structure; extend rather than rearrange where possible.

## Reusable Agents & Skills (`.claude/`)
These are checked in so every CLI/web session gets the same standards. Treat
them as rules, not suggestions:
**Atomic principle:** every skill addresses exactly one topic and has a
matching single-topic reviewer agent named `<skill>-reviewer`. Apply the
skill while making the change; delegate the matching reviewer before the
PR. Use only the skills/agents the change actually touches.

- **`.claude/skills/component-scaffold`** — MUST be followed when adding any
  new feature/section/page (types → composables → sections → page); it
  lists which atomic skills to bake in.
- **Accessibility** (run the relevant ones on every changed
  `components/`/`layouts/`/`pages/` file): `a11y-semantic-structure`,
  `a11y-keyboard-focus`, `a11y-aria-dynamic`, `a11y-names-labels-i18n`,
  `a11y-forms`, `a11y-contrast-motion`, `a11y-typography`.
- **Performance**: `perf-defer-third-party-scripts`,
  `perf-reduce-unused-js`, `perf-no-legacy-js`, `perf-minify-js`,
  `perf-render-blocking-css`, `perf-lcp-element`,
  `perf-cls-layout-stability`, `perf-image-delivery`,
  `perf-main-thread-work` (INP/TBT). CI runs the **desktop** preset
  only; mobile (TBT/CLS/TTI) is the known weak spot — check it manually.
- **Best Practices**: `bp-clean-console`, `bp-no-hydration-mismatch`,
  `bp-bfcache`, `bp-no-prod-source-maps`.
- **Network/Loading**: `net-cache-lifetimes`, `net-resource-hints`,
  `net-critical-request-chain`, `net-font-loading`,
  `net-text-compression`.
- **Security ("Safe")**: `sec-no-mixed-content`, `sec-response-headers`,
  `sec-content-security-policy`, `sec-safe-links-embeds`,
  `sec-dependency-safety`.
- **SEO ("Discoverable")**: `seo-page-metadata`,
  `seo-canonical-hreflang`, `seo-crawlable-content`, `seo-indexability`,
  `seo-structured-data` (keep SEO ≥ 0.95).
- **Privacy**: `privacy-consent-gating`, `privacy-data-minimisation`,
  `privacy-transparency`.
- Each of the above has a `<name>-reviewer` agent under
  `.claude/agents/` for an independent single-topic pass before the PR.
- **Source maps are never published to production.** The Lighthouse
  `valid-source-maps` audit is an accepted trade-off; if symbolication is
  needed, generate hidden maps in CI and upload them privately — never
  deploy public `.map` files or a public `sourceMappingURL`.
- Accessibility tooling is enforced in CI: `eslint-plugin-vuejs-accessibility`
  via `pnpm lint`, and the Lighthouse `accessibility` gate
  (error, minScore 0.9) via `pnpm seo:lighthouse`. Keep both green.
- The Lighthouse `best-practices` gate is `warn` (minScore 0.9) and the
  suite runs the desktop preset only — keep best-practices ≥ 0.9 and do
  not regress mobile performance.
- When adding new skills/agents, place them under `.claude/` and document
  them here so they remain the single source of truth.
