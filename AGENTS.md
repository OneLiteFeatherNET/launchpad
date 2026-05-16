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
- Accessibility tooling is enforced in CI: `eslint-plugin-vuejs-accessibility`
  via `pnpm lint`, and the Lighthouse `accessibility` gate
  (error, minScore 0.9) via `pnpm seo:lighthouse`. Keep both green.
- When adding new skills/agents, place them under `.claude/` and document
  them here so they remain the single source of truth.
