# Baseline: nuxt-structure (gate task)

Each scenario was run against a fresh `general-purpose` subagent (model: `sonnet`),
read-only, with no knowledge of the skill. `.claude/skills/nuxt-structure/` did not
exist on disk during any RED run — it was never created, because the gate below
failed.

This is a **gate task**: unlike the other three skills, no skill is built unless
three baseline scenarios produce enough fired-marker evidence to clear a 15-line
threshold. See "Gate decision" at the end.

## Ground truth gathered before dispatch

```
$ ls app 2>&1
ls: cannot access 'app': No such file or directory
$ grep -n "srcDir" nuxt.config.ts
(no output — srcDir is not set; Nuxt 4 default detection applies, and since no
app/ directory exists, srcDir resolves to the project root)
$ ls shared 2>&1
ls: cannot access 'shared': No such file or directory
$ grep -n "shared" nuxt.config.ts tsconfig.json
(no output — the shared/ convention is not yet adopted anywhere in this repo)
```

```
$ grep -rn "^import .* from '~/" server/
server/sitemap/utils.ts:1:import type { BlogArticle } from '~/types/blog'
server/api/__sitemap__/team.ts:2:import type { TeamDocument, TeamMember } from '~/types/team'
```
Every existing `server/` import from `~/...` in this repo is `import type` only —
no server file currently imports a runtime value from `~/utils`, `~/composables`
or `~/types`. This is genuinely untested territory in the codebase.

```
$ cat server/sitemap/utils.ts
import type { BlogArticle } from '~/types/blog'

export const normalizeDate = (value?: string | Date | null) => { ... }
export const isReleased = (article: BlogArticle) => { ... }

$ grep -rln "sitemap/utils" server/ composables/ utils/
(no output — nothing imports this file; it is dead code)
```
`server/sitemap/utils.ts` duplicates `normalizeReleaseDate`/`isReleased` from
`composables/useBlogContent.ts` almost verbatim, and nothing imports either copy
of the server-side version — confirming scenario 2's premise ("computed in two
places") is real, pre-existing duplication in this repo, not a scenario fiction.

```
$ cat composables/useTeamRoster.ts | grep -A3 "useAsyncData<TeamDocument"
  const { data: teamDoc } = useAsyncData<TeamDocument | null>(
    () => `team-roster-${activeLocale.value}`,
    () => repo.getTeamDocument(activeLocale.value),
    { watch: [activeLocale] }
  )
```
Confirms the house `useAsyncData` shape: a getter-function key (never a bare
string literal) and `watch: [activeLocale]`/`watch: [locale, ...]` in the
options object, consistently across `useTeamRoster.ts`, `useBlogContent.ts`
(`useBlogOverview`, `useBlogArticle`).

## Scenario 1: the `app/` trap

**Prompt:** Add a global route middleware that redirects `/blog/feed` to `/blog`.

**Marker:** any file created under `app/`. Per the plan, this is the highest-value
marker in the whole set — one file under `app/` flips `srcDir` and silently
unmounts every route with no error.

### RED (no skill)

Marker fired: **no**. The agent read `nuxt.config.ts` (no `srcDir` override), noted
no `app/` directory exists, and correctly created
`middleware/blog-feed-redirect.global.ts` at the project root — the right location
for root-`srcDir` Nuxt 4. It matched routes by name (`blog-slug` + i18n locale
suffix) rather than raw path, correctly reasoning about `strategy: 'prefix'`.

```diff
diff --git a/middleware/blog-feed-redirect.global.ts b/middleware/blog-feed-redirect.global.ts
new file mode 100644
+export default defineNuxtRouteMiddleware((to) => {
+  if (typeof to.name !== 'string' || !to.name.startsWith('blog-slug')) return
+  const slug = to.params.slug
+  const slugPath = Array.isArray(slug) ? slug.join('/') : slug
+  if (slugPath !== 'feed') return
+  const localePath = useLocalePath()
+  return navigateTo(localePath('/blog'), { redirectCode: 301 })
+})
```

Full diff saved at `/tmp/claude-1000/-mnt-projects-oss-onelitefeather-launchpad/ce7c6ee8-d808-4199-998e-10695fa3e008/scratchpad/nuxt-structure/red-scenario1.diff`.

No GREEN run — the gate failed before Step 5.

---

## Scenario 2: the Nitro import boundary

**Prompt:** Article release state is computed in two places and should be shared:
`composables/useBlogContent.ts` needs it, and so does
`server/api/__sitemap__/team.ts`. Extract it into one helper used by both.

**Marker:** a file under `server/` with a runtime value import from `~/utils`,
`~/composables` or `~/types` (an `import type` is fine), **or** the helper placed
anywhere other than `shared/utils`.

### RED (no skill)

Marker fired: **yes**, both halves. The agent correctly discovered that the
prompt's premise didn't quite match the code (`team.ts` has no release logic;
the real second copy is dead code in `server/sitemap/utils.ts`) and extracted the
shared logic into `utils/content/blogRelease.ts` — not `shared/utils` (this repo
has no `shared/` directory at all; the agent never considered creating one).  It
then turned `server/sitemap/utils.ts` into a thin re-export shim:

```diff
diff --git a/server/sitemap/utils.ts b/server/sitemap/utils.ts
-import type { BlogArticle } from '~/types/blog'
-export const normalizeDate = ...
-export const isReleased = ...
+export { normalizeDate, isBlogArticleReleased as isReleased } from '~/utils/content/blogRelease'
```

That re-export is a **runtime value import** from `~/utils/content/blogRelease`
inside a `server/` file — the first time this repo's server tree would import a
runtime value across the app/Nitro boundary (every existing `server/` import from
`~/...` is `import type` only, per the ground truth above). Nuxt 4's actual
convention for this exact situation — a helper needed by both app code and Nitro
— is the `shared/utils`/`shared/types` directories (auto-imported on both sides,
no manual import needed, `#shared` alias), which the agent had no way to know
about since nothing in this repo uses or references them.

Full diff saved at `/tmp/claude-1000/-mnt-projects-oss-onelitefeather-launchpad/ce7c6ee8-d808-4199-998e-10695fa3e008/scratchpad/nuxt-structure/red-scenario2.diff`.

No GREEN run — the gate failed before Step 5.

---

## Scenario 3: the house `useAsyncData` shape

**Prompt:** Add a `useTimelineContent()` composable that loads the timeline
entries for the currently active locale, following the conventions of the other
content composables in this project.

**Marker:** the `useAsyncData` key argument is a string literal rather than a
getter, and/or the options object omits `watch: [locale]`.

### RED (no skill)

Marker fired: **no**. The agent read `useHomeContent.ts` (closest structural
analog — a single-document, single-locale collection like the timeline data) and
`useFaqContent.ts`, then wrote:

```diff
+  const { data: timeline } = useAsyncData<TimelineDocument | null>(
+    () => `timeline-${activeLocale.value}`,
+    () => repo.getTimeline(activeLocale.value),
+    { watch: [activeLocale] }
+  )
```

Getter-function key, `watch: [activeLocale]` present — an exact match for the
house shape in `useTeamRoster.ts`/`useBlogContent.ts`. It also correctly routed
the new data type through the full `content.config.ts` → `ContentRepository`
interface → `nuxtContentAdapter` → composable pipeline (the boundary documented
in `nuxt-content-cms`), rather than calling `queryCollection` directly from the
composable.

This is the scenario the brief flagged as likely to pass clean ("an agent that
reads `useTeamRoster.ts` first may well get it right") — it did, confirming that
prediction.

Full diff saved at `/tmp/claude-1000/-mnt-projects-oss-onelitefeather-launchpad/ce7c6ee8-d808-4199-998e-10695fa3e008/scratchpad/nuxt-structure/red-scenario3.diff`.

No GREEN run — the gate failed before Step 5.

---

## Gate decision: KILLED

**Marker tally: 1 of 3 fired.** Scenario 1 (the `app/` srcDir trap, the
plan's own "highest-value marker") did not fire. Scenario 3 (the house
`useAsyncData` shape) did not fire. Only scenario 2 (the Nitro import boundary /
`shared/` convention) fired, on both its conditions.

**Line count that drove the kill:** the brief's own Step 5 line budget assigns
these totals to the sections that would have covered the *unfired* markers:
`Layout map + the app/ rule` (22 lines) + `Where new code goes` (16) +
`The house useAsyncData shape` (24) + `Nuxt 4 data semantics` (16) +
`Ownership: layout, app.vue, page` (14) + `SSR determinism` (12) = **104 lines**.
Scenarios 1 and 3 are direct, first-party evidence that a competent Sonnet agent
already produces this content unprompted: correct middleware placement at the
project root with a stated, correct reason (no `app/` exists, `srcDir` resolves
to root); and the exact getter-key-plus-`watch` `useAsyncData` shape, arrived at
by reading a sibling composable rather than by guessing. 104 lines is far past
the 15-line kill threshold — not a marginal call.

Only `Server boundary` (16 lines, budgeted for scenario 2) has a fired marker
behind it. Per the marker rule ("a fired marker is a floor, not a ceiling... a
brief-mandated section with no fired marker may stay only if 10 lines or
fewer"), a single 16-line section — one real, non-obvious fact (Nitro can't
reach `~/utils`/`~/composables`/`~/types` at runtime; the cross-boundary home is
`shared/utils`/`shared/types`) — does not justify a skill file with four
one-line pointers to the other three skills wrapped around it. That one fact is
cheap to state directly as a rule.

**Decision: do not build `.claude/skills/nuxt-structure/`.** Per the kill path,
the one fact that earned its place (scenario 2) becomes an `AGENTS.md` bullet
instead. The `app/`-trap fact is also folded in as a second bullet, despite its
scenario not firing this run: it is single-sentence-cheap, and the failure mode
it guards against (a silent, repo-wide route/auto-import outage from one
misplaced file) is severe enough that a clean pass on one RED run is not
sufficient reason to leave the repo with zero written guard against it — the
same "required infrastructure, kept anyway" judgment call the `nuxt-seo`
baseline made for its "Emitter ownership map" section on a clean scenario 2 pass.
See `## Proposed AGENTS.md bullets` in the task report
(`.superpowers/sdd/2026-07-28-launchpad-knowledge-skills/task-4-report.md`) for
the exact text — not applied here per this task's write-scope restriction.

No `references/nuxt4-runtime-deltas.md` or `references/server-and-shared.md` was
written; no GREEN phase was run.
