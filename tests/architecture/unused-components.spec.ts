import { readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
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
 *   2. Explicit import by path, often under a different local name:
 *      `import UiChip from '~/components/base/Chip.vue'` renders as `<UiChip>`.
 *   3. Dynamic import by path: `defineAsyncComponent(() => import('…/X.vue'))`.
 *   4. Convention, never referenced in any template — see EXEMPT below.
 */

const CONSUMER_DIRS = [
  'components',
  'pages',
  'layouts',
]

const ROOT_CONSUMERS = [
  'app.vue',
  'error.vue',
]

/**
 * Resolved by name at runtime, so no reference exists to find.
 *
 *   components/content/Prose*  @nuxt/content maps markdown nodes onto these
 *                              by filename; a `<ProseP>` tag never appears.
 *   components/OgImage/*       nuxt-og-image resolves them from the string
 *                              passed to defineOgImage('TeamMember').
 */
const EXEMPT = [
  /^components\/content\/Prose/,
  /^components\/OgImage\//,
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

function isReferenced(componentPath: string, corpus: Map<string, string>): boolean {
  const name = basename(componentPath, '.vue')
  const pathFromComponents = relativeToRepo(componentPath).replace(/^components\//, '')
  const patterns = [
    // Tag, in either spelling, with or without Nuxt's Lazy prefix.
    new RegExp(`<(?:Lazy)?${escape(name)}[\\s/>]`),
    new RegExp(`<(?:lazy-)?${escape(kebab(name))}[\\s/>]`),
    // Imported by path — catches renamed local bindings and async imports.
    new RegExp(`['"\`][^'"\`]*${escape(pathFromComponents)}['"\`]`),
    // <component :is="Name">
    new RegExp(`\\bis=["']${escape(name)}["']`),
  ]
  for (const [file, text] of corpus) {
    if (file === componentPath) continue
    if (patterns.some((pattern) => pattern.test(text))) return true
  }
  return false
}

describe('components', () => {
  const components = collectSourceFiles(['components'], ['.vue'])
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

    const autoImported = byName('features/navigation/NavigationBar.vue')
    const renamedImport = byName('base/Chip.vue') //        imported as UiChip
    const asyncImport = byName('community-poi/CommunityPoiGallery.vue')

    expect(autoImported && isReferenced(autoImported, corpus)).toBe(true)
    expect(renamedImport && isReferenced(renamedImport, corpus)).toBe(true)
    expect(asyncImport && isReferenced(asyncImport, corpus)).toBe(true)
  })

  it('are all rendered somewhere', () => {
    const orphans = components
      .map(relativeToRepo)
      .filter((file) => !EXEMPT.some((pattern) => pattern.test(file)))
      .filter((file) => !isReferenced(join(repoRoot, file), corpus))
    expect(orphans).toEqual([])
  })
})
