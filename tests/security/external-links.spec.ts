import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * A link opened with `target="_blank"` hands the new tab a `window.opener`
 * reference to this page unless `rel="noopener"` says otherwise. The opened
 * site can then navigate the original tab — reverse tabnabbing — and without
 * `noreferrer` it also learns the exact URL the visitor came from. On the
 * privacy page that referrer is itself the disclosure.
 *
 * Modern browsers imply `noopener` for `target="_blank"`, but that is a
 * default, not a guarantee: it does not cover `noreferrer`, and older or
 * embedded webviews still pass the opener.
 *
 * The check has to look at whole elements. Grepping line by line reports
 * every multi-line link in this codebase as a violation, because `rel` sits on
 * a different line from `target` — a false-positive rate that would bury the
 * two real cases.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

/** Opening tags of anchors and NuxtLinks, attributes included. */
const LINK_ELEMENT = /<(?:a|NuxtLink)\b[^>]*>/gs
const OPENS_NEW_TAB = /target=["']_blank["']/
const HAS_NOOPENER = /rel=["'][^"']*noopener/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue'])) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(LINK_ELEMENT)) {
      const element = match[0]
      if (!OPENS_NEW_TAB.test(element)) continue
      if (HAS_NOOPENER.test(element)) continue
      const line = text.slice(0, match.index).split('\n').length
      found.push(`${relativeToRepo(file)}:${line}`)
    }
  }
  return found
}

describe('external links', () => {
  it('matches whole elements, not lines', () => {
    // The multi-line form is the common one here; a line-based check calls it
    // a violation and drowns the real findings.
    const multiline = '<a\n  href="https://x"\n  target="_blank"\n  rel="noopener noreferrer"\n>'
    const missing = '<a href="https://x" target="_blank">'
    expect(OPENS_NEW_TAB.test(multiline) && HAS_NOOPENER.test(multiline)).toBe(true)
    expect(OPENS_NEW_TAB.test(missing) && HAS_NOOPENER.test(missing)).toBe(false)
  })

  it('finds links to check', () => {
    const total = collectSourceFiles(SOURCE_DIRS, ['.vue'])
      .flatMap((file) => [...readFileSync(file, 'utf8').matchAll(LINK_ELEMENT)])
      .filter((match) => OPENS_NEW_TAB.test(match[0]))
    expect(total.length).toBeGreaterThan(10)
  })

  it('always pair target=_blank with rel=noopener', () => {
    expect(offenders()).toEqual([])
  })
})
