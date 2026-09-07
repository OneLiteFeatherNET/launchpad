import { readFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * A Vue component nobody renders costs nothing at runtime and a lot in
 * maintenance: it still gets refactored, still shows up in searches, and still
 * looks like the thing to copy from. This repository grew a second, unused
 * navigation bar and a whole timeline feature wired to placeholder content —
 * reading either would tell you something false about the site.
 *
 * Four ways a component legitimately gets used here, all of which this has to
 * recognise or it reports healthy code as dead:
 *
 *   1. Auto-imported tag — `<TeamMembers>`, `<team-members>`, `<LazyTeamMembers>`.
 *      Nuxt needs no import statement, so the tag is the only signal.
 *   2. The same tag carrying Nuxt's directory prefix — a component at
 *      `features/community-poi/CommunityPoiBluemap.vue` registered as
 *      `<LazyFeaturesCommunityPoiBluemap>`, the file name a suffix of the tag
 *      rather than the whole of it. Only prefixes actually built from that
 *      component's own directories count, so a dead `Card.vue` cannot be kept
 *      alive by an unrelated `<SomeOtherCard>` elsewhere. Checked against a
 *      synthetic corpus below rather than a real file — once every domain has
 *      migrated into a layer, no component left under `components/` carries a
 *      directory prefix any more, so a real-file anchor for this case has
 *      nowhere to live.
 *   3. Explicit import by path, often under a different local name, e.g.
 *      `import LayoutFooter from '~/components/features/footer/Footer.vue'`
 *      rendering as `<LayoutFooter>`. Checked against a synthetic corpus
 *      below rather than a real file — once every domain has migrated into a
 *      layer, nothing in the tree is imported by path under an alias any
 *      more, so a real-file anchor for this case has nowhere to live.
 *   4. Convention, never referenced in any template — see EXEMPT below.
 *   5. Imported by a same-directory relative path (`./Foo.vue`) and handed
 *      to `<component :is="...">` under its own identifier, never written as
 *      a literal tag — Carousel.vue's item components work this way. A bare
 *      relative specifier carries none of the path pattern 3 matches on, so
 *      this is checked by resolving the specifier against the *consuming*
 *      file's real directory and comparing it to the candidate component's
 *      real path — an unrelated component sharing the same file name cannot
 *      satisfy it, because resolution lands on a different file. Resolution
 *      alone is not enough, though: it only proves the file is imported, not
 *      that the binding is used, so a stale unused import would otherwise
 *      keep a dead component alive — exactly what this suite exists to catch.
 *      Path 5 therefore also requires the imported local name to appear
 *      somewhere in the file outside the import statement itself. It does not
 *      attempt to trace *how* — e.g. into a `:is` binding — that is a
 *      dependency analyser this check has no business building; "referenced
 *      again after the import" is what it can honestly prove.
 */

const CONSUMER_DIRS = [
  'components',
  'pages',
  'layouts',
  'layers',
]

const ROOT_CONSUMERS = [
  'app.vue', 'error.vue',
]

/**
 * Resolved by name at runtime, so no reference exists to find.
 *
 *   layers/content-core/components/Prose*  @nuxt/content maps markdown nodes
 *                              onto these by filename; a `<ProseP>` tag never
 *                              appears.
 *   components/OgImage/*       nuxt-og-image resolves them from the string
 *                              passed to defineOgImage('TeamMember').
 */
const EXEMPT = [
  /^layers\/content-core\/components\/Prose/, /^components\/OgImage\//,
]

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function consumerFiles(): string[] {
  return collectSourceFiles(CONSUMER_DIRS, ['.vue', '.ts'])
    .concat(ROOT_CONSUMERS.map((file) => join(repoRoot, file)))
}

/** Escapes a string for literal use inside a RegExp. */
function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * A component inside a layer registers under its bare file name — Nuxt derives
 * no prefix from `layers/<name>/`, verified against 4.4.8. Feeding such a file
 * through the root-relative prefix chain would look for `<LayersTeamCard>`,
 * which is registered nowhere, and report every migrated component as dead.
 */
function isLayerComponent(componentPath: string): boolean {
  return relativeToRepo(componentPath).startsWith('layers/')
}

/**
 * Every prefix Nuxt could put in front of this component's file name, built
 * from its own directory chain. A component at `features/community-poi/
 * CommunityPoiBluemap.vue` would have yielded `''`, `Features`,
 * `FeaturesCommunityPoi` — one of which, plus the file name, is the
 * registered tag. Deriving them per component rather than accepting any
 * PascalCase prefix is what keeps the check from excusing a dead component
 * whose name merely ends another one.
 */
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

/**
 * A relative default import of a `.vue` file: `import Name from './x.vue'`.
 * Captures the local binding alongside the specifier, both needed by
 * detection path 5. Restricted to specifiers already ending in `.vue` —
 * component imports in this codebase always do — rather than guessing at a
 * missing extension, which would turn e.g. `'../types'` into a nonexistent
 * `'../types.vue'` and resolve to nothing real.
 */
const RELATIVE_VUE_IMPORT = /import\s+(\w+)\s+from\s+(['"`])(\.[^'"`]+\.vue)\2/g

function isReferenced(componentPath: string, corpus: Map<string, string>): boolean {
  const name = basename(componentPath, '.vue')
  const pathFromComponents = relativeToRepo(componentPath).replace(/^components\//, '')
  const prefixes = directoryPrefixes(componentPath).map(escape).join('|')
  const patterns = [
    // Tag, in either spelling, with or without Nuxt's Lazy and directory prefixes.
    new RegExp(`<(?:Lazy)?(?:${prefixes})${escape(name)}[\\s/>]`),
    new RegExp(`<(?:lazy-)?${escape(kebab(name))}[\\s/>]`),
    // Imported by path — catches renamed local bindings and async imports.
    new RegExp(`['"\`][^'"\`]*${escape(pathFromComponents)}['"\`]`),
    // <component :is="Name">
    new RegExp(`\\bis=["']${escape(name)}["']`),
  ]
  for (const [file, text] of corpus) {
    if (file === componentPath) continue
    if (patterns.some((pattern) => pattern.test(text))) return true
    // Detection path 5 (see the file banner above): resolve every relative
    // `.vue` import against the consuming file's own directory, and only
    // count it once the imported local name also appears outside that one
    // import statement — proof the binding is used, not just declared.
    for (const match of text.matchAll(RELATIVE_VUE_IMPORT)) {
      const [whole, localName, , spec] = match
      const resolved = resolve(dirname(file), spec!)
      if (resolved !== componentPath) continue
      const rest = text.slice(0, match.index) + text.slice(match.index + whole!.length)
      if (new RegExp(`\\b${escape(localName!)}\\b`).test(rest)) return true
    }
  }
  return false
}

describe('components', () => {
  const components = collectSourceFiles(['components', 'layers'], ['.vue'])
  const corpus = new Map(consumerFiles().map((file) => [file, readFileSync(file, 'utf8')]))

  it('finds components and consumers to check', () => {
    // Guards against a broken traversal turning this suite into a no-op.
    expect(components.length).toBeGreaterThan(20)
    expect(corpus.size).toBeGreaterThan(30)
  })

  it('recognises each way a component gets referenced', () => {
    // Without this, a regression in the matching would read as "nothing is
    // dead" — the failure mode that makes such a test worse than none.
    const byName = (needle: string) => components.find((file) => file.endsWith(needle))

    const autoImported = byName('layers/navigation/components/NavigationBar.vue')
    expect(autoImported && isReferenced(autoImported, corpus)).toBe(true)

    // A layer component gets no prefix at all — Nuxt derives none from
    // `layers/<name>/`, and `base/Chip.vue` is the first real one to prove it.
    expect(directoryPrefixes(byName('base/components/Chip.vue')!)).toEqual([''])
  })

  it('recognises a tag carrying Nuxt\'s directory prefix', () => {
    // Detection path 2 (see the file banner above) has no durable real-file
    // anchor: this migration moves every domain into a layer, and a layer
    // component carries no directory prefix at all (see `isLayerComponent`
    // above). Once `community-poi` — the last domain — moved, nothing left
    // under `components/` carries a prefix for a real file to anchor this on.
    // A hand-built corpus keeps the property under test — a tag carrying the
    // prefix built from the component's own directory chain — without
    // depending on a real file that no longer exists.
    const prefixedPath = join(repoRoot, 'components/features/synthetic-domain/SyntheticDomainWidget.vue')
    const prefixedConsumer = join(repoRoot, 'components/synthetic/SyntheticPrefixedConsumer.vue')
    const prefixedCorpus = new Map([
      [prefixedConsumer, '<LazyFeaturesSyntheticDomainWidget />'],
    ])
    expect(isReferenced(prefixedPath, prefixedCorpus)).toBe(true)

    // The prefixes have to come from the component's own path, or the check
    // stops being able to tell a used component from a dead one.
    expect(directoryPrefixes(prefixedPath)).toEqual(['',
      'Features',
      'FeaturesSyntheticDomain'])
  })

  it('recognises a component imported by path under a renamed local binding', () => {
    // Detection path 3 (see the file banner above) has no durable real-file
    // anchor: this migration moves every alias-imported component into a
    // layer sooner or later, at which point it is imported from the layer's
    // `index.ts` instead — not by path — and any real file chosen to prove
    // this case stops proving it a few tasks later. A hand-built corpus keeps
    // the property under test without depending on which file in the tree
    // happens to still be alias-imported this month.
    const componentPath = join(repoRoot, 'components/features/synthetic/SyntheticWidget.vue')
    const consumerPath = join(repoRoot, 'components/synthetic/SyntheticConsumer.vue')
    const syntheticCorpus = new Map([
      [consumerPath, `import RenamedWidget from '~/components/features/synthetic/SyntheticWidget.vue'`],
    ])
    expect(isReferenced(componentPath, syntheticCorpus)).toBe(true)
  })

  it('recognises a same-directory relative import only when the binding is actually used', () => {
    // Detection path 5 (see the file banner above): Carousel.vue's item
    // components are never written as a literal tag, only handed to
    // `<component :is="...">` under their imported identifier. Resolving the
    // specifier proves the file is imported; it does not by itself prove the
    // binding is used — a stale import left behind by a refactor would
    // otherwise satisfy it. Both cases below share one componentPath so only
    // the consumer's body differs.
    const componentPath = join(repoRoot, 'layers/synthetic/components/SyntheticItem.vue')

    const usedConsumer = join(repoRoot, 'layers/synthetic/components/SyntheticUser.vue')
    const usedCorpus = new Map([
      [usedConsumer, [
        `import SyntheticItem from './SyntheticItem.vue'`,
        `const componentFor = () => SyntheticItem`,
      ].join('\n')],
    ])
    expect(isReferenced(componentPath, usedCorpus)).toBe(true)

    // Same import, but the binding is never mentioned again — the stale-import
    // case this fix closes. Without the "used elsewhere" requirement this
    // would wrongly come back `true` too.
    const staleConsumer = join(repoRoot, 'layers/synthetic/components/SyntheticStale.vue')
    const staleCorpus = new Map([
      [staleConsumer, `import SyntheticItem from './SyntheticItem.vue'`],
    ])
    expect(isReferenced(componentPath, staleCorpus)).toBe(false)
  })

  it('are all rendered somewhere', () => {
    const orphans = components
      .map(relativeToRepo)
      .filter((file) => !EXEMPT.some((pattern) => pattern.test(file)))
      .filter((file) => !isReferenced(join(repoRoot, file), corpus))
    expect(orphans).toEqual([])
  })
})
