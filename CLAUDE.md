# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` (imported above) is the authority on architecture, layer rules and
conventions. This file adds only what it lacks.

## Commands

```bash
pnpm test                                  # vitest run, whole suite
pnpm exec vitest run tests/architecture    # one directory
pnpm exec vitest run tests/design-system/contrast.spec.ts -t "contrast"   # one file / one test name
node scripts/md3-tokens.mjs [--check]      # regenerate / verify the generated MD3 colour roles
```

## Tests

- Default environment is plain Node (`vitest.config.ts`): most specs read the
  repository's own files and assert invariants (tokens, i18n keys, content
  frontmatter, import graphs) — no DOM, so they stay fast.
- Component/composable tests opt in per file with a first-line docblock,
  `// @vitest-environment happy-dom` (plain `mount` with hand-made stubs),
  used across `tests/architecture`, `tests/design-system`, `tests/events` and
  `tests/a11y`. `// @vitest-environment nuxt` is configured as the supported
  alternative for auto-imports/`mountSuspended`, but no spec uses it yet.
- `tests/helpers/theme.ts` parses `assets/css/tailwind.css` as a whole
  (`schemeColors()`: later declarations win) and can compile it with the real
  Tailwind (`compileUtilities`, `resolveCandidates`).
- Running the `nuxt` environment rewrites `.nuxtrc` (a test-utils version
  stamp); don't commit that churn.

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
(proposal, specs, design, tasks). `openspec/config.yaml` adds Conventional
Commits rules to the proposal and tasks artifacts and guidance for apply and
archive. Drive it with the `openspec` CLI (`openspec list`,
`openspec change ...`, `openspec doctor`) — no slash commands for it are
committed to this repository yet.

## Working with subagents

- The main session orchestrates: it plans, splits work, reviews results, and
  talks to the user — it does not do the implementation itself.
- Implementation, refactors, tests, commits and PRs go to Sonnet subagents.
- Search, reading, fact-checking and CI/log triage go to Haiku subagents.
- Independent tasks run in parallel, not sequentially.
- Agents that write files use `isolation: "worktree"` and branch from
  `origin/main`.
- The main session reviews every agent's diff and test results before
  reporting back.
