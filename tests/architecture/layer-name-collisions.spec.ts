import { basename } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, layerFiles, layerNames, relativeToRepo } from '../helpers/sources'

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
 *
 * The same priority rule makes a root file just as dangerous: Nuxt resolves
 * project `components/`, `composables/` and `utils/` *before* `~~/layers`, so
 * a root file of the same name always wins and the layer's file goes dark
 * with no error at all. Root is therefore one more entrant in the same
 * collision check, not a separate concern.
 */

/** Component, composable and util names a set of files registers globally. */
function registeredNamesIn(files: string[]): { name: string, file: string }[] {
  return files
    .filter((file) => /\/(components|composables|utils)\//.test(file))
    .filter((file) => !file.endsWith('index.ts'))
    .map((file) => ({ name: basename(file).replace(/\.(vue|ts)$/, ''), file: relativeToRepo(file) }))
}

/** Component, composable and util names a layer registers globally. */
function registeredNames(layer: string): { name: string, file: string }[] {
  return registeredNamesIn([...layerFiles(layer, ['.vue']), ...layerFiles(layer, ['.ts'])])
}

/**
 * Component, composable and util names registered at the project root, i.e.
 * outside any layer — `components/OgImage/TeamMember.satori.vue` is the one
 * legitimate example today. Same priority class as a layer's own globals, so
 * it must be checked against them, not just against itself.
 */
function registeredRootNames(): { name: string, file: string }[] {
  return registeredNamesIn(collectSourceFiles(['components',
    'composables',
    'utils'], ['.vue', '.ts']))
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

/**
 * Names claimed by more than one layer, or by root and a layer, as readable
 * `name: fileA, fileB`.
 */
function collisions(layers: string[]): string[] {
  return collisionsIn([
    ...layers.flatMap((layer) => registeredNames(layer)), ...registeredRootNames()
  ])
}

describe('layer name collisions', () => {
  it('detects a name claimed by two layers', () => {
    // Proves the check works before there is anything for it to check. Without
    // this, an empty `layers/` would make the suite below pass vacuously and
    // keep passing after a real collision arrives. Calls the same
    // `collisionsIn()` the real check calls, so a regression there fails here
    // too instead of leaving a stale copy green.
    const found = collisionsIn([
      { name: 'MemberCard', file: 'layers/team/components/MemberCard.vue' }, { name: 'MemberCard', file: 'layers/home/components/MemberCard.vue' },
    ])
    expect(found).toEqual([
      'MemberCard: layers/home/components/MemberCard.vue, layers/team/components/MemberCard.vue',
    ])
  })

  it('detects a root file shadowing a layer component', () => {
    // Root wins Nuxt's resolution order, so this is the more dangerous
    // direction: the layer's file does not merely lose a naming argument, it
    // stops being reachable at all.
    const found = collisionsIn([
      { name: 'Chip', file: 'components/Chip.vue' }, { name: 'Chip', file: 'layers/base/components/Chip.vue' },
    ])
    expect(found).toEqual([
      'Chip: components/Chip.vue, layers/base/components/Chip.vue',
    ])
  })

  it('no component, composable or util name is claimed by two layers, or by root and a layer', () => {
    expect(collisions(layerNames())).toEqual([])
  })
})
