import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'
import { locales } from '../../utils/content/locales'

/**
 * `toLocaleDateString('de-DE', …)` produces a German date whatever language
 * the page is in. On `/en` the carousel showed `15. Jan.` beside English
 * headings, and event times in a 24-hour German clock.
 *
 * The blog cards already do this right, through vue-i18n's `d()`. The carousel
 * needs option objects `d()` cannot express without named `datetimeFormats`
 * entries — `{ day: '2-digit' }` alone for the day tile, `{ month: 'short' }`
 * alone beneath it — so it keeps `toLocaleDateString` and passes the *active*
 * locale instead of a fixed one. Same call, one argument different.
 *
 * The rule is written against the locale list rather than the literal
 * `'de-DE'`, so adding a third language cannot leave a new hardcoded tag
 * behind unnoticed.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts',
  'composables']

/** `toLocaleDateString('de-DE'` / `toLocaleTimeString("en-US"` … */
const FIXED_LOCALE_FORMAT = /toLocale(?:Date|Time|)String\(\s*['"]([a-z]{2}(?:-[A-Z]{2})?)['"]/g

function hardcodedFormatters(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const relative = relativeToRepo(file)
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      FIXED_LOCALE_FORMAT.lastIndex = 0
      for (const [, tag] of line.matchAll(FIXED_LOCALE_FORMAT)) {
        found.push(`${relative}:${index + 1} — pinned to ${tag}`)
      }
    })
  }
  return found
}

describe('date formatting', () => {
  it('recognises a pinned locale tag', () => {
    // Without this the check could pass by matching nothing at all.
    const hits = (line: string) => {
      FIXED_LOCALE_FORMAT.lastIndex = 0
      return [...line.matchAll(FIXED_LOCALE_FORMAT)].map(([, tag]) => tag)
    }
    expect(hits("d.toLocaleDateString('de-DE', { month: 'short' })")).toEqual(['de-DE'])
    expect(hits('x.toLocaleTimeString("en-US", { hour: "2-digit" })')).toEqual(['en-US'])
    // The active locale, which is the point.
    expect(hits('d.toLocaleDateString(locale.value, { month: \'short\' })')).toEqual([])
    // vue-i18n's own formatter takes no locale argument at all.
    expect(hits('{{ d(new Date(article.pubDate)) }}')).toEqual([])

    // And the rule must know which tags belong to this site.
    expect([...locales]).toEqual(['de', 'en'])
  })

  it('follows the reader, not a fixed language', () => {
    expect(hardcodedFormatters()).toEqual([])
  })
})
