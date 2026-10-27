# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` (imported above) is the authority on architecture, layer rules and
conventions. This file adds what it lacks. Where the two disagree, this file
reflects the current tree.

## Commands

```bash
pnpm dev                                   # dev server, http://localhost:3000 (/ redirects to /en)
pnpm build                                 # runs scripts/check-image-assets.mjs, then nuxi build (Cloudflare preset)
pnpm preview                               # nuxt preview of the production build; restart after a rebuild
pnpm test                                  # vitest run, whole suite
pnpm exec vitest run tests/architecture    # one directory
pnpm exec vitest run tests/design-system/contrast.spec.ts -t "contrast"   # one file / one test name
pnpm typecheck                             # vue-tsc
pnpm quality                               # ESLint + TS counts vs quality-baseline.json (must not rise)
node scripts/md3-tokens.mjs [--check]      # regenerate / verify the generated MD3 colour roles
```

CI (`.github/workflows/ci.yml`) runs four jobs on every PR: `pnpm build`,
`pnpm quality`, `pnpm test` and `pnpm check:colors` (colour roles across
browsers). `seo.yml` runs `seo:check`, `cache-check` and Lighthouse against
`pnpm preview:prod`.

## Tests

- Default environment is plain Node (`vitest.config.ts`): most specs read the
  repository's own files and assert invariants (tokens, i18n keys, content
  frontmatter, import graphs) — no DOM, so they stay fast.
- Component/composable tests opt in per file with a first-line docblock:
  `// @vitest-environment happy-dom` (plain `mount` with hand-made stubs) or
  `// @vitest-environment nuxt` (`mountSuspended`, `mockNuxtImport`, as in
  `tests/about/components.spec.ts`). In the nuxt environment, mock `useRoute` /
  `useRuntimeConfig` / `useState` by wrapping the `original` passed to
  `mockNuxtImport` — a bare stub breaks the test app's own boot.
- `tests/helpers/theme.ts` parses `assets/css/tailwind.css` as a whole
  (`schemeColors()`: later declarations win) and can compile it with the real
  Tailwind (`compileUtilities`, `resolveCandidates`).
- Running the `nuxt` environment rewrites `.nuxtrc` (a test-utils version
  stamp); don't commit that churn.

## Styling and tokens

- Material Design 3 is the design system: build controls from the M3*
  primitives in `layers/base` and read the `tailwind-design` skill before
  changing tokens.
- Colour roles in `assets/css/tailwind.css` between the `md3:generated` markers
  are written by `scripts/md3-tokens.mjs` — never edit them by hand.
- Seasonal skins (`layers/season`, `assets/css/seasons.css`) are documented in
  AGENTS.md ("Seasonal skins") and the `tailwind-design` skill.

## Deployment and runtime facts

- Target is Cloudflare Workers (`cloudflare_module` nitro preset);
  `@nuxt/content` uses D1 there (binding `DB`). Edge caching and SEO header
  rules are documented in AGENTS.md's "Caching and SEO signals" section —
  this file does not repeat them.
- Most images referenced from `content/` are not in `public/`; they resolve
  only through the `cloudflare` `@nuxt/image` provider
  (`img.onelitefeather.net`). That provider is selected only when Cloudflare
  Workers Builds sets `WORKERS_CI=1`; local dev/preview and GitHub Actions
  builds default to the `none` provider, so those images 404 there — expected.
- i18n uses the `prefix` strategy (`/de/…`, `/en/…`); check pages under a
  locale prefix, not `/`.

## Planning workflow

Non-trivial changes are planned with OpenSpec under `openspec/changes/<name>/`
(proposal, specs, design, tasks). Use the `/opsx:*` commands; archived changes
live in `openspec/changes/archive/`. `openspec/config.yaml` adds Conventional
Commits rules to the proposal and tasks artifacts, plus guidance for apply and
archive.

## Working with subagents

- The main session orchestrates: it plans, splits work, reviews every diff and
  test result, and talks to the user. It does not do bulk reading or writing
  itself.
- Haiku subagents (`model: "haiku"`, with an explicit `effort`) are the default
  for implementation, reading, search, tests, commits and pull requests.
- Escalate a task to a Sonnet subagent when it becomes complex; use Opus only
  for planning.
- Independent tasks run in parallel (several Agent calls in one message).
- Agents that write files use `isolation: "worktree"` and branch from
  `origin/main`, never from whatever the main checkout has checked out.
- Prompts are self-contained, and the main session reviews every agent's diff
  and test results before reporting to the user.
