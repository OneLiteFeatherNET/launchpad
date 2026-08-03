import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * `usePageSeo` falls back to the site name when given no `title`, and that one
 * value becomes `<title>`, `og:title` and `twitter:title` at once. Omitting it
 * does not leave the title alone — it overwrites it with the site name.
 *
 * Measured on the dev server before the change:
 *
 *   /de/imprint   <title>OneLiteFeather Network | OneLiteFeather.net</title>
 *   /de/privacy   <title>OneLiteFeather Network | OneLiteFeather.net</title>
 *   /de/blog      <title>Übersicht | OneLiteFeather.net</title>
 *
 * Both legal pages do set a title through `definePageMeta`, which the layout
 * renders via `<Title v-if="routeTitle">` — and `useSeoMeta` wins anyway. So
 * the localised title existed, was declared, and never reached a single one of
 * the three places that show it. A link to /de/imprint shared in Discord read
 * "OneLiteFeather Network".
 *
 * Seven of the nine call sites already pass a title. This makes it nine.
 */

const PAGE_DIRS = ['pages']

/** A `usePageSeo({ … })` call and its option object. */
const CALL = /usePageSeo\(\{([\s\S]*?)\n\}\)/g

function callsWithoutTitle(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(PAGE_DIRS, ['.vue'])) {
    const text = readFileSync(file, 'utf8')
    CALL.lastIndex = 0
    for (const [, options] of text.matchAll(CALL)) {
      if (!/^\s*title:/m.test(options!)) found.push(relativeToRepo(file))
    }
  }
  return found
}

describe('page titles', () => {
  it('finds the calls it is checking', () => {
    // Without this, a renamed composable would make the rule vacuous.
    const total = collectSourceFiles(PAGE_DIRS, ['.vue'])
      .map((file) => readFileSync(file, 'utf8'))
      .reduce((sum, text) => sum + [...text.matchAll(CALL)].length, 0)
    expect(total).toBeGreaterThan(6)

    // And the option detector has to tell the two shapes apart.
    const withTitle = "usePageSeo({\n  title: t('x'),\n  description: 'd'\n})"
    const without = "usePageSeo({\n  description: 'd',\n  robots: 'noindex, follow'\n})"
    CALL.lastIndex = 0
    expect(/^\s*title:/m.test([...withTitle.matchAll(CALL)][0]![1]!)).toBe(true)
    CALL.lastIndex = 0
    expect(/^\s*title:/m.test([...without.matchAll(CALL)][0]![1]!)).toBe(false)
  })

  it('are passed to usePageSeo, not left to the site-name fallback', () => {
    expect(callsWithoutTitle()).toEqual([])
  })
})
