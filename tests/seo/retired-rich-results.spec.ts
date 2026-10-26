import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Google retired FAQ rich results in May 2026. A FAQPage node now only adds a
 * second page node beside the WebPage, so no source may register one.
 */

const FAQ_PAGE_LITERAL = /['"]FAQPage['"]/

const sourceFiles = [
  ...collectSourceFiles(
    [
      'layers',
      'pages',
      'layouts',
    ],
    ['.ts', '.vue'],
  ),
  `${repoRoot}/app.vue`,
]

describe('retired FAQPage markup', () => {
  it('matches the FAQPage literal in a schema row', () => {
    expect("      '@type': 'FAQPage',").toMatch(FAQ_PAGE_LITERAL)
  })

  it('scans a non-empty set of source files', () => {
    expect(sourceFiles.length).toBeGreaterThan(0)
  })

  it('registers no FAQPage in any source file', () => {
    const offenders = sourceFiles
      .filter((file) => FAQ_PAGE_LITERAL.test(readFileSync(file, 'utf8')))
      .map(relativeToRepo)
    expect(offenders).toEqual([])
  })
})
