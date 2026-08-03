import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * A message key that exists in neither locale does not fail loudly. vue-i18n
 * echoes the key itself, or — as here — the call site guards with `te()` and
 * falls back to a hardcoded English string, so German pages quietly ship
 * English text.
 *
 * Keys reach `t()` two ways in this codebase, and checking only the first is
 * how the four missing ones stayed missing:
 *
 *     t('article.share')                    // literal argument
 *     const key = 'content.file'            // via a local constant,
 *     te(key) ? t(key, { … }) : 'File …'    // which is what Prose* does
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
  'composables',
]

/** Dotted lower-camel identifier, e.g. `article.share_on_x`. */
const DOTTED = `[a-z][a-zA-Z0-9_]*(?:\\.[a-zA-Z0-9_]+)+`

const DIRECT_CALL = new RegExp(`\\$?\\b(?:t|te)\\(\\s*[\`'"](${DOTTED})[\`'"]`, 'g')

/** `const key = 'a.b'` — captured so a later t(key) can be resolved. */
const KEY_CONST = new RegExp(`\\bconst\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*[\`'"](${DOTTED})[\`'"]`, 'g')

/** t(identifier) / te(identifier) — the name is resolved against KEY_CONST. */
const INDIRECT_CALL = /\$?\b(?:t|te)\(\s*([A-Za-z_$][\w$]*)\s*[,)]/g

function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, inner]) => flatten(inner, prefix ? `${prefix}.${key}` : key))
}

function localeKeys(locale: string): Set<string> {
  const file = join(repoRoot, `i18n/locales/${locale}.json`)
  return new Set(flatten(JSON.parse(readFileSync(file, 'utf8'))))
}

/** Every message key a file asks for, both call styles resolved. */
function keysUsedIn(text: string): string[] {
  const found = new Set<string>()
  for (const match of text.matchAll(DIRECT_CALL)) {
    if (match[1] !== undefined) found.add(match[1])
  }
  // One name can be bound several times in one file — ProsePre declares
  // `const key` three times, once per block. Keeping only the last binding
  // hid two of the four missing keys, so every binding is collected and all
  // of them count as used. Slightly over-approximate by design: a key that
  // exists is never reported, and this errs toward asking for more keys, not
  // fewer.
  const constants = new Map<string, Set<string>>()
  for (const match of text.matchAll(KEY_CONST)) {
    const name = match[1]
    const key = match[2]
    if (name === undefined || key === undefined) continue
    const bound = constants.get(name) ?? new Set<string>()
    bound.add(key)
    constants.set(name, bound)
  }
  for (const match of text.matchAll(INDIRECT_CALL)) {
    const name = match[1]
    if (name === undefined) continue
    for (const key of constants.get(name) ?? []) found.add(key)
  }
  return [...found]
}

describe('message keys', () => {
  const de = localeKeys('de')
  const en = localeKeys('en')
  const usage = new Map<string, string[]>()
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    for (const key of keysUsedIn(readFileSync(file, 'utf8'))) {
      usage.set(key, (usage.get(key) ?? []).concat(relativeToRepo(file)))
    }
  }

  it('resolves both call styles, including a name bound more than once', () => {
    // The indirect style is what the four missing keys used; without resolving
    // it this suite would report a clean tree while German pages show English.
    // The repeated `key` binding is the shape ProsePre actually has — an
    // earlier version of this helper kept only the last one and so found two
    // of the four.
    const sample = `
      const label = t('article.share')
      if (a) {
        const key = 'content.file'
        const text = te(key) ? t(key, { filename }) : 'File'
      }
      if (b) {
        const key = 'content.codeIn'
        const text = te(key) ? t(key, { language }) : 'Code in'
      }
    `
    const expected = [
      'article.share',
      'content.codeIn',
      'content.file',
    ]
    expect(keysUsedIn(sample).sort()).toEqual(expected)
  })

  it('finds keys in use', () => {
    expect(usage.size).toBeGreaterThan(50)
  })

  it('every key used exists in German', () => {
    const missing = [...usage.keys()].filter((key) => !de.has(key)).sort()
    expect(missing).toEqual([])
  })

  it('every key used exists in English', () => {
    const missing = [...usage.keys()].filter((key) => !en.has(key)).sort()
    expect(missing).toEqual([])
  })

  it('both locales declare the same keys', () => {
    // Parity is already exact; pinning it means a key added to one locale
    // cannot silently ship without its counterpart.
    const onlyDe = [...de].filter((key) => !en.has(key)).sort()
    const onlyEn = [...en].filter((key) => !de.has(key)).sort()
    expect({ onlyDe, onlyEn }).toEqual({ onlyDe: [], onlyEn: [] })
  })
})
