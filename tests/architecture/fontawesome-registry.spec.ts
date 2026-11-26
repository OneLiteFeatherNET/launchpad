import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import * as solid from '@fortawesome/free-solid-svg-icons'
import * as brands from '@fortawesome/free-brands-svg-icons'
import { findRegisteredIcon } from '../../layers/base/utils/iconRegistry'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Two ways an icon reaches a template. Importing the definition object is
 * self-contained — the bundler sees the reference and keeps it. The string
 * form, `['fas', 'arrow-right']`, is resolved at runtime against a
 * registry, so it works only if `layers/base/utils/iconRegistry.ts` happens to
 * have registered that icon. Miss one and the element renders empty: no error, no
 * warning, just a gap where an icon should be.
 *
 * The plugin states that invariant in a comment. This checks it, and does so
 * by *asking the registry* rather than deriving names from identifiers.
 *
 * That distinction is the whole test. Deriving `faXTwitter` → `xtwitter` gets
 * the name wrong (it is `x-twitter`), and deriving `faEllipsisH` → `ellipsis-h`
 * gets it wrong the other way (it is `ellipsis`, with `ellipsis-h` kept as a
 * Font Awesome 6 alias). A first pass of this check did exactly that and
 * reported four icons as missing that resolve perfectly well. `findRegisteredIcon`
 * is what the browser runs, so it is what decides.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts',
  'composables',
  'utils',
  'layers']

const REGISTRY = 'layers/base/utils/iconRegistry.ts'

/** A `['fas', 'arrow-right']` style reference. */
const STRING_REFERENCE = /\[\s*'(fas|fab|far)'\s*,\s*'([a-z0-9-]+)'\s*\]/g
/** The identifiers listed in the `REGISTERED` array. */
const LIBRARY_CALL = /REGISTERED: IconDefinition\[\] = \[([\s\S]*?)\n\]/
const ICON_IDENTIFIER = /\bfa[A-Z]\w*/g

type IconEntry = { prefix: string, iconName: string }
const definitions = { ...solid, ...brands } as unknown as Record<string, IconEntry>

function registeredIdentifiers(): string[] {
  const source = readFileSync(`${repoRoot}/${REGISTRY}`, 'utf8')
  const call = LIBRARY_CALL.exec(source)
  if (!call) throw new Error(`no REGISTERED array found in ${REGISTRY}`)
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
    const unresolved = [...stringReferences()]
      .filter(([key]) => {
        const [prefix, iconName] = key.split('/')
        return !findRegisteredIcon(prefix!, iconName!)
      })
      .map(([key, files]) => `${key} ← ${[...new Set(files)].join(', ')}`)

    expect(unresolved).toEqual([])
  })
})
