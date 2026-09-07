import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, layerFiles, layerNames, relativeToRepo, repoRoot } from '../helpers/sources'

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

/**
 * NAMED EXCEPTIONS TO "reaches into no other layer past its index".
 *
 * Keyed by the file's path relative to the repo root. Adding an entry needs a
 * reason that survives review — "it was easier" is not one; "the alias does
 * not resolve in this runtime, verified by building" is.
 */
const ALLOWED_DEEP_IMPORTS: Record<string, string> = {
  'server/api/__sitemap__/team.ts': 'Nitro does not participate in layer aliasing: '
    + '#layers/content-core pulls in useContentRepository, which imports '
    + '@nuxt/content directly, and Nitro\'s impound plugin refuses that outside '
    + 'the Nuxt app bundle. Verified with `nuxi build`: the alias produces a '
    + 'Rollup "Importing directly from module entry-points is not allowed" error '
    + 'for this route.',
}

/** Layers that are domains: everything that is not foundation. */
function domainLayers(): string[] {
  return layerNames().filter((layer) => !FOUNDATION.includes(layer))
}

/**
 * Layer names referenced anywhere in `text`, via path or `#layers/` alias.
 * Pure string matching, kept separate from file access so the self-test below
 * exercises the exact same code the real check runs.
 */
function referencesIn(text: string): string[] {
  const hits = [
    ...text.matchAll(/#layers\/([a-z0-9-]+)/g),
    ...text.matchAll(/~~?\/layers\/([a-z0-9-]+)/g),
    ...text.matchAll(/(?:\.\.\/)+([a-z0-9-]+)\//g),
  ]
  const names = hits.map((match) => match[1]).filter((name): name is string => name !== undefined)
  return [...new Set(names)]
}

/** Layer names referenced from inside `file`, via path or `#layers/` alias. */
function referencedLayers(file: string): string[] {
  return referencesIn(readFileSync(file, 'utf8'))
}

/** Every source file of one layer. */
function filesOf(layer: string): string[] {
  return [...layerFiles(layer, ['.vue']), ...layerFiles(layer, ['.ts'])]
}

/**
 * An actual dependency on `@nuxt/content` (or one of its subpaths, e.g.
 * `@nuxt/content/server`): a `from`/`require(`/`import(` naming the module as
 * a string literal. Deliberately narrower than a bare substring search — a
 * comment explaining *why* a layer must not depend on the content module (this
 * file's own header does exactly that) is documentation, not a dependency, and
 * must not trip this check. See the self-test below, which is what stops this
 * from regressing back into a string search.
 */
const CONTENT_MODULE_IMPORT
  = /(?:\bfrom\s*|\brequire\s*\(\s*|\bimport\s*\(\s*)['"`]@nuxt\/content(?:\/[^'"`]*)?['"`]/

/** Whether `text` actually depends on `@nuxt/content`, as opposed to merely mentioning it. */
function namesContentModuleIn(text: string): boolean {
  return CONTENT_MODULE_IMPORT.test(text)
}

/**
 * Strips `//` line comments, `/* *\/` block comments and `<!-- -->` HTML
 * comments (the last because this runs against `.vue` templates too) from
 * `text`. Deliberately simple regex passes rather than a parser: good enough
 * to keep documentation prose from tripping a raw-text name match, which is
 * the only thing this is for.
 */
function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\/.*$/gm, '')
}

/**
 * The content module's own query functions — `queryCollection` and its three
 * siblings — auto-imported via `#imports`, with no `from '@nuxt/content'` to
 * anchor on the way `CONTENT_MODULE_IMPORT` above does. content-core's own
 * adapter is written exactly this way
 * (`layers/content-core/utils/content/nuxtContentAdapter.ts`), so anchoring
 * only on the module specifier left this the one spelling nobody in the repo
 * actually needs, and every other layer free to call it undetected. Matched
 * against comment-stripped text (see `stripComments` above) so a comment
 * naming one of these for documentation does not trip the check.
 */
const CONTENT_QUERY_FUNCTION = /\bqueryCollection(?:Navigation|ItemSurroundings|SearchSections)?\s*\(/

/** Whether `text` actually calls one of the content module's query functions. */
function namesContentQueryFunctionIn(text: string): boolean {
  return CONTENT_QUERY_FUNCTION.test(stripComments(text))
}

/**
 * The three composables/utils that are auto-imported from the team domain
 * (no `from '...'` clause to anchor on, unlike `CONTENT_MODULE_IMPORT`
 * above) plus the domain's own view type. Matched against comment-stripped
 * text so a comment that merely names one of these — explaining why the file
 * must not use it — does not trip the check. See the self-test below, which
 * is what stops this from regressing into a bare string search the way
 * `namesContentModuleIn` once did (see Task 8).
 */
const TEAM_DOMAIN_NAME = /useTeamRoster|teamAvatarUrl|toRoleString|TeamMember\b/

/**
 * Whether `text` actually names something from the team domain, as opposed
 * to merely mentioning it in prose.
 */
function namesTeamDomainIn(text: string): boolean {
  return TEAM_DOMAIN_NAME.test(stripComments(text))
}

/**
 * A deep import into another layer's internals — anything past its
 * `index.ts` public API. All three ways a path can name a layer directory
 * count the same: the `#layers/` alias, and `~/layers/` / `~~/layers/`
 * (Nuxt's srcDir- and rootDir-relative forms).
 */
const DEEP_IMPORT = /(?:#layers\/|~~?\/layers\/)([a-z0-9-]+)\/[^'"`]+/g

/**
 * Layer names deep-imported (past their index) anywhere in `text`. Kept
 * separate from file access so the self-test below exercises the exact same
 * pattern the real check runs.
 */
function deepImportsIn(text: string): string[] {
  const hits = [...text.matchAll(DEEP_IMPORT)]
  const names = hits.map((match) => match[1]).filter((name): name is string => name !== undefined)
  return [...new Set(names)]
}

/** Root-level code that may consume any layer's public API — never its internals. */
const ROOT_CONSUMER_DIRS = ['components',
  'pages',
  'layouts',
  'composables',
  'utils',
  'plugins',
  'server',
  'types']
const ROOT_CONSUMER_FILES = ['app.vue',
'error.vue',
'nuxt.config.ts',
'content.config.ts']

/** Every root-level file that is not part of any layer. */
function rootConsumerFiles(): string[] {
  return [
    ...collectSourceFiles(ROOT_CONSUMER_DIRS, ['.vue', '.ts']), ...ROOT_CONSUMER_FILES.map((file) => join(repoRoot, file)),
  ]
}

describe('layer boundaries', () => {
  it('detects a cross-domain import', () => {
    // Same guard as in the collision suite: while `layers/` is empty every
    // assertion below is vacuous, and a check that cannot fail is worse than
    // no check. Calls the same `referencesIn()` the real checks call, and
    // covers all three patterns it matches, so a regression in any one of
    // them fails here instead of leaving a stale copy green.
    expect(referencesIn(`import { useTeamRoster } from '#layers/team'`)).toEqual(['team'])
    expect(referencesIn(`import { useTeamRoster } from '~~/layers/team'`)).toEqual(['team'])
    expect(referencesIn(`import { useTeamRoster } from '../../team/composables/useTeamRoster'`)).toEqual(['team'])
    // A layer's root files (index.ts, types.ts) naturally spell a sibling
    // layer with a single `../`, not two — the two-level-only pattern this
    // pins against used to leave that spelling invisible to every check below.
    expect(referencesIn(`import type { TeamMember } from '../team/types'`)).toEqual(['team'])
  })

  it('detects a deep import past a layer index, in every alias spelling', () => {
    // The hole this pins: rule 5 below used to match only `#layers/`, so
    // `~/layers/content-core/utils/content/locales` reached straight into a
    // layer's internals and stayed invisible to the check.
    expect(deepImportsIn(`import { useTeamRoster } from '#layers/team/composables/useTeamRoster'`)).toEqual(['team'])
    expect(deepImportsIn(`import { locales } from '~/layers/content-core/utils/content/locales'`)).toEqual(['content-core'])
    expect(deepImportsIn(`import { locales } from '~~/layers/content-core/utils/content/locales'`)).toEqual(['content-core'])
    // The layer's own public entry point is not a deep import.
    expect(deepImportsIn(`import { useTeamRoster } from '#layers/team'`)).toEqual([])
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
    // Only a real layer name counts as crossing a boundary. Since the widened
    // `(?:\.\.\/)+` pattern also matches a single `../` into a sibling
    // directory *inside* the same layer (e.g. `composables/x.ts` importing
    // `../utils/y`), the captured name must be checked against the actual
    // layer list — otherwise `../utils/...` reads as a dependency on a layer
    // called "utils", which does not exist.
    const knownLayers = layerNames()
    const violations: string[] = []
    for (const file of filesOf('base')) {
      for (const target of referencedLayers(file)) {
        if (!knownLayers.includes(target)) continue
        violations.push(`base -> ${target} (${relativeToRepo(file)})`)
      }
    }
    for (const file of filesOf('content-core')) {
      for (const target of referencedLayers(file)) {
        if (!knownLayers.includes(target)) continue
        if (target === 'base' || target === 'content-core') continue
        violations.push(`content-core -> ${target} (${relativeToRepo(file)})`)
      }
    }
    expect(violations.sort()).toEqual([])
  })

  it('detects a dependency on @nuxt/content but not a comment naming it', () => {
    // Pins both directions: a comment describing the boundary must pass, and
    // every real way of pulling in the module (a static import, a subpath
    // import, and `require`) must be caught.
    expect(namesContentModuleIn('// the coerced value @nuxt/content stores rather than a hand-typed union.')).toBe(false)
    expect(namesContentModuleIn(`import type { Foo } from '@nuxt/content'`)).toBe(true)
    expect(namesContentModuleIn(`import type { Foo } from '@nuxt/content/server'`)).toBe(true)
    expect(namesContentModuleIn(`const x = require('@nuxt/content')`)).toBe(true)
  })

  it('detects a call to a content-module query function but not a comment naming it', () => {
    // Pins both directions for the auto-import spelling `CONTENT_MODULE_IMPORT`
    // cannot see: a comment naming the function must pass, and a real call to
    // any of the four must be caught.
    expect(namesContentQueryFunctionIn('// queryCollection is confined to content-core.')).toBe(false)
    expect(namesContentQueryFunctionIn(`export const leak = () => queryCollection('blog_de').all()`)).toBe(true)
    expect(namesContentQueryFunctionIn(`queryCollectionNavigation('/docs')`)).toBe(true)
    expect(namesContentQueryFunctionIn(`queryCollectionItemSurroundings('docs', '/a')`)).toBe(true)
    expect(namesContentQueryFunctionIn(`queryCollectionSearchSections('docs')`)).toBe(true)
  })

  it('only content-core names @nuxt/content', () => {
    // The ContentRepository interface exists so the rest of the app never
    // learns which CMS is underneath. Until now that was a comment; this is
    // the first thing that actually holds it. Checks for an actual
    // dependency (see CONTENT_MODULE_IMPORT) or a real call to one of its
    // auto-imported query functions (see CONTENT_QUERY_FUNCTION) — not the
    // bare substring — a layer is free to explain in prose why it must not
    // depend on the content module.
    const offenders: string[] = []
    for (const layer of layerNames()) {
      if (layer === 'content-core') continue
      for (const file of filesOf(layer)) {
        const text = readFileSync(file, 'utf8')
        if (namesContentModuleIn(text) || namesContentQueryFunctionIn(text)) {
          offenders.push(relativeToRepo(file))
        }
      }
    }
    expect(offenders.sort()).toEqual([])
  })

  it('detects team-domain names but not a comment naming them', () => {
    // Pins both directions: a comment explaining why a name must not be used
    // must pass, and real usage — a call or a type reference — must be
    // caught. The negative case is the whole point: without it, this
    // regresses silently back into a bare string search.
    expect(namesTeamDomainIn('// Deliberately not the TeamMember type from the team layer.')).toBe(false)
    expect(namesTeamDomainIn(`const { bySlug } = useTeamRoster()`)).toBe(true)
    expect(namesTeamDomainIn(`:src="teamAvatarUrl(m, 64)"`)).toBe(true)
    expect(namesTeamDomainIn(`{{ toRoleString(m.role) }}`)).toBe(true)
    expect(namesTeamDomainIn(`function f(m: TeamMember) {}`)).toBe(true)
  })

  it('blog names nothing from the team domain', () => {
    // Auto-imported composables and utils leave no import statement, so the
    // path matcher above cannot see them. Named explicitly because this was
    // the last cross-domain coupling in the tree, and the exception map above
    // is only worth anything while it stays empty. Matched on comment-stripped
    // text (see namesTeamDomainIn) so an explanatory comment naming these for
    // documentation purposes does not trip the check.
    const file = join(repoRoot, 'layers/blog/components/FeaturedTeamMembers.vue')
    const text = readFileSync(file, 'utf8')
    expect(namesTeamDomainIn(text)).toBe(false)
  })

  it('reaches into no other layer past its index', () => {
    // `#layers/team` is the public API. `#layers/team/composables/useTeamRoster`
    // is someone's internals, and renaming that file then breaks a stranger —
    // whether the stranger is another layer or root app code. Checked via
    // every alias spelling (`#layers/`, `~/layers/`, `~~/layers/`), not just
    // `#layers/`, and across root consumer code as well as layer-internal
    // files, since a root file reaching past a layer's index is the same
    // defect as a layer doing it to another layer.
    const offenders: string[] = []
    for (const layer of layerNames()) {
      for (const file of filesOf(layer)) {
        const text = readFileSync(file, 'utf8')
        for (const match of text.matchAll(DEEP_IMPORT)) {
          if (match[1] === layer) continue
          offenders.push(`${relativeToRepo(file)}: ${match[0]}`)
        }
      }
    }
    for (const file of rootConsumerFiles()) {
      const relative = relativeToRepo(file)
      if (ALLOWED_DEEP_IMPORTS[relative]) continue
      const text = readFileSync(file, 'utf8')
      for (const match of text.matchAll(DEEP_IMPORT)) {
        offenders.push(`${relative}: ${match[0]}`)
      }
    }
    expect(offenders.sort()).toEqual([])
  })
})
