# Repository Guidelines

## Project Structure & Module Organization
- `layers/<domain>/`: one Nuxt layer per domain — `base`, `content-core`,
  `blog`, `community-poi`, `team`, `home`, `sponsoring`, `opencollective`,
  `navigation`, `footer`. Each holds its own `components/`, `composables/`,
  `utils/`, `types.ts` and an `index.ts` that is its public surface.
- `pages/`, `layouts/`, `app.vue`: the orchestrator. These know every layer and
  are the only place allowed to combine two domains.
- `content/`, `content.config.ts`: markdown and data for `@nuxt/content`,
  deliberately kept at the root — collections are generated across locales.
- `server/`: Nitro routes not owned by a domain.
- `tests/`: mirrors the tree; `tests/architecture/` holds the rules below.

### The dependency rule
Domains do not import from each other. Both `base` and `content-core` are
available to everyone; `content-core` may use `base`; `base` uses nothing. Only
`content-core` names `@nuxt/content`.

Nuxt enforces none of this — layers auto-import each other freely — so
`tests/architecture/module-boundaries.spec.ts` is the enforcement. A red
assertion there means the architecture broke, not that the test needs relaxing.

Layer names produce no auto-import prefix: `layers/team/components/Card.vue` is
`<Card>`, so two layers cannot define the same component name.
`tests/architecture/layer-name-collisions.spec.ts` catches that, because Nuxt
resolves such a collision silently by priority.

### A layer's `index.ts` may only export values it can afford in the client bundle
A value export from `layers/content-core/index.ts` that transitively imports
`utils/content/collections.ts` breaks the client build: Rollup's `impound`
plugin refuses it, because `collections.ts` imports `defineCollection` from
`@nuxt/content`. `export type` is always safe — type-only exports are erased —
but a real value export pulls in everything its module graph touches. This is
why `locales` is re-exported from `utils/content/locales.ts` rather than
`utils/content/collections.ts`, even though both define it (see the comment in
`layers/content-core/index.ts`). Nothing structurally prevents this from
happening again to a different export; verify with `nuxi build` whenever a
layer's `index.ts` gains a new value export.

### Nitro does not resolve `#layers/<name>` value imports
`#layers/<name>` works for `import type` inside `server/`, but a value import
through it fails to build — confirmed by building `server/api/__sitemap__/team.ts`
against `#layers/content-core`. That is why the sitemap route for team members
stays at the repository root, importing `#layers/team` as a type only and
`~/layers/content-core/utils/content/locales` directly for the runtime value,
instead of living inside the `team` layer. It is a registered, named exception
in `tests/architecture/module-boundaries.spec.ts` — not a pattern to repeat
without checking a real build first.

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
- **Never create a file under `app/`.** `srcDir` is auto-detected; this repo
  keeps its sources at the root (no `app/` directory exists, no `srcDir`
  override in `nuxt.config.ts`). One non-exempt file under `app/` flips
  `srcDir` and silently unmounts every route and auto-import with no error.
  Only `spa-loading-template.html` and `router.options.*` are exempt. Do not
  run `npx codemod nuxt/4/file-structure`.
- **Nitro cannot reliably reach app code.** Every existing `server/**` import
  from `~/...` in this repo is `import type` only — nothing imports a runtime
  value from `~/utils`, `~/composables` or `~/types` across the boundary.
  Code needed on both sides belongs in `shared/utils` or `shared/types`, and
  those two directories only: they are the ones Nuxt auto-imports on **both**
  sides, and `#shared` is a real alias to them.
  - **They are scanned top level only.** Nuxt globs them as `*.{ts,js,…}`,
    never `**/*`, so `shared/utils/blogRelease.ts` is auto-imported and
    `shared/utils/content/blogRelease.ts` is not — on either side, with no
    error. This repo's own convention nests (`utils/content/*`); do not carry
    that habit into `shared/`.
  - Nuxt's import protection for `shared/` blocks `#app`, `#build`, `#server`
    and `server/{api,routes,middleware,plugins}/` — not `vue` or `h3`. Keeping
    Vue and H3 out is still the right instinct for genuinely shared code, but
    nothing enforces it; don't expect a build error.
  - Do not add a cross-boundary runtime import via `~/utils/...` re-exports as
    a shortcut.

## Knowledge Skills (`.claude/skills/`)

These ship with the repo so every CLI, web and CI session gets the same
standards. Each skill is a short `SKILL.md` plus `references/` files loaded
only when needed. They carry the framework behaviour that is easy to get
wrong here — not general Nuxt or Tailwind documentation.

- **`nuxt-seo`** — canonical and hreflang ownership, i18n locale objects,
  module version floors, site URL resolution, Schema.org, robots, sitemap
  sources, OG images. Read it before touching `nuxt.config.ts`'s `i18n`,
  `site`, `sitemap`, `robots`, `schemaOrg` or `ogImage` blocks, or any SEO
  composable.
- **`nuxt-content-cms`** — collections, zod schemas as SQL column
  definitions, the `ContentRepository` boundary, derived `path` values,
  Prose overrides. Read it before editing `content.config.ts`, a content
  file, or a content query.
- **`tailwind-design`** — the `@theme` token contract, which utility names
  compile, the two dark-mode mechanisms, where custom CSS belongs. Read it
  before adding utility classes or design tokens.

Preserved from the previous skill set: source maps are never published to
production, and the Lighthouse `valid-source-maps` audit is an accepted
trade-off. Accessibility is checked in CI by the Lighthouse accessibility gate
(error, minScore 0.9) and by `eslint-plugin-vuejs-accessibility` via the quality
ratchet — note that the ratchet only blocks *new* violations, it does not
enforce a clean tree (see below). The `best-practices` gate is `warn`
(minScore 0.9) and the suite runs the desktop preset only — mobile performance
is the known weak spot; check it manually.

## Quality gate

`ci.yml` runs two jobs on every pull request: a production build (hard gate) and
a quality ratchet. The ratchet (`scripts/quality-gate.mjs`) compares ESLint and
TypeScript error counts against `quality-baseline.json` and fails only when a
count **rises**. The repository carries a backlog that accumulated while nothing
measured it, so blocking on the absolute number would stall every pull request.

- `pnpm quality` — check against the baseline
- `pnpm quality:update` — lower the baseline after fixing something; commit the result
- `pnpm typecheck` — the raw `vue-tsc` run

Never raise a baseline number to make a change pass. Fix the errors, or explain
in the pull request why the rise is unavoidable.

When adding a skill, place it under `.claude/skills/` and list it here.
