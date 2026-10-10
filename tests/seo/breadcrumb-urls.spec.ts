import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Breadcrumb JSON-LD tells search engines which URL each ancestor lives at.
 * When that differs from the page's own canonical, the two disagree about the
 * same document.
 *
 * Measured live before the fix:
 *
 *   canonical on /de       https://onelitefeather.net/de
 *   breadcrumb item        https://onelitefeather.net/de/
 *
 * `/de/` answers 200 rather than redirecting, so both URLs exist and every
 * subpage was pointing its ancestor at the non-canonical one. Nuxt does not
 * append a trailing slash by default and nothing here overrides that, so the
 * canonical form is the one without.
 *
 * The same holds for every locale-prefixed index URL, not only the locale
 * root: the community POI index was `/de/community-poi/` in its breadcrumb,
 * and the team index was built with a trailing slash as a fallback in
 * ItemList and Person schema. Checked against the source because the values
 * are template literals built per page.
 */

const SOURCE_DIRS = ['pages',
'composables',
'layers']

/** A locale-prefixed template literal ending in a slash, e.g. `/${locale.value}/team/`. */
const LOCALE_PATH_WITH_SLASH = /`\/\$\{locale(?:\.value)?\}[^`]*\/`/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    const lines = text.split('\n')
    lines.forEach((line, index) => {
      if (LOCALE_PATH_WITH_SLASH.test(line)) {
        found.push(`${relativeToRepo(file)}:${index + 1}`)
      }
    })
  }
  return found
}

describe('breadcrumb ancestor URLs', () => {
  it('recognises the trailing-slash forms', () => {
    // Without this the check could pass by matching nothing at all.
    expect(LOCALE_PATH_WITH_SLASH.test('{ name: t(\'navigation.home\'), url: `/${locale.value}/` }')).toBe(true)
    expect(LOCALE_PATH_WITH_SLASH.test('{ url: `/${locale.value}/community-poi/` }')).toBe(true)
    expect(LOCALE_PATH_WITH_SLASH.test('{ name: t(\'navigation.home\'), url: `/${locale.value}` }')).toBe(false)
    expect(LOCALE_PATH_WITH_SLASH.test('{ url: `/${locale.value}/community-poi` }')).toBe(false)
  })

  it('point at canonical locale-prefixed URLs, without a trailing slash', () => {
    expect(offenders()).toEqual([])
  })
})
