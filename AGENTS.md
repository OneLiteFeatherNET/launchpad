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
- **`.claude/skills/component-scaffold`** — MUST be followed when adding any
  new feature/section/page (types → composables → sections → page).
- **`.claude/skills/a11y-review`** — MUST be run on every changed
  `components/`, `layouts/`, or `pages/` file before finishing UI work.
- **`.claude/agents/accessibility-reviewer`** — delegate an independent
  accessibility pass to this subagent before opening a PR with visual changes.
- **`.claude/skills/lighthouse-perf`** — MUST be applied when a change can
  affect load/runtime cost (scripts, modules, images, hydration, layout).
  Note: CI only runs the **desktop** Lighthouse preset; mobile is the known
  weak spot (TBT/CLS/TTI) and must be checked manually.
- **`.claude/skills/lighthouse-best-practices`** — MUST be applied when
  touching third-party scripts, analytics, cookies, or SSR/hydration
  (console errors, third-party cookies, bf-cache, source maps).
- **`.claude/agents/lighthouse-performance-reviewer`** — delegate an
  independent performance + best-practices pass to this subagent before
  opening a PR that touches scripts, analytics, images, or SSR/hydration.
- **`.claude/agents/google-web-guidelines-reviewer`** — delegate an
  independent review against Google's official web guidelines (Core Web
  Vitals LCP/INP/CLS, Lighthouse Best Practices, web.dev) before such PRs.
- **web.dev pillar skills + reviewers** (apply the skill when the change
  touches the area; delegate the matching reviewer before the PR):
  - **`.claude/skills/web-security`** / **`.claude/agents/web-security-reviewer`**
    — web.dev "Safe": HTTPS, CSP/security headers, safe embeds, no
    mixed/insecure content, dependency safety.
  - **`.claude/skills/seo-discoverability`** / **`.claude/agents/seo-discoverability-reviewer`**
    — web.dev "Discoverable": crawlability, metadata, canonical/hreflang,
    structured data, sitemap/robots (keep SEO ≥ 0.95).
  - **`.claude/skills/privacy-consent`** / **`.claude/agents/privacy-consent-reviewer`**
    — consent-gated analytics, third-party data minimisation, GDPR
    alignment for PostHog/gtag.
  - **`.claude/skills/network-caching`** / **`.claude/agents/network-caching-reviewer`**
    — web.dev "Fast" loading: cache lifetimes, preconnect/preload/priority
    hints, compression, critical request chain.
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
