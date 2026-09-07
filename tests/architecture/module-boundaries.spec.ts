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
