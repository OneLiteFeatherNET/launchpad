import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * `definePageMeta` writes a field, a layout or composable reads it back. Nuxt
 * ships no declaration for the custom ones, so the value arrives as `unknown`
 * from PageMeta's index signature and the reader has to assert what it is.
 *
 * That assertion is the whole contract. It lives at the reading end, where it
 * cannot constrain the pages doing the writing — `definePageMeta({ title: 42 })`
 * compiles, and `t()` is then handed a number at runtime. A cast is not a type
 * check; it is a promise the compiler stops verifying.
 *
 * Augmenting `PageMeta` and `RouteMeta` moves the contract to where both ends
 * see it, so the cast becomes unnecessary rather than merely unfashionable.
 * The two rules below are therefore one rule read from both directions: every
 * field we read must be declared, and no read may paper over a missing
 * declaration with an assertion.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts',
  'composables']
const TYPE_DIRS = ['types']

/** `route.meta.title`, `route.meta?.title` — the read side. */
const META_READ = /\broute\.meta\s*\??\.\s*(\w+)/g
/** The same read followed by an assertion. */
const META_CAST = /\broute\.meta\s*\??\.\s*\w+\s+as\s+\w/g

/** Field names declared inside a `PageMeta` or `RouteMeta` augmentation. */
function declaredFields(): Set<string> {
  const declared = new Set<string>()
  for (const file of collectSourceFiles(TYPE_DIRS, ['.ts', '.d.ts'])) {
    const text = readFileSync(file, 'utf8')
    for (const block of text.matchAll(/interface\s+(?:Page|Route)Meta\s*\{([^}]*)\}/g)) {
      for (const field of block[1]!.matchAll(/^\s*(\w+)\??\s*:/gm)) declared.add(field[1]!)
    }
  }
  return declared
}

function undeclaredReads(): string[] {
  const declared = declaredFields()
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      META_READ.lastIndex = 0
      for (const [, field] of line.matchAll(META_READ)) {
        if (declared.has(field!)) continue
        found.push(`${relativeToRepo(file)}:${index + 1} — route.meta.${field}`)
      }
    })
  }
  return [...new Set(found)]
}

function assertedReads(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      META_CAST.lastIndex = 0
      if (META_CAST.test(line)) found.push(`${relativeToRepo(file)}:${index + 1}`)
    })
  }
  return found
}

describe('route meta contract', () => {
  it('reads meta accesses and augmentations', () => {
    // Without this the checks below could pass by matching nothing at all.
    const line = 'const routeTitle = computed(() => (route.meta?.title ? t(route.meta.title as string) : null))'
    expect([...line.matchAll(META_READ)].map(([, f]) => f)).toEqual(['title', 'title'])
    META_CAST.lastIndex = 0
    expect(META_CAST.test(line)).toBe(true)
    META_CAST.lastIndex = 0
    expect(META_CAST.test('t(route.meta.title)')).toBe(false)

    const augmentation = 'declare module \'#app\' {\n  interface PageMeta {\n    title?: string\n  }\n}'
    const fields = [...augmentation.matchAll(/interface\s+(?:Page|Route)Meta\s*\{([^}]*)\}/g)]
      .flatMap((b) => [...b[1]!.matchAll(/^\s*(\w+)\??\s*:/gm)].map(([, f]) => f))
    expect(fields).toEqual(['title'])
  })

  it('every field read off route.meta is declared', () => {
    expect(undeclaredReads()).toEqual([])
  })

  it('no read asserts its own type', () => {
    expect(assertedReads()).toEqual([])
  })
})
