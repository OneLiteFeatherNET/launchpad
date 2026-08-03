import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import * as solid from '@fortawesome/free-solid-svg-icons'
import * as brands from '@fortawesome/free-brands-svg-icons'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Two ways an icon reaches a template. Importing the definition object is
 * self-contained — the bundler sees the reference and keeps it. The string
 * form, `['fas', 'arrow-right']`, is resolved at runtime against a global
 * registry, so it works only if `plugins/fontawesome.ts` happens to have
 * registered that icon. Miss one and the element renders empty: no error, no
 * warning, just a gap where an icon should be.
 *
 * The plugin states that invariant in a comment. This checks it, and does so
 * by *asking the library* rather than deriving names from identifiers.
 *
 * That distinction is the whole test. Deriving `faXTwitter` → `xtwitter` gets
 * the name wrong (it is `x-twitter`), and deriving `faEllipsisH` → `ellipsis-h`
 * gets it wrong the other way (it is `ellipsis`, with `ellipsis-h` kept as a
 * Font Awesome 6 alias). A first pass of this check did exactly that and
 * reported four icons as missing that resolve perfectly well. `library.add`
 * plus `findIconDefinition` is what the browser runs, so it is what decides.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts',
  'composables',
  'utils']

const PLUGIN = 'plugins/fontawesome.ts'

/** A `['fas', 'arrow-right']` style reference. */
const STRING_REFERENCE = /\[\s*'(fas|fab|far)'\s*,\s*'([a-z0-9-]+)'\s*\]/g
/** The identifiers handed to `library.add(…)`. */
const LIBRARY_CALL = /library\.add\(([\s\S]*?)\n\)/
const ICON_IDENTIFIER = /\bfa[A-Z]\w*/g

type IconEntry = { prefix: string, iconName: string }
const definitions = { ...solid, ...brands } as unknown as Record<string, IconEntry>

function registeredIdentifiers(): string[] {
  const source = readFileSync(`${repoRoot}/${PLUGIN}`, 'utf8')
  const call = LIBRARY_CALL.exec(source)
  if (!call) throw new Error(`no library.add(…) found in ${PLUGIN}`)
  return [...call[1]!.matchAll(ICON_IDENTIFIER)].map(([id]) => id)
}

function stringReferences(): Map<string, string[]> {
  const found = new Map<string, string[]>()
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    for (const [, prefix,
name] of text.matchAll(STRING_REFERENCE)) {
      const key = `${prefix}/${name}`
      found.set(key, (found.get(key) ?? []).concat(relativeToRepo(file)))
    }
  }
  return found
}

describe('font awesome registry', () => {
  const identifiers = registeredIdentifiers()

  it('finds both sides of the invariant', () => {
    // Without this, an empty registry and an empty corpus would agree.
    expect(identifiers.length).toBeGreaterThan(30)
    expect(stringReferences().size).toBeGreaterThan(20)
    expect(identifiers).toContain('faXTwitter')

    // The names are read from the package, not guessed from the identifier —
    // both of these would come out wrong under a kebab-case conversion.
    expect(definitions.faXTwitter!.iconName).toBe('x-twitter')
    expect(definitions.faEllipsisH!.iconName).toBe('ellipsis')
  })

  it('registers every identifier it names', () => {
    const unknown = identifiers.filter((id) => !definitions[id])
    expect(unknown).toEqual([])
  })

  it('resolves every icon referenced by string', () => {
    library.add(...identifiers.map((id) => definitions[id] as never))

    const unresolved = [...stringReferences()]
      .filter(([key]) => {
        const [prefix, iconName] = key.split('/')
        return !findIconDefinition({ prefix, iconName } as never)
      })
      .map(([key, files]) => `${key} ← ${[...new Set(files)].join(', ')}`)

    expect(unresolved).toEqual([])
  })
})
