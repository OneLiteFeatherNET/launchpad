# Layer Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every domain in this repository into its own Nuxt layer, and pin the resulting boundaries with tests so the structure cannot erode again.

**Architecture:** Ten Nuxt layers under `layers/`, cut by subject rather than by technical role. Dependencies run one way — root orchestrates, domains ignore each other, both sit on `content-core` and `base`. Two new architecture tests are written first, pass against the untouched tree, and then guard every subsequent move.

**Tech Stack:** Nuxt 4.4.8, Vue 3.5, TypeScript 5.9, Vitest 4.1, pnpm 10.34, `@nuxt/content` 3.16.

**Spec:** `docs/superpowers/specs/2026-09-07-layer-architecture-design.md`

## Global Constraints

- **Never create a file under a root-level `app/`.** `srcDir` is auto-detected; one non-exempt file there flips it and silently unmounts every route and auto-import. A layer's own `app/` is fine (verified), but this plan uses the flat layout and creates no `app/` anywhere.
- **Layers use the flat layout:** `layers/<name>/components/`, `layers/<name>/composables/`, `layers/<name>/utils/`, `layers/<name>/types.ts`.
- **Every layer needs a `nuxt.config.ts`**, even an empty `export default defineNuxtConfig({})`, or Nuxt does not recognise it.
- **Layer names produce no auto-import prefix.** `layers/team/components/TeamMemberCard.vue` registers as `<TeamMemberCard>`, not `<TeamTeamMemberCard>`. Component tags therefore *lose* their `Features…` prefix on migration.
- **Nuxt auto-imports across layers regardless of `index.ts`.** The public-API boundary is enforced by `module-boundaries.spec.ts`, not by the module system. The test is the enforcement; treat a red boundary test as a hard failure, never as a test to relax.
- **`content/`, `content.config.ts`, `pages/`, `layouts/`, `app.vue`, `i18n/`, `assets/` stay at the root.**
- **Baseline: 161 tests across 53 files pass.** Every task ends with that number equal or higher, never lower.
- **Commit style:** Conventional Commits, imperative, English. No emoji.
- Use `git mv`, never `mv` — moves must stay visible as renames in review.

## File Structure

**New test infrastructure (Task 1):**

| File | Responsibility |
|---|---|
| `tests/helpers/sources.ts` (modify) | Gains `layerNames()` and `layerFiles()` so every other test can walk `layers/` the way it walks `components/` |
| `tests/architecture/module-boundaries.spec.ts` (create) | The four dependency rules, plus self-tests proving each rule catches a violation |
| `tests/architecture/layer-name-collisions.spec.ts` (create) | No two layers define the same component or composable name |
| `tests/architecture/unused-components.spec.ts` (modify) | Learns that layer components carry no directory prefix |

**Target layer layout (Tasks 2–11):**

```
layers/
  base/            nuxt.config.ts  components/  composables/  index.ts
  content-core/    nuxt.config.ts  components/  composables/  utils/  types.ts  index.ts
  blog/            nuxt.config.ts  components/  composables/  types.ts  index.ts
  community-poi/   …
  team/            … + server/api/__sitemap__/team.ts
  home/            …
  sponsoring/      …
  opencollective/  …
  navigation/      …
  footer/          nuxt.config.ts  components/  index.ts
```

---

### Task 1: Boundary tests, green against the untouched tree

**Files:**
- Modify: `tests/helpers/sources.ts`
- Create: `tests/architecture/module-boundaries.spec.ts`
- Create: `tests/architecture/layer-name-collisions.spec.ts`
- Modify: `tests/architecture/unused-components.spec.ts:72-82`

**Interfaces:**
- Produces: `layerNames(): string[]` — directory names under `layers/`, empty array when `layers/` does not exist. `layerFiles(layer: string, extensions: string[]): string[]` — absolute paths inside one layer.
- Consumes: `collectSourceFiles`, `relativeToRepo`, `repoRoot` from `tests/helpers/sources.ts`.

Nothing moves in this task. The tests must pass on a tree with **zero** layers, and start enforcing the moment the first layer appears.

- [ ] **Step 1: Add layer helpers to the test helper**

Append to `tests/helpers/sources.ts`:

```ts
/**
 * Directory names under `layers/`, or an empty array while none exist.
 *
 * Every boundary check reads this rather than a hard-coded list: during the
 * migration the set grows one layer per commit, and a hand-maintained list
 * would have to be edited in lockstep or would silently stop checking.
 */
export function layerNames(): string[] {
  try {
    return readdirSync(join(repoRoot, 'layers'))
      .filter((entry) => statSync(join(repoRoot, 'layers', entry)).isDirectory())
      .sort()
  } catch {
    return []
  }
}

/** Absolute paths of files inside one layer, filtered by extension. */
export function layerFiles(layer: string, extensions: string[]): string[] {
  const found: string[] = []
  walk(join(repoRoot, 'layers', layer), extensions, found)
  return found.sort()
}
```

`walk` is already defined in this file and stays private; `layerFiles` reuses it
rather than adding a second traversal. `readdirSync` and `statSync` are already
imported at the top.

- [ ] **Step 2: Write the failing collision test**

Create `tests/architecture/layer-name-collisions.spec.ts`:

```ts
import { basename } from 'node:path'
import { describe, expect, it } from 'vitest'
import { layerFiles, layerNames, relativeToRepo } from '../helpers/sources'

/**
 * Nuxt gives a layer's files no prefix of their own. `layers/team/components/
 * MemberCard.vue` registers as `<MemberCard>`, exactly as a root component of
 * that name would — verified against Nuxt 4.4.8, see the spec's constraint 3.
 *
 * So two layers defining `MemberCard.vue` do not both exist. One wins by
 * priority (project files first, then `~~/layers` alphabetically) and the other
 * is silently unreachable: no build error, no lint error, no type error. The
 * losing component keeps being edited by whoever owns that layer, and the site
 * keeps rendering the other one.
 */

/** Component and composable names a layer registers globally. */
function registeredNames(layer: string): { name: string, file: string }[] {
  return [
    ...layerFiles(layer, ['.vue']),
    ...layerFiles(layer, ['.ts']),
  ]
    .filter((file) => /\/(components|composables)\//.test(file))
    .filter((file) => !file.endsWith('index.ts'))
    .map((file) => ({ name: basename(file).replace(/\.(vue|ts)$/, ''), file: relativeToRepo(file) }))
}

/** Names claimed by more than one layer, as readable `name: fileA, fileB`. */
function collisions(layers: string[]): string[] {
  const byName = new Map<string, string[]>()
  for (const layer of layers) {
    for (const entry of registeredNames(layer)) {
      const files = byName.get(entry.name) ?? []
      files.push(entry.file)
      byName.set(entry.name, files)
    }
  }
  return [...byName.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([name, files]) => `${name}: ${files.sort().join(', ')}`)
    .sort()
}

describe('layer name collisions', () => {
  it('detects a name claimed by two layers', () => {
    // Proves the check works before there is anything for it to check. Without
    // this, an empty `layers/` would make the suite below pass vacuously and
    // keep passing after a real collision arrives.
    const byName = new Map([['MemberCard', ['layers/team/components/MemberCard.vue',
      'layers/home/components/MemberCard.vue']]])
    const found = [...byName.entries()]
      .filter(([, files]) => files.length > 1)
      .map(([name, files]) => `${name}: ${files.sort().join(', ')}`)
    expect(found).toEqual([
      'MemberCard: layers/home/components/MemberCard.vue, layers/team/components/MemberCard.vue',
    ])
  })

  it('no component or composable name is claimed by two layers', () => {
    expect(collisions(layerNames())).toEqual([])
  })
})
```

- [ ] **Step 3: Run it — the self-test must pass, the real check must pass vacuously**

Run: `npx vitest run tests/architecture/layer-name-collisions.spec.ts`
Expected: PASS, 2 tests. `layerNames()` returns `[]`, so the second test asserts `[] === []`.

- [ ] **Step 4: Write the boundary test**

Create `tests/architecture/module-boundaries.spec.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { layerFiles, layerNames, relativeToRepo } from '../helpers/sources'

/**
 * The dependency rule this repository's code already follows, written down so
 * it survives the next contributor:
 *
 *     root (pages, layouts, app.vue)   knows every layer
 *       -> domains (blog, team, ...)   do NOT know each other
 *         -> content-core              knows base only
 *           -> base                    knows nothing
 *
 * Directed and acyclic. Nuxt enforces none of it — layers auto-import each
 * other's composables freely — so this file is the enforcement, not a
 * description of it. A red assertion here means the architecture broke, never
 * that the test needs loosening.
 */

/** Layers every domain may depend on. Not domains themselves. */
const FOUNDATION = ['base', 'content-core']

/**
 * KNOWN CROSS-DOMAIN DEPENDENCIES — THIS MAP MAY ONLY EVER SHRINK.
 *
 * It starts empty, and that is the point: the migration removed the only two
 * candidates rather than exempting them (see the spec, "Two corrections the
 * migration makes"). Adding an entry needs a reason in review, and "the page
 * that would orchestrate it is inconvenient" is not one.
 */
const ALLOWED_CROSS_LAYER: Record<string, string> = {}

/** Layers that are domains: everything that is not foundation. */
function domainLayers(): string[] {
  return layerNames().filter((layer) => !FOUNDATION.includes(layer))
}

/** Layer names referenced from inside `file`, via path or `#layers/` alias. */
function referencedLayers(file: string): string[] {
  const text = readFileSync(file, 'utf8')
  const hits = [
    ...text.matchAll(/#layers\/([a-z0-9-]+)/g),
    ...text.matchAll(/~~?\/layers\/([a-z0-9-]+)/g),
    ...text.matchAll(/\.\.\/\.\.\/([a-z0-9-]+)\//g),
  ]
  return [...new Set(hits.map((match) => match[1]).filter((name): name is string => name !== undefined))]
}

/** Every source file of one layer. */
function filesOf(layer: string): string[] {
  return [...layerFiles(layer, ['.vue']), ...layerFiles(layer, ['.ts'])]
}

describe('layer boundaries', () => {
  it('detects a cross-domain import', () => {
    // Same guard as in the collision suite: while `layers/` is empty every
    // assertion below is vacuous, and a check that cannot fail is worse than
    // no check. This pins the matcher itself.
    const sample = `import { useTeamRoster } from '#layers/team'`
    expect(/#layers\/([a-z0-9-]+)/.exec(sample)?.[1]).toBe('team')
  })

  it('no domain layer imports from another domain layer', () => {
    const domains = domainLayers()
    const violations: string[] = []
    for (const layer of domains) {
      for (const file of filesOf(layer)) {
        for (const target of referencedLayers(file)) {
          if (target === layer || FOUNDATION.includes(target)) continue
          if (!domains.includes(target)) continue
          if (ALLOWED_CROSS_LAYER[`${layer} -> ${target}`]) continue
          violations.push(`${relativeToRepo(file)} -> ${target}`)
        }
      }
    }
    expect([...new Set(violations)].sort()).toEqual([])
  })

  it('base depends on no layer, content-core on base only', () => {
    const violations: string[] = []
    for (const file of filesOf('base')) {
      for (const target of referencedLayers(file)) {
        violations.push(`base -> ${target} (${relativeToRepo(file)})`)
      }
    }
    for (const file of filesOf('content-core')) {
      for (const target of referencedLayers(file)) {
        if (target === 'base' || target === 'content-core') continue
        violations.push(`content-core -> ${target} (${relativeToRepo(file)})`)
      }
    }
    expect(violations.sort()).toEqual([])
  })

  it('only content-core names @nuxt/content', () => {
    // The ContentRepository interface exists so the rest of the app never
    // learns which CMS is underneath. Until now that was a comment; this is
    // the first thing that actually holds it.
    const offenders: string[] = []
    for (const layer of layerNames()) {
      if (layer === 'content-core') continue
      for (const file of filesOf(layer)) {
        if (/@nuxt\/content/.test(readFileSync(file, 'utf8'))) {
          offenders.push(relativeToRepo(file))
        }
      }
    }
    expect(offenders.sort()).toEqual([])
  })

  it('reaches into no other layer past its index', () => {
    // `#layers/team` is the public API. `#layers/team/composables/useTeamRoster`
    // is someone's internals, and renaming that file then breaks a stranger.
    const offenders: string[] = []
    for (const layer of layerNames()) {
      for (const file of filesOf(layer)) {
        const text = readFileSync(file, 'utf8')
        for (const match of text.matchAll(/#layers\/([a-z0-9-]+)\/[^'"`]+/g)) {
          if (match[1] === layer) continue
          offenders.push(`${relativeToRepo(file)}: ${match[0]}`)
        }
      }
    }
    expect(offenders.sort()).toEqual([])
  })
})
```

- [ ] **Step 5: Run it**

Run: `npx vitest run tests/architecture/module-boundaries.spec.ts`
Expected: PASS, 5 tests. All real checks are vacuous while `layers/` is empty; the two self-tests are not.

- [ ] **Step 6: Make `unused-components.spec.ts` layer-aware**

In `tests/architecture/unused-components.spec.ts`, extend `CONSUMER_DIRS` (line 30) and teach `directoryPrefixes()` that layer components carry no prefix. Replace `CONSUMER_DIRS`:

```ts
const CONSUMER_DIRS = [
  'components',
  'pages',
  'layouts',
  'layers',
]
```

and add, directly above `directoryPrefixes`:

```ts
/**
 * A component inside a layer registers under its bare file name — Nuxt derives
 * no prefix from `layers/<name>/`, verified against 4.4.8. Feeding such a file
 * through the root-relative prefix chain would look for `<LayersTeamCard>`,
 * which is registered nowhere, and report every migrated component as dead.
 */
function isLayerComponent(componentPath: string): boolean {
  return relativeToRepo(componentPath).startsWith('layers/')
}
```

and make `directoryPrefixes` return only the empty prefix for those:

```ts
function directoryPrefixes(componentPath: string): string[] {
  if (isLayerComponent(componentPath)) return ['']
  const segments = relativeToRepo(componentPath)
    .replace(/^components\//, '')
    .split('/')
    .slice(0, -1)
    .map((segment) => segment.split(/[-_]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(''))

  const prefixes = ['']
  for (const segment of segments) prefixes.push(prefixes[prefixes.length - 1]! + segment)
  return prefixes
}
```

Also extend the component search in the `describe` block (line ~105) from `collectSourceFiles(['components'], ['.vue'])` to include layers:

```ts
  const components = collectSourceFiles(['components', 'layers'], ['.vue'])
```

- [ ] **Step 7: Run the full suite — the baseline must be intact**

Run: `pnpm test`
Expected: PASS. 53 files, at least 161 tests (7 new ones bring it to 168).

- [ ] **Step 8: Commit**

```bash
git add tests/helpers/sources.ts \
        tests/architecture/module-boundaries.spec.ts \
        tests/architecture/layer-name-collisions.spec.ts \
        tests/architecture/unused-components.spec.ts
git commit -m "test(architecture): pin the layer dependency rule before any move

The migration ahead moves every domain into its own Nuxt layer. Nuxt
enforces no boundary between layers — they auto-import each other's
composables freely — so the rule has to be a test or it is nothing.

Both new suites pass against the untouched tree and start enforcing the
moment the first layer appears. Each carries a self-test, because a
check that is vacuous today and silently stays vacuous is worse than no
check at all.

The collision suite exists because layer names produce no auto-import
prefix: two layers defining the same component name resolve silently by
priority, and the loser is unreachable with no error anywhere."
```

---

### Task 2: The `base` layer

**Files:**
- Create: `layers/base/nuxt.config.ts`, `layers/base/index.ts`
- Move: `components/base/**` → `layers/base/components/`, `composables/useAnalytics.ts` → `layers/base/composables/`
- Modify: every file importing those by path

**Interfaces:**
- Produces: `#layers/base` exporting `useAnalytics`. Components `<Chip>`, `<CopyButton>`, `<NavigationIconButton>`, `<IconFa>`, `<GradientText>`, `<SectionHeading>` register globally under those bare names.

Six components with no dependencies — the safest possible first move, chosen so the mechanics are settled before anything risky.

- [ ] **Step 1: Create the layer skeleton**

```bash
mkdir -p layers/base/components layers/base/composables
cat > layers/base/nuxt.config.ts <<'EOF'
// Layer: base — UI primitives with no domain knowledge and no dependencies.
// Everything else may depend on this; it depends on nothing.
export default defineNuxtConfig({})
EOF
```

- [ ] **Step 2: Move the files**

```bash
git mv components/base/Chip.vue layers/base/components/Chip.vue
git mv components/base/buttons/CopyButton.vue layers/base/components/CopyButton.vue
git mv components/base/buttons/NavigationIconButton.vue layers/base/components/NavigationIconButton.vue
git mv components/base/icons/IconFa.vue layers/base/components/IconFa.vue
git mv components/base/typography/GradientText.vue layers/base/components/GradientText.vue
git mv components/base/typography/SectionHeading.vue layers/base/components/SectionHeading.vue
git mv composables/useAnalytics.ts layers/base/composables/useAnalytics.ts
rmdir components/base/buttons components/base/icons components/base/typography components/base 2>/dev/null || true
```

The nested `buttons/`, `icons/`, `typography/` directories are flattened deliberately: they existed to shape the auto-import prefix (`<BaseButtonsCopyButton>`), and layers have no prefix, so the nesting now buys nothing.

- [ ] **Step 3: Write the public API**

```bash
cat > layers/base/index.ts <<'EOF'
// Public API of the base layer. Components are auto-imported by name and need
// no export; this covers what a consumer imports explicitly.
export { useAnalytics } from './composables/useAnalytics'
EOF
```

- [ ] **Step 4: Rewrite the importers**

Find them first:

```bash
grep -rln "components/base/\|composables/useAnalytics" \
  components pages layouts server tests app.vue error.vue
```

For each hit, replace the path import with the bare auto-imported tag where it is a component (delete the `import` line — Nuxt resolves `<SectionHeading>` on its own), and with `#layers/base` where it is the composable.

Example, `components/features/team/TeamRankSection.vue` line 3:

```diff
-import SectionHeading from '~/components/base/typography/SectionHeading.vue'
```

The tag `<SectionHeading>` in the template needs no change.

- [ ] **Step 5: Regenerate types and check auto-imports resolved**

```bash
npx nuxi prepare
grep -E "SectionHeading|useAnalytics" .nuxt/components.d.ts .nuxt/imports.d.ts
```

Expected: `SectionHeading` points at `../layers/base/components/SectionHeading.vue`, `useAnalytics` at `../layers/base/composables/useAnalytics`.

- [ ] **Step 6: Run the full suite**

Run: `pnpm test`
Expected: PASS, no fewer tests than after Task 1.

- [ ] **Step 7: Build, because `prepare` does not catch everything**

Run: `npx nuxi build`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(base): move UI primitives into their own layer

First layer, and the one with nothing underneath it — chosen to settle
the mechanics (nuxt.config.ts, index.ts, rewritten imports) on six files
before applying them to seventeen.

The buttons/, icons/ and typography/ subdirectories are flattened: they
existed only to shape the auto-import prefix, and a layer produces no
prefix at all."
```

---

### Task 3: The `content-core` layer

**Files:**
- Create: `layers/content-core/nuxt.config.ts`, `layers/content-core/index.ts`, `layers/content-core/types.ts`
- Move: `utils/content/**`, `components/content/Prose*.vue`, `composables/usePageSeo.ts`, `composables/useBreadcrumbs.ts`, `utils/schema-ids.ts`, `utils/content.ts`, `utils/safeExternalUrl.ts`, `types/seo.ts`, `types/faq.ts`

**Interfaces:**
- Produces: `#layers/content-core` exporting `useContentRepository`, `usePageSeo`, `useBreadcrumbs`, the `ContentRepository` type, `Locale`, and the FAQ entry types. Every domain layer consumes this.

This is the layer everything else stands on, and the only one allowed to name `@nuxt/content`.

- [ ] **Step 1: Create the skeleton**

```bash
mkdir -p layers/content-core/{components,composables,utils/content}
cat > layers/content-core/nuxt.config.ts <<'EOF'
// Layer: content-core — the provider-agnostic content access layer, the Prose
// overrides @nuxt/content renders markdown into, and page-level SEO plumbing.
//
// The only layer permitted to name @nuxt/content. Everything above it talks to
// the ContentRepository interface instead, which is what makes swapping the CMS
// an adapter change rather than an application change.
// Enforced by tests/architecture/module-boundaries.spec.ts.
export default defineNuxtConfig({})
EOF
```

- [ ] **Step 2: Move the files**

```bash
git mv components/content/*.vue layers/content-core/components/
git mv utils/content/collections.ts layers/content-core/utils/content/collections.ts
git mv utils/content/locales.ts layers/content-core/utils/content/locales.ts
git mv utils/content/repository.ts layers/content-core/utils/content/repository.ts
git mv utils/content/nuxtContentAdapter.ts layers/content-core/utils/content/nuxtContentAdapter.ts
git mv utils/content.ts layers/content-core/utils/content.ts
git mv utils/schema-ids.ts layers/content-core/utils/schema-ids.ts
git mv utils/safeExternalUrl.ts layers/content-core/utils/safeExternalUrl.ts
git mv composables/usePageSeo.ts layers/content-core/composables/usePageSeo.ts
git mv composables/useBreadcrumbs.ts layers/content-core/composables/useBreadcrumbs.ts
git mv composables/useContentRepository.ts layers/content-core/composables/useContentRepository.ts
git mv types/seo.ts layers/content-core/types-seo.ts
git mv types/faq.ts layers/content-core/types-faq.ts
rmdir components/content utils/content 2>/dev/null || true
```

- [ ] **Step 3: Write the public API**

```bash
cat > layers/content-core/types.ts <<'EOF'
export type * from './types-seo'
export type * from './types-faq'
EOF
cat > layers/content-core/index.ts <<'EOF'
// Public API of the content-core layer.
export { useContentRepository } from './composables/useContentRepository'
export { usePageSeo } from './composables/usePageSeo'
export { useBreadcrumbs } from './composables/useBreadcrumbs'
export type { ContentRepository } from './utils/content/repository'
export type { Locale } from './utils/content/collections'
export type * from './types'
EOF
```

- [ ] **Step 4: Fix `content.config.ts`, which stays at the root**

It imports `./utils/content/collections`. Update that import to the new location:

```diff
-} from './utils/content/collections'
+} from './layers/content-core/utils/content/collections'
```

- [ ] **Step 5: Rewrite the importers**

```bash
grep -rln "utils/content\|~/types/seo\|~/types/faq\|usePageSeo\|useBreadcrumbs\|useContentRepository\|utils/schema-ids\|safeExternalUrl" \
  components pages layouts server composables tests content.config.ts
```

Composables (`usePageSeo`, `useBreadcrumbs`, `useContentRepository`) are auto-imported and need no import statement at all — delete those lines. Type imports become `#layers/content-core`.

- [ ] **Step 6: Regenerate and verify the Prose overrides still resolve**

```bash
npx nuxi prepare
grep -c "Prose" .nuxt/components.d.ts
```

Expected: at least 32 (16 components × plain and Lazy). If this drops, `@nuxt/content` has lost its Prose overrides and every markdown page renders unstyled — check the move landed under `components/`, not `component/`.

- [ ] **Step 7: Run the suite and build**

```bash
pnpm test && npx nuxi build
```

Expected: both exit 0.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(content-core): move the content access layer into its own layer

Holds the ContentRepository interface, its @nuxt/content adapter, the
Prose overrides and page-level SEO. From here on it is the only layer
permitted to name @nuxt/content, which module-boundaries.spec.ts now
enforces — until this commit the boundary was a comment and nothing
checked it.

content.config.ts stays at the root: its collections are generated
across locales and splitting them per layer is a separate migration."
```

---

### Task 4: The `footer` layer

**Files:**
- Create: `layers/footer/nuxt.config.ts`, `layers/footer/index.ts`
- Move: `components/features/footer/Footer.vue` → `layers/footer/components/Footer.vue`

One file. Its purpose is to prove the domain-layer pattern end to end at the lowest possible cost, including the tag rename that every later task repeats.

- [ ] **Step 1: Create and move**

```bash
mkdir -p layers/footer/components
cat > layers/footer/nuxt.config.ts <<'EOF'
// Layer: footer — the site footer. One component, no domain logic.
export default defineNuxtConfig({})
EOF
printf '// Public API of the footer layer. The component is auto-imported.\nexport {}\n' > layers/footer/index.ts
git mv components/features/footer/Footer.vue layers/footer/components/Footer.vue
rmdir components/features/footer 2>/dev/null || true
```

- [ ] **Step 2: Rename the tag at its call site**

`<FeaturesFooter>` becomes `<Footer>`. Find it:

```bash
grep -rn "FeaturesFooter\|features-footer" layouts pages components app.vue error.vue
```

Replace each occurrence with `<Footer>` / `</Footer>` (or `<LazyFooter>` where it was lazy).

- [ ] **Step 3: Verify the tag resolves**

```bash
npx nuxi prepare
grep -E "^export const (Lazy)?Footer:" .nuxt/components.d.ts
```

Expected: one line pointing at `../layers/footer/components/Footer.vue`.

- [ ] **Step 4: Run the suite**

Run: `pnpm test`
Expected: PASS. `unused-components.spec.ts` is the one to watch — if it reports `layers/footer/components/Footer.vue` as an orphan, Step 6 of Task 1 did not land.

- [ ] **Step 5: Build and commit**

```bash
npx nuxi build
git add -A
git commit -m "refactor(footer): move the footer into its own layer

Smallest domain, moved first: it exercises the whole pattern including
the tag rename from <FeaturesFooter> to <Footer>, which every remaining
layer repeats, at a cost of one file if the pattern is wrong."
```

---

### Task 5: The `opencollective` layer

**Files:**
- Create: `layers/opencollective/{nuxt.config.ts,index.ts,types.ts}`
- Move: `components/features/opencollective/OpenCollectiveStats.vue`, `composables/useOpenCollective.ts`, `types/opencollective.ts`

- [ ] **Step 1: Create and move**

```bash
mkdir -p layers/opencollective/{components,composables}
cat > layers/opencollective/nuxt.config.ts <<'EOF'
// Layer: opencollective — donation totals fetched from the Open Collective API.
export default defineNuxtConfig({})
EOF
git mv components/features/opencollective/OpenCollectiveStats.vue layers/opencollective/components/OpenCollectiveStats.vue
git mv composables/useOpenCollective.ts layers/opencollective/composables/useOpenCollective.ts
git mv types/opencollective.ts layers/opencollective/types.ts
rmdir components/features/opencollective 2>/dev/null || true
cat > layers/opencollective/index.ts <<'EOF'
export { useOpenCollective } from './composables/useOpenCollective'
export type * from './types'
EOF
```

- [ ] **Step 2: Rename the tag and fix type imports**

`<LazyFeaturesOpencollectiveOpenCollectiveStats>` in `pages/index.vue` becomes `<LazyOpenCollectiveStats>`.

```bash
grep -rn "FeaturesOpencollective\|~/types/opencollective" pages components composables tests
```

Type imports become `#layers/opencollective`.

- [ ] **Step 3: Verify, test, build, commit**

```bash
npx nuxi prepare
grep -E "OpenCollectiveStats|useOpenCollective" .nuxt/components.d.ts .nuxt/imports.d.ts
pnpm test && npx nuxi build
git add -A
git commit -m "refactor(opencollective): move donation stats into their own layer"
```

---

### Task 6: The `sponsoring` layer

**Files:**
- Create: `layers/sponsoring/{nuxt.config.ts,index.ts,types.ts}`
- Move: `components/features/sponsoring/Sponsoring.vue`, `composables/useSponsoring.ts`, `composables/useSponsorSchema.ts`, `types/sponsoring.ts`

- [ ] **Step 1: Create and move**

```bash
mkdir -p layers/sponsoring/{components,composables}
cat > layers/sponsoring/nuxt.config.ts <<'EOF'
// Layer: sponsoring — sponsor listing and its schema.org markup.
export default defineNuxtConfig({})
EOF
git mv components/features/sponsoring/Sponsoring.vue layers/sponsoring/components/Sponsoring.vue
git mv composables/useSponsoring.ts layers/sponsoring/composables/useSponsoring.ts
git mv composables/useSponsorSchema.ts layers/sponsoring/composables/useSponsorSchema.ts
git mv types/sponsoring.ts layers/sponsoring/types.ts
rmdir components/features/sponsoring 2>/dev/null || true
cat > layers/sponsoring/index.ts <<'EOF'
export { useSponsoring } from './composables/useSponsoring'
export { useSponsorSchema } from './composables/useSponsorSchema'
export type * from './types'
EOF
```

- [ ] **Step 2: Rename the tag**

`<LazyFeaturesSponsoring>` in `pages/index.vue` becomes `<LazySponsoring>`.

```bash
grep -rn "FeaturesSponsoring\|~/types/sponsoring" pages components composables tests
```

- [ ] **Step 3: Verify, test, build, commit**

```bash
npx nuxi prepare && pnpm test && npx nuxi build
git add -A
git commit -m "refactor(sponsoring): move sponsor listing into its own layer"
```

---

### Task 7: The `navigation` layer

**Files:**
- Create: `layers/navigation/{nuxt.config.ts,index.ts}`
- Move: `components/features/navigation/{NavigationBar,NavigationItem,LanguageSelector}.vue`, `components/features/navigation/navItems.ts`, `utils/navigation.ts`, `composables/useSiteNavigationSchema.ts`

Watch out: `nav-active-state.spec.ts` and `locale-list.spec.ts` both read these files by path.

- [ ] **Step 1: Create and move**

```bash
mkdir -p layers/navigation/{components,composables,utils}
cat > layers/navigation/nuxt.config.ts <<'EOF'
// Layer: navigation — the top bar, its items, the language selector and the
// SiteNavigationElement schema.org markup.
export default defineNuxtConfig({})
EOF
git mv components/features/navigation/NavigationBar.vue layers/navigation/components/NavigationBar.vue
git mv components/features/navigation/NavigationItem.vue layers/navigation/components/NavigationItem.vue
git mv components/features/navigation/LanguageSelector.vue layers/navigation/components/LanguageSelector.vue
git mv components/features/navigation/navItems.ts layers/navigation/navItems.ts
git mv utils/navigation.ts layers/navigation/utils/navigation.ts
git mv composables/useSiteNavigationSchema.ts layers/navigation/composables/useSiteNavigationSchema.ts
rmdir components/features/navigation 2>/dev/null || true
cat > layers/navigation/index.ts <<'EOF'
export { useSiteNavigationSchema } from './composables/useSiteNavigationSchema'
export { navItems } from './navItems'
EOF
```

- [ ] **Step 2: Rename tags and fix the two tests that read these paths**

```bash
grep -rn "FeaturesNavigation\|features/navigation\|utils/navigation" \
  layouts pages components app.vue error.vue tests
```

`tests/architecture/nav-active-state.spec.ts` and `tests/architecture/locale-list.spec.ts` hard-code `components/features/navigation/...`. Update both to `layers/navigation/components/...`.

- [ ] **Step 3: Verify, test, build, commit**

```bash
npx nuxi prepare && pnpm test && npx nuxi build
git add -A
git commit -m "refactor(navigation): move the navigation bar into its own layer"
```

---

### Task 8: The `blog` layer

**Files:**
- Create: `layers/blog/{nuxt.config.ts,index.ts,types.ts}`
- Move: `components/features/blog/**` (4 components), `composables/useBlogContent.ts`, `composables/useArticleSeo.ts`, `types/blog.ts`

`FeaturedTeamMembers.vue` moves here **unchanged** — its cross-domain call to `useTeamRoster` is fixed in Task 12, after `team` exists.

- [ ] **Step 1: Create and move**

```bash
mkdir -p layers/blog/{components,composables}
cat > layers/blog/nuxt.config.ts <<'EOF'
// Layer: blog — articles, their cards, sharing and per-article SEO.
export default defineNuxtConfig({})
EOF
git mv components/features/blog/page/card/ArticleCard.vue layers/blog/components/ArticleCard.vue
git mv components/features/blog/page/FeaturedTeamMembers.vue layers/blog/components/FeaturedTeamMembers.vue
git mv components/features/blog/page/top1/Top1.vue layers/blog/components/Top1.vue
git mv components/features/blog/SocialMediaShare.vue layers/blog/components/SocialMediaShare.vue
git mv composables/useBlogContent.ts layers/blog/composables/useBlogContent.ts
git mv composables/useArticleSeo.ts layers/blog/composables/useArticleSeo.ts
git mv types/blog.ts layers/blog/types.ts
rm -rf components/features/blog
cat > layers/blog/index.ts <<'EOF'
export { useBlogContent } from './composables/useBlogContent'
export { useArticleSeo } from './composables/useArticleSeo'
export type * from './types'
EOF
```

- [ ] **Step 2: Rename tags and fix imports**

```bash
grep -rn "FeaturesBlog\|features/blog\|~/types/blog" pages components layouts tests
```

`<LazyFeaturesBlogSocialMediaShare>` in `pages/blog/[...slug].vue` becomes `<LazySocialMediaShare>`. `tests/design-system/article-card-image.spec.ts` and `tests/content/blog-list-projection.spec.ts` reference these paths — update both.

- [ ] **Step 3: Verify, test, build, commit**

```bash
npx nuxi prepare && pnpm test && npx nuxi build
git add -A
git commit -m "refactor(blog): move articles into their own layer

FeaturedTeamMembers.vue comes along unchanged; its call into the team
domain is resolved in a later commit, once that layer exists."
```

---

### Task 9: The `team` layer, including the misfiled component

**Files:**
- Create: `layers/team/{nuxt.config.ts,index.ts,types.ts}`
- Move: `components/features/team/**` (3), **`components/features/home/team/TeamMemberCard.vue`**, `composables/{useTeamRoster,useTeamProfile,useTeamFaqContent}.ts`, `utils/{teamAvatar,teamRoles}.ts`, `types/team.ts`, `server/api/__sitemap__/team.ts`

This task carries the first of the two corrections from the spec. `TeamMemberCard.vue` currently sits under `components/features/home/team/`, its only consumer is `TeamRankSection.vue` in `team`, and `home` never renders it. Moving it here removes the tree's sole cross-feature path import outright.

- [ ] **Step 1: Create and move, misfiled component included**

```bash
mkdir -p layers/team/{components,composables,utils,server/api/__sitemap__}
cat > layers/team/nuxt.config.ts <<'EOF'
// Layer: team — the roster, member profiles, open positions and the team FAQ.
//
// TeamMemberCard.vue lived under components/features/home/team/ until this
// layer existed, although home never rendered it and its only consumer was
// TeamRankSection here. It was the one cross-feature import in the tree, and it
// was a filing mistake rather than a real dependency.
export default defineNuxtConfig({})
EOF
git mv components/features/team/TeamRankSection.vue layers/team/components/TeamRankSection.vue
git mv components/features/team/TeamFaqSection.vue layers/team/components/TeamFaqSection.vue
git mv components/features/team/OpenPositionCard.vue layers/team/components/OpenPositionCard.vue
git mv components/features/home/team/TeamMemberCard.vue layers/team/components/TeamMemberCard.vue
git mv composables/useTeamRoster.ts layers/team/composables/useTeamRoster.ts
git mv composables/useTeamProfile.ts layers/team/composables/useTeamProfile.ts
git mv composables/useTeamFaqContent.ts layers/team/composables/useTeamFaqContent.ts
git mv utils/teamAvatar.ts layers/team/utils/teamAvatar.ts
git mv utils/teamRoles.ts layers/team/utils/teamRoles.ts
git mv types/team.ts layers/team/types.ts
git mv server/api/__sitemap__/team.ts layers/team/server/api/__sitemap__/team.ts
rmdir components/features/team components/features/home/team 2>/dev/null || true
cat > layers/team/index.ts <<'EOF'
export { useTeamRoster } from './composables/useTeamRoster'
export { useTeamProfile } from './composables/useTeamProfile'
export { useTeamFaqContent } from './composables/useTeamFaqContent'
export { teamAvatarUrl } from './utils/teamAvatar'
export { toRoleString } from './utils/teamRoles'
export type * from './types'
EOF
```

- [ ] **Step 2: Drop the now-obsolete cross-feature import**

In `layers/team/components/TeamRankSection.vue`, line 4:

```diff
-import TeamMemberCard from '~/components/features/home/team/TeamMemberCard.vue'
```

Delete it. `<TeamMemberCard>` is auto-imported from the same layer now.

- [ ] **Step 3: Confirm the sitemap endpoint still resolves**

The Nitro route moved. Verify Nuxt picked it up:

```bash
npx nuxi prepare
grep -rn "__sitemap__/team" .nuxt/types/nitro-routes.d.ts 2>/dev/null || \
  echo "CHECK MANUALLY: does layers/team/server/ register?"
```

If the route did not register, layers do not merge `server/` in this Nuxt version — move it back to root `server/api/__sitemap__/team.ts` and note it in the commit message. `nuxt.config.ts` names `/api/__sitemap__/team` as a sitemap source, so a missing route breaks the sitemap build.

- [ ] **Step 4: Fix remaining importers**

```bash
grep -rn "features/team\|features/home/team\|~/types/team\|teamAvatar\|teamRoles\|useTeamRoster\|useTeamProfile" \
  pages components layers tests server
```

`pages/team/index.ts` and `pages/team/[slug].vue` use the composables (auto-imported, drop the import lines). `tests/architecture/frozen-props.spec.ts` and `tests/i18n/*` may reference the component paths.

- [ ] **Step 5: Run the boundary test explicitly**

Run: `npx vitest run tests/architecture/module-boundaries.spec.ts`
Expected: PASS with an empty violation list. `blog → team` does not appear yet, because `FeaturedTeamMembers` calls `useTeamRoster()` as an auto-import with no import statement, which the path matcher does not see. Task 12 removes the call itself.

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && npx nuxi build
git add -A
git commit -m "refactor(team): move the team domain into its own layer

Brings TeamMemberCard.vue with it. It sat under features/home/team/
while home never rendered it and its only consumer was TeamRankSection
here — the single cross-feature path import in the tree, and a filing
mistake rather than a dependency. Moving it deletes that import instead
of exempting it."
```

---

### Task 10: The `home` layer

**Files:**
- Create: `layers/home/{nuxt.config.ts,index.ts,types.ts}`
- Move: `components/features/home/**` (10 remaining), `composables/{useHomeContent,useHomeSeo,useCarousel,useFaqContent}.ts`, `types/home.ts`, `types/carousel.ts`

`TeamMemberCard.vue` is already gone (Task 9). `useFaqContent` joins this layer, per the spec's "Why no faq layer".

- [ ] **Step 1: Create and move**

```bash
mkdir -p layers/home/{components,composables}
cat > layers/home/nuxt.config.ts <<'EOF'
// Layer: home — the landing page sections: carousel, server concept, server
// addresses and the general FAQ.
//
// useFaqContent lives here rather than in a layer of its own: FAQ is a shared
// mechanism whose two components belong to visible pages (this one and team),
// not a domain that owns a page. See the spec, "Why no faq layer".
export default defineNuxtConfig({})
EOF
git mv components/features/home/carousel/Carousel.vue layers/home/components/Carousel.vue
git mv components/features/home/carousel/items/CarouselItemBlog.vue layers/home/components/CarouselItemBlog.vue
git mv components/features/home/carousel/items/CarouselItemEvent.vue layers/home/components/CarouselItemEvent.vue
git mv components/features/home/carousel/items/CarouselItemImage.vue layers/home/components/CarouselItemImage.vue
git mv components/features/home/carousel/items/CarouselItemNews.vue layers/home/components/CarouselItemNews.vue
git mv components/features/home/carousel/items/CarouselItemPoi.vue layers/home/components/CarouselItemPoi.vue
git mv components/features/home/faq/FaqSection.vue layers/home/components/FaqSection.vue
git mv components/features/home/server-addresses/ServerAddressCard.vue layers/home/components/ServerAddressCard.vue
git mv components/features/home/server-addresses/ServerAddresses.vue layers/home/components/ServerAddresses.vue
git mv components/features/home/server-concept/ServerConcept.vue layers/home/components/ServerConcept.vue
git mv composables/useHomeContent.ts layers/home/composables/useHomeContent.ts
git mv composables/useHomeSeo.ts layers/home/composables/useHomeSeo.ts
git mv composables/useCarousel.ts layers/home/composables/useCarousel.ts
git mv composables/useFaqContent.ts layers/home/composables/useFaqContent.ts
git mv types/home.ts layers/home/types-home.ts
git mv types/carousel.ts layers/home/types-carousel.ts
rm -rf components/features/home
cat > layers/home/types.ts <<'EOF'
export type * from './types-home'
export type * from './types-carousel'
EOF
cat > layers/home/index.ts <<'EOF'
export { useHomeContent } from './composables/useHomeContent'
export { useHomeSeo } from './composables/useHomeSeo'
export { useCarousel } from './composables/useCarousel'
export { useFaqContent } from './composables/useFaqContent'
export type * from './types'
EOF
```

- [ ] **Step 2: Rename the tags in `pages/index.vue`**

Four lazy tags change:

```diff
-  <LazyFeaturesHomeServerConcept
+  <LazyServerConcept
-  <LazyFeaturesHomeServerAddresses
+  <LazyServerAddresses
-  <LazyFeaturesHomeFaqSection hydrate-on-visible />
+  <LazyFaqSection hydrate-on-visible />
```

and the explicit import at the top:

```diff
-import Carousel from "~/components/features/home/carousel/Carousel.vue";
```

`<Carousel>` is auto-imported; delete the line.

- [ ] **Step 3: Fix the remaining references**

```bash
grep -rn "FeaturesHome\|features/home\|~/types/home\|~/types/carousel" \
  pages components layers tests
```

`tests/a11y/carousel-live-region.spec.ts`, `tests/a11y/carousel-pause.spec.ts`, `tests/content/carousel-schema.spec.ts` and `tests/architecture/lazy-components.spec.ts` all reference these paths — update each.

- [ ] **Step 4: Verify, test, build, commit**

```bash
npx nuxi prepare && pnpm test && npx nuxi build
git add -A
git commit -m "refactor(home): move the landing page sections into their own layer

useFaqContent comes here rather than into a faq layer of its own: FAQ is
a mechanism shared by two pages, not a domain that owns one."
```

---

### Task 11: The `community-poi` layer

**Files:**
- Create: `layers/community-poi/{nuxt.config.ts,index.ts,types.ts}`
- Move: `components/features/community-poi/**` (15), `composables/useCommunityPoi.ts`, `types/community-poi.ts`

Largest layer, moved last, when the pattern is routine.

- [ ] **Step 1: Create and move**

```bash
mkdir -p layers/community-poi/{components,composables}
cat > layers/community-poi/nuxt.config.ts <<'EOF'
// Layer: community-poi — community build projects: their cards, progress,
// schematics, BlueMap embed and contribution info.
export default defineNuxtConfig({})
EOF
git mv components/features/community-poi/*.vue layers/community-poi/components/
git mv composables/useCommunityPoi.ts layers/community-poi/composables/useCommunityPoi.ts
git mv types/community-poi.ts layers/community-poi/types.ts
rm -rf components/features
cat > layers/community-poi/index.ts <<'EOF'
export { useCommunityPoi } from './composables/useCommunityPoi'
export type * from './types'
EOF
```

`rm -rf components/features` is correct here: this was the last domain, so the directory is now empty.

- [ ] **Step 2: Rename the six lazy tags in `pages/community-poi/[...slug].vue`**

```diff
-  <LazyFeaturesCommunityPoiBluemap
+  <LazyCommunityPoiBluemap
-  <LazyFeaturesCommunityPoiCollaboration
+  <LazyCommunityPoiCollaboration
-  <LazyFeaturesCommunityPoiContributeInfo
+  <LazyCommunityPoiContributeInfo
-  <LazyFeaturesCommunityPoiGallery
+  <LazyCommunityPoiGallery
-  <LazyFeaturesCommunityPoiLitematicaHelp
+  <LazyCommunityPoiLitematicaHelp
-  <LazyFeaturesCommunityPoiSchematicList
+  <LazyCommunityPoiSchematicList
```

- [ ] **Step 3: Fix remaining references**

```bash
grep -rn "FeaturesCommunityPoi\|features/community-poi\|~/types/community-poi" \
  pages components layers tests
```

`tests/a11y/poi-card-image-behaviour.spec.ts`, `tests/a11y/poi-card-image-fallback.spec.ts` and `tests/design-system/*` reference these — update each.

- [ ] **Step 4: Confirm `components/` now holds only what belongs at the root**

```bash
find components -type f
```

Expected: only `components/OgImage/TeamMember.satori.vue`. It stays: `nuxt-og-image` resolves it by the string in `defineOgImage('TeamMember')`, and it is exempt in `unused-components.spec.ts` for that reason.

- [ ] **Step 5: Verify, test, build, commit**

```bash
npx nuxi prepare && pnpm test && npx nuxi build
git add -A
git commit -m "refactor(community-poi): move community build projects into their own layer

Last domain to move, and the largest. components/ now holds only the
OgImage template, which nuxt-og-image resolves by name."
```

---

### Task 12: Remove the last cross-domain dependency

**Files:**
- Modify: `layers/blog/components/FeaturedTeamMembers.vue`
- Modify: `pages/blog/[...slug].vue`
- Modify: `tests/architecture/module-boundaries.spec.ts` (assertion only, if needed)

`FeaturedTeamMembers` reaches into `team` **three** times, not once — verified by
reading the file:

```ts
const props = defineProps<{ slugs: string[] }>()
const { bySlug } = useTeamRoster()                        // 1
import { teamAvatarUrl } from '~/utils/teamAvatar'        // 2  -> layers/team
import { toRoleString } from '~/utils/teamRoles'          // 3  -> layers/team
```

The product fact is real — a blog article shows team members — but the coupling
is not. Note what this rules out: passing `TeamMember[]` down would still need
`import type { TeamMember } from '#layers/team'` and still call the two team
utilities in the template, so the boundary would stay broken in two of three
places.

The component instead receives everything **already resolved**, as a view type
it owns itself. After this task `blog` names nothing from `team` at all.

- [ ] **Step 1: Write the failing boundary assertion**

Add to `tests/architecture/module-boundaries.spec.ts`:

```ts
  it('blog names nothing from the team domain', () => {
    // Auto-imported composables and utils leave no import statement, so the
    // path matcher above cannot see them. Named explicitly because this was
    // the last cross-domain coupling in the tree, and the exception map above
    // is only worth anything while it stays empty.
    const file = join(repoRoot, 'layers/blog/components/FeaturedTeamMembers.vue')
    const text = readFileSync(file, 'utf8')
    expect(text).not.toMatch(/useTeamRoster|teamAvatarUrl|toRoleString|TeamMember\b/)
  })
```

Add `join` to the `node:path` import and `repoRoot` to the helper import at the
top of the file.

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run tests/architecture/module-boundaries.spec.ts`
Expected: FAIL — all three names are still in that file.

- [ ] **Step 3: Give the component its own view type and a single prop**

Replace the whole `<script setup>` block of
`layers/blog/components/FeaturedTeamMembers.vue` with:

```ts
import { useI18n } from 'vue-i18n'
import { NuxtLink } from '#components'

/**
 * One member as this component needs to draw it. Deliberately not `TeamMember`
 * from the team layer: importing that type would put the blog layer back into
 * a domain it must not know, and the component uses four fields of it.
 *
 * The page resolves slugs, avatars and role labels — it sits at the root and
 * may know both layers. What arrives here is finished presentation data.
 */
export type FeaturedMember = {
  slug: string
  name: string
  avatarUrl: string
  /** Already formatted; empty string renders no role line. */
  role: string
}

const props = defineProps<{ members: FeaturedMember[] }>()

const { t, locale } = useI18n()
</script>
```

Then update the template. Three edits, and nothing else changes:

```diff
-    v-if="members.length"
+    v-if="props.members.length"
...
-      <li v-for="m in members" :key="m.slug">
+      <li v-for="m in props.members" :key="m.slug">
...
-            :src="teamAvatarUrl({ mcName: m.mcName, slug: m.slug, avatarUrl: m.avatarUrl }, 64)"
+            :src="m.avatarUrl"
...
-            <span v-if="toRoleString(m.role)" class="block text-xs text-neutral-600 dark:text-neutral-400">{{ toRoleString(m.role) }}</span>
+            <span v-if="m.role" class="block text-xs text-neutral-600 dark:text-neutral-400">{{ m.role }}</span>
```

- [ ] **Step 4: Do the resolution in the page**

In `pages/blog/[...slug].vue`, the current call site is at line ~130:

```vue
<FeaturedTeamMembers
  v-if="blog?.teamMembers?.length"
  :slugs="blog.teamMembers"
/>
```

Add to the `<script setup>` block:

```ts
const { bySlug } = useTeamRoster()

// Resolves what FeaturedTeamMembers used to fetch for itself. The lookup
// belongs here: this page is the root, so it may know both the blog and the
// team layer, and neither layer learns about the other.
const featuredMembers = computed(() => (blog.value?.teamMembers ?? [])
  .map((slug: string) => bySlug.value[slug])
  .filter((member): member is NonNullable<typeof member> => Boolean(member))
  .map((member) => ({
    slug: member.slug,
    name: member.name,
    avatarUrl: teamAvatarUrl({ mcName: member.mcName, slug: member.slug, avatarUrl: member.avatarUrl }, 64),
    role: toRoleString(member.role) ?? ''
  })))
```

`useTeamRoster`, `teamAvatarUrl` and `toRoleString` are auto-imported from the
team layer and need no import statement. Then change the call site:

```diff
 <FeaturedTeamMembers
-  v-if="blog?.teamMembers?.length"
-  :slugs="blog.teamMembers"
+  v-if="featuredMembers.length"
+  :members="featuredMembers"
 />
```

The `v-if` moves to the resolved array on purpose: a slug that matches no member
is filtered out, so `teamMembers.length` could be non-zero while nothing renders,
leaving an empty bordered section on the page.

- [ ] **Step 5: Run the boundary test, then the suite**

```bash
npx vitest run tests/architecture/module-boundaries.spec.ts
pnpm test
```

Expected: both PASS. The exception map is still empty.

- [ ] **Step 6: Verify the page still renders the members**

```bash
npx nuxi build
```

Then check a blog article that has `teamMembers` in its frontmatter:

```bash
grep -rln "teamMembers" content/blog/en/
```

Expected: at least one file. Its rendered page must still show the member cards — a filter bug here shows as a silently empty section, which no test catches.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(blog): take resolved members as a prop instead of reaching into team

FeaturedTeamMembers named three things from the team domain, not one:
useTeamRoster, teamAvatarUrl and toRoleString. Passing TeamMember[] down
would have fixed only the first and kept the type import besides, so the
component now declares its own view type and receives finished
presentation data.

A blog article showing team members is a real product fact; the coupling
was not. The page is the root and may know both layers.

The v-if moves to the resolved array: a slug matching no member was
filtered out downstream, so the old condition could render an empty
bordered section.

Leaves the boundary test's exception map empty, which is the state worth
defending — the first entry is what makes the second one easy."
```

---

### Task 13: Correct the documentation

**Files:**
- Modify: `AGENTS.md` — the "Project Structure & Module Organization" section
- Modify: `docs/superpowers/specs/2026-09-07-layer-architecture-design.md` — status line

`AGENTS.md` currently describes `components/blog`, `components/ui` and `components/sections`. None of those existed even before this migration, and every one of them is wrong after it. A structure document that lies is worse than none, because both humans and agents follow it.

- [ ] **Step 1: Rewrite the structure section**

Replace the "Project Structure & Module Organization" bullets in `AGENTS.md` with:

```markdown
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
```

- [ ] **Step 2: Mark the spec implemented**

```diff
-Status: approved, not yet implemented
+Status: implemented (2026-09-07)
```

- [ ] **Step 3: Run every gate once, not just the test suite**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm quality
npx nuxi build
```

Expected: all exit 0. `pnpm quality` compares against `quality-baseline.json`; if it reports a regression, that is a real finding, not migration noise.

- [ ] **Step 4: Confirm the shape of the whole diff**

```bash
git diff --stat origin/main..HEAD | tail -5
git diff origin/main..HEAD --diff-filter=M --name-only | wc -l
```

Every change should be a move, an import rewrite, a test adaptation or a documentation edit. No component's rendered output changed. If the diff shows logic edits outside `FeaturedTeamMembers.vue` and `pages/blog/[...slug].vue`, something was rewritten that should only have moved.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md docs/superpowers/specs/2026-09-07-layer-architecture-design.md
git commit -m "docs(architecture): describe the layer structure that now exists

AGENTS.md listed components/blog, components/ui and components/sections.
None of the three existed before this migration either — the document
had drifted far enough to mislead anyone, human or agent, who trusted
it.

Records the dependency rule and, more importantly, where it is enforced:
Nuxt allows every import this forbids, so the architecture tests are the
only thing holding it."
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Ten layers, contents per layer | 2–11 |
| `faq` split into `home` and `team` | 10 (`useFaqContent`), 9 (`useTeamFaqContent`), 3 (`types/faq.ts`) |
| Dependency rule, four boundary rules | 1 |
| Collision test (constraint 3) | 1 |
| `unused-components.spec.ts` adaptation (risk 3) | 1, Step 6 |
| `TeamMemberCard.vue` correction | 9 |
| `FeaturedTeamMembers` orchestrator pattern | 12 |
| Migration order, small before large | 2–11, ordered footer → community-poi |
| Verification after every commit | every task's final steps |
| Cloudflare build risk (risk 4) | 13, Step 3 |
| `AGENTS.md` correction | 13 |
| Ambient types and `useBluemap` stay at root | 3 (not moved), 11 Step 4 (verified) |

No spec requirement is without a task.

**Open items an executor must decide in place, not skip:**

1. **Task 9, Step 3** — whether Nuxt merges a layer's `server/` directory. The step contains both outcomes and what to do for each. Do not leave the sitemap route broken; `nuxt.config.ts` names it as a sitemap source.
2. **Task 12** — no open question remains; the component and its call site were read while writing the plan, and the diffs quote the real lines. If `FeaturedTeamMembers.vue` has changed on `main` since 2026-09-07, re-read it before applying them.
