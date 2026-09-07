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

/** Component, composable and util names a layer registers globally. */
function registeredNames(layer: string): { name: string, file: string }[] {
  return [
    ...layerFiles(layer, ['.vue']),
    ...layerFiles(layer, ['.ts']),
  ]
    .filter((file) => /\/(components|composables|utils)\//.test(file))
    .filter((file) => !file.endsWith('index.ts'))
    .map((file) => ({ name: basename(file).replace(/\.(vue|ts)$/, ''), file: relativeToRepo(file) }))
}

/**
 * Names claimed by more than one entry, as readable `name: fileA, fileB`.
 * Pure grouping logic, kept separate from filesystem access so the self-test
 * below exercises the exact same code the real check runs.
 */
function collisionsIn(entries: { name: string, file: string }[]): string[] {
  const byName = new Map<string, string[]>()
  for (const entry of entries) {
    const files = byName.get(entry.name) ?? []
    files.push(entry.file)
    byName.set(entry.name, files)
  }
  return [...byName.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([name, files]) => `${name}: ${files.sort().join(', ')}`)
    .sort()
}

/** Names claimed by more than one layer, as readable `name: fileA, fileB`. */
function collisions(layers: string[]): string[] {
  return collisionsIn(layers.flatMap((layer) => registeredNames(layer)))
}

describe('layer name collisions', () => {
  it('detects a name claimed by two layers', () => {
    // Proves the check works before there is anything for it to check. Without
    // this, an empty `layers/` would make the suite below pass vacuously and
    // keep passing after a real collision arrives. Calls the same
    // `collisionsIn()` the real check calls, so a regression there fails here
    // too instead of leaving a stale copy green.
    const found = collisionsIn([
      { name: 'MemberCard', file: 'layers/team/components/MemberCard.vue' },
      { name: 'MemberCard', file: 'layers/home/components/MemberCard.vue' },
    ])
    expect(found).toEqual([
      'MemberCard: layers/home/components/MemberCard.vue, layers/team/components/MemberCard.vue',
    ])
  })

  it('no component, composable or util name is claimed by two layers', () => {
    expect(collisions(layerNames())).toEqual([])
  })
})
