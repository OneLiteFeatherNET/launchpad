# Layer architecture: domain boundaries as Nuxt layers

Status: implemented (2026-09-07)
Date: 2026-09-07
Base: `origin/main` @ 7ac3174

## The problem

Every domain in this repository is scattered across three to seven top-level
directories. Changing "team" today means touching `components/features/team/`,
`components/features/home/team/`, `composables/useTeamRoster.ts`,
`composables/useTeamProfile.ts`, `composables/useTeamFaqContent.ts`,
`utils/teamAvatar.ts`, `utils/teamRoles.ts`, `types/team.ts`,
`server/api/__sitemap__/team.ts` and `content/team/`.

That is the standard failure of a directory tree cut by technical role rather
than by subject: files of the same *kind* sit together, files that change
*together* do not. Cohesion is low, and the cost is paid on every change.

What is not broken is the dependency direction. All ten content composables
already go through a single `ContentRepository` interface, and there is exactly
one cross-domain import in the whole tree. The logical architecture is sound;
only the physical layout contradicts it. This design moves the files to match
the structure that already exists in the code, and then pins that structure
with tests so it cannot erode again.

## Scope

In scope: moving source files into ten Nuxt layers, two new architecture tests
that enforce the boundaries, and the correction of one misfiled component and
one cross-domain dependency.

Out of scope, deliberately:

- **`content/` and `content.config.ts` stay at the root.** Collections are
  generated across locales by `defineLocalizedCollections`; splitting them per
  layer is a second, unrelated migration.
- **`pages/`, `layouts/`, `app.vue`, `i18n/`, `assets/` stay at the root.** The
  root is the orchestrator — see "Dependency rule" below.
- **No component is rewritten.** Two exceptions, both listed in the plan:
  `TeamMemberCard.vue` moves to where it belongs, and `FeaturedTeamMembers.vue`
  takes a prop instead of calling into another domain.

## Verified constraints

Three facts were established empirically against Nuxt 4.4.8 in this repository
before this design was written. They are recorded because each one would
otherwise be a plausible-sounding assumption.

1. **A layer may contain an `app/` directory without flipping the root
   `srcDir`.** `AGENTS.md` forbids a root-level `app/` because one file there
   silently re-roots the project. A spike created
   `layers/spike/app/components/SpikeProbe.vue`, ran `nuxi prepare`, and
   confirmed the root alias `~/*` still resolved to the repository root while
   every existing component stayed registered. The prohibition applies to the
   root only. (The spike ran against the `feat/seasonal-theming` checkout, which
   carries more components than this branch; the mechanism it verified is
   independent of that.)

2. **The flat layout works too.** `layers/<name>/components/` and
   `layers/<name>/composables/` are auto-imported without an `app/` directory.
   This design uses the flat form, because it matches the root layout this
   repository already uses and sidesteps the `app/` question entirely.

3. **Layer names produce no auto-import prefix.** `layers/spike/components/
   SpikeFlat.vue` registered as `<SpikeFlat>`, not `<SpikeSpikeFlat>`. Two
   layers defining a component of the same name therefore collide, and Nuxt
   resolves the collision silently by priority (project files first, then
   `~~/layers` alphabetically). This is the exact shape of failure this
   repository writes tests against, and it is why a collision test is part of
   step 1 rather than an afterthought.

Baseline: 161 tests across 53 files pass on `origin/main`.

## The ten layers

| Layer | Holds | Files |
|---|---|---|
| `base` | `components/base/` — Chip, CopyButton, NavigationIconButton, IconFa, GradientText, SectionHeading. Plus `useAnalytics`. | 7 |
| `content-core` | `utils/content/*` (repository, adapter, collections, locales), `components/content/Prose*`, `usePageSeo`, `useBreadcrumbs`, `types/seo.ts`, `types/faq.ts`, `utils/schema-ids.ts`, `utils/content.ts`, `utils/safeExternalUrl.ts` | ~24 |
| `blog` | `features/blog/`, `useBlogContent`, `useArticleSeo`, `types/blog.ts` | 7 |
| `community-poi` | `features/community-poi/`, `useCommunityPoi`, `types/community-poi.ts` | 17 |
| `team` | `features/team/`, `TeamMemberCard.vue` (moved), `useTeamRoster`, `useTeamProfile`, `useTeamFaqContent`, `utils/teamAvatar.ts`, `utils/teamRoles.ts`, `types/team.ts`, `server/api/__sitemap__/team.ts` | 11 |
| `home` | `features/home/` (minus TeamMemberCard), `useHomeContent`, `useHomeSeo`, `useCarousel`, `useFaqContent`, `types/home.ts`, `types/carousel.ts` | 16 |
| `sponsoring` | `features/sponsoring/`, `useSponsoring`, `useSponsorSchema`, `types/sponsoring.ts` | 4 |
| `opencollective` | `features/opencollective/`, `useOpenCollective`, `types/opencollective.ts` | 3 |
| `navigation` | `features/navigation/`, `utils/navigation.ts`, `useSiteNavigationSchema` | 6 |
| `footer` | `features/footer/` | 1 |

Each layer is `layers/<name>/` containing `nuxt.config.ts` (may be empty, but
must exist), the relevant `components/`, `composables/`, `utils/`, `types.ts`,
and an `index.ts` that is the layer's only public surface.

`useBluemap` stays at the root with `pages/bluemap.vue`; it has one consumer and
belongs to no domain. `types/font-awesome.d.ts` and `types/page-meta.d.ts` stay
at the root too: ambient declaration files are global by nature and belong to no
layer.

### Why no `faq` layer

FAQ has its own composables and its own type but its two components live
elsewhere: `FaqSection.vue` under `home/`, `TeamFaqSection.vue` under `team/`.
A `faq` layer would either be logic without UI, or would pull components out of
two domains that visibly own them.

So FAQ is split along the lines its UI already follows: `useFaqContent` joins
`home`, `useTeamFaqContent` joins `team`, and the shared `types/faq.ts` goes to
`content-core`. Duplicating a small mechanism is cheaper here than a layer that
no page owns.

## Dependency rule

```
root  (pages, layouts, app.vue)      knows every layer, orchestrates
  |
domains  (blog, team, home, ...)     do NOT know each other
  |
content-core                         knows base only
  |
base                                 knows nothing
```

Directed and acyclic. This is the import rule from Feature-Sliced Design without
FSD's seven-layer hierarchy, which has no real inhabitants at this size.

Cross-domain communication goes through the root. A page may read from two
layers and pass the result down as props; a layer may not reach sideways. After
this migration there are **zero** cross-domain dependencies, so the boundary
test starts with an empty exception list — the strongest possible starting
position, and one worth defending.

## Two corrections the migration makes

**`TeamMemberCard.vue` is misfiled.** It sits at
`components/features/home/team/TeamMemberCard.vue`, its only consumer is
`components/features/team/TeamRankSection.vue`, and `home` does not use it at
all. It is the sole cross-feature path import in the tree — not a real coupling,
just a file in the wrong place. It moves into `team`, and the dependency
disappears rather than being exempted.

**`FeaturedTeamMembers.vue` calls into another domain.** It lives in `blog` and
calls `useTeamRoster()` from `team`. This is a genuine fact about the product: a
blog article shows team members. It is resolved by the orchestrator pattern —
the component takes a `members` prop, and `pages/blog/[...slug].vue`, which sits
at the root and may know both layers, does the lookup and passes the result
down.

## Enforcement

Both tests are written in step 1, **against the current tree, passing before any
file moves.** They read files as text, like every other check under `tests/` —
importing SFCs would need a Nuxt runtime for a question the source already
answers.

### `tests/architecture/module-boundaries.spec.ts`

1. No domain layer imports from another domain layer. Exceptions live in a named
   map that may only ever shrink, in the shape `component-api.spec.ts` already
   established. The map starts empty.
2. `base` imports from no layer. `content-core` imports from `base` only.
3. Only `content-core` names `@nuxt/content`. This is what finally makes the
   `ContentRepository` boundary real; today it is documented in a comment and
   enforced by nothing.
4. Cross-layer imports go through `#layers/<name>` or the layer's `index.ts`.
   Deep imports into another layer's internals fail.

### `tests/architecture/layer-name-collisions.spec.ts`

No two layers define a component or composable of the same name. Required
because of verified constraint 3: without it, a collision ships as a silently
overridden component with no error anywhere.

### Existing tests that must be adapted

- **`unused-components.spec.ts`** derives auto-import prefixes from the
  directory path via `directoryPrefixes()`. Once components live in layers, the
  prefix is gone (constraint 3) and the test would report false orphans from
  step 2 onward. It has to learn about `layers/`.
- **`tests/helpers/sources.ts`** defines the directories every other test walks.
  It is the central lever: 21 test files hard-wire directory paths, and most of
  them follow this helper.

## Migration order

One commit per step. The full suite passes at every step, so a regression is
always attributable to exactly one commit.

| # | Step | Note |
|---|---|---|
| 1 | Both boundary tests + `sources.ts` becomes layer-aware | Green against today's tree; nothing has moved |
| 2 | `base` | No dependencies — the safest first move |
| 3 | `content-core` | Everything below depends on this being right |
| 4 | `footer` | 1 file; proves the domain pattern cheaply |
| 5 | `opencollective` | 3 files |
| 6 | `sponsoring` | 4 files |
| 7 | `navigation` | 6 files |
| 8 | `blog` | 7 files |
| 9 | `team` | 11 files; `TeamMemberCard.vue` moves here |
| 10 | `home` | 16 files; loses `TeamMemberCard.vue` |
| 11 | `community-poi` | 17 files; largest, moved last when the pattern is routine |
| 12 | Orchestrator | `FeaturedTeamMembers` takes a prop; blog page does the lookup |
| 13 | `AGENTS.md` | Its "Project Structure" section describes directories that no longer exist |

Small layers move before large ones so that the mechanics — `nuxt.config.ts`,
`index.ts`, rewritten imports, adapted tests — are settled on 1 file before they
are applied to 17.

## Verification

After every commit:

- `pnpm test` — the full suite, 161 tests as the baseline
- `npx nuxi prepare` — catches broken auto-imports, which are otherwise silent
- `npx nuxi build` — catches what `prepare` does not

Once at the end: `pnpm quality`, `pnpm lint`, `pnpm typecheck`, and a real
production build. The Cloudflare Workers config (`nitro.externals.inline`,
`cloudflare_module` preset) is written against today's structure and is the one
piece a type check cannot cover.

## Risks

1. **Silent name collisions.** Verified as real (constraint 3). Mitigated by the
   collision test in step 1, before any layer exists.
2. **Auto-import prefixes change.** 22 tag occurrences across 10 files
   (`<LazyFeaturesHomeFaqSection>` and friends) plus 128 path imports. Mechanical
   but broad; `nuxi prepare` after each step is what catches a missed one.
3. **`unused-components.spec.ts` reports false orphans** from step 2 until it is
   made layer-aware. Handled in step 1 rather than discovered in step 2.
4. **The Cloudflare build is not covered by the test suite.** A real build runs
   at the end. If it breaks, the failure is in Nitro's module resolution across
   layers, not in application code.
5. **Ten layers is a lot for 62 components.** `footer` holds one file,
   `opencollective` three. This was chosen deliberately over a coarser cut; the
   cost is more directories to navigate and more places to look when a component
   misbehaves. If it proves wrong in practice, merging two layers is a cheap
   reversal — the boundary test tells you exactly what depends on what.

## What this does not solve

The migration moves files and pins boundaries. It does not improve a single
component, does not touch the fixed palette classes found in the earlier
research, and does not make the site render differently in any way. A reviewer
should be able to confirm that from the diff: every hunk is a move, an import
rewrite, or a test adaptation.
