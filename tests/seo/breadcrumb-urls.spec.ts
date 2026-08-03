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
 * Checked against the source rather than rendered output because the value is
 * a template literal built per page — nine of them, which is exactly the kind
 * of repetition that drifts.
 */

const SOURCE_DIRS = ['pages', 'composables']

/** `url: \`/${locale.value}/\`` — a locale root with a trailing slash. */
const LOCALE_ROOT_WITH_SLASH = /url:\s*`\/\$\{locale\.value\}\/`/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    const lines = text.split('\n')
    lines.forEach((line, index) => {
      if (LOCALE_ROOT_WITH_SLASH.test(line)) {
        found.push(`${relativeToRepo(file)}:${index + 1}`)
      }
    })
  }
  return found
}

describe('breadcrumb ancestor URLs', () => {
  it('recognises the trailing-slash form', () => {
    // Without this the check could pass by matching nothing at all.
    expect(LOCALE_ROOT_WITH_SLASH.test('{ name: t(\'navigation.home\'), url: `/${locale.value}/` }')).toBe(true)
    expect(LOCALE_ROOT_WITH_SLASH.test('{ name: t(\'navigation.home\'), url: `/${locale.value}` }')).toBe(false)
  })

  it('point at the canonical locale root, without a trailing slash', () => {
    expect(offenders()).toEqual([])
  })
})
