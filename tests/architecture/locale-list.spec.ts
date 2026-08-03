import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'
import { locales } from '../../utils/content/locales'

/**
 * Which languages this site has is one fact, and it decides several things
 * that must agree: the content collections that exist, the URLs the sitemap
 * emits, the `Locale` type. A second copy of the list does not fail when it
 * drifts — it succeeds at producing a smaller sitemap.
 *
 * `server/api/__sitemap__/team.ts` carried its own `['de', 'en']` plus its own
 * `type LocaleKey = 'de' | 'en'`. Adding a third language would have left the
 * team profiles out of that locale's sitemap silently: no error, no missing
 * import, just fewer URLs than pages.
 *
 * The declaration is checked by value rather than by counting the literal
 * `'de', 'en'`, so it keeps working when the list changes.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts',
  'composables',
  'utils',
  'plugins',
  'server',
  'types']

const CANONICAL = 'utils/content/locales.ts'

/** An array or union that spells out every locale code. */
function redeclarations(): string[] {
  const asArray = new RegExp(locales.map((code) => `['"]${code}['"]`).join('\\s*,\\s*'))
  const asUnion = new RegExp(locales.map((code) => `['"]${code}['"]`).join('\\s*\\|\\s*'))

  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.ts', '.vue'])) {
    const relative = relativeToRepo(file)
    if (relative === CANONICAL) continue
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      if (asArray.test(line) || asUnion.test(line)) found.push(`${relative}:${index + 1}`)
    })
  }
  return found
}

describe('locale list', () => {
  it('has one declaration to point at', () => {
    // Without this, a renamed module would make the rule vacuous.
    expect([...locales]).toEqual(['de', 'en'])
    const canonical = readFileSync(`${repoRoot}/${CANONICAL}`, 'utf8')
    expect(canonical).toContain('as const')

    // The patterns must actually recognise both spellings.
    const asArray = new RegExp(locales.map((code) => `['"]${code}['"]`).join('\\s*,\\s*'))
    const asUnion = new RegExp(locales.map((code) => `['"]${code}['"]`).join('\\s*\\|\\s*'))
    expect(asArray.test("const LOCALES = ['de', 'en']")).toBe(true)
    expect(asUnion.test("type LocaleKey = 'de' | 'en'")).toBe(true)
    expect(asArray.test("const key = `team_${locale}`")).toBe(false)
  })

  it('is not spelled out a second time', () => {
    expect(redeclarations()).toEqual([])
  })
})
