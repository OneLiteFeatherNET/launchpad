import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Frontmatter that does not parse fails silently and partially.
 *
 * A megabase entry shipped with `summary: 'B3nNy\'s largest undertaking: …'`.
 * In a single-quoted YAML scalar an apostrophe is escaped by doubling it, not
 * with a backslash, so the string ended early and the rest of the line became a
 * second mapping key. Everything below that line — status, progress, category,
 * the whole gallery — was never read.
 *
 * On the page it showed up as a status badge reading
 * `community_poi.status.null`, because the missing value was interpolated
 * straight into an i18n key. A harbour caption went the same way and rendered
 * as raw JSON: `{ "Reference (someone else\\": "exterior views …" }`.
 *
 * Nothing caught it. The build passed, `@nuxt/content` swallowed the malformed
 * document rather than failing, and all 177 tests stayed green — every one of
 * them reads these files as text and none of them parses the frontmatter.
 *
 * So this suite parses it, strictly, and asserts that the fields the templates
 * interpolate really arrived as the type they are used as. Type checks matter
 * as much as the parse: a broken quote does not always throw, it can just as
 * easily hand back an object where a string was expected, which is exactly what
 * the harbour caption did.
 */

const CONTENT_DIRS = ['content']

/** Every markdown document under content/, with its frontmatter block. */
function documents(): { file: string, frontmatter: string }[] {
  return collectSourceFiles(CONTENT_DIRS, ['.md'])
    .map((file) => ({ file, text: readFileSync(file, 'utf8') }))
    .filter((doc) => doc.text.startsWith('---'))
    .map((doc) => ({
      file: relativeToRepo(doc.file),
      // Between the first and second `---`. Splitting on the delimiter would
      // also cut on any `---` inside the body, so slice explicitly.
      frontmatter: doc.text.slice(3, doc.text.indexOf('\n---', 3)),
    }))
}

describe('content frontmatter', () => {
  it('finds documents to check', () => {
    // Without this the suite passes vacuously if the traversal ever breaks.
    expect(documents().length).toBeGreaterThan(20)
  })

  it('parses as YAML in every document', () => {
    const failures: string[] = []
    for (const doc of documents()) {
      try {
        parse(doc.frontmatter)
      } catch (error) {
        const message = error instanceof Error ? error.message.split('\n')[0] : String(error)
        failures.push(`${doc.file}: ${message}`)
      }
    }
    expect(failures.sort()).toEqual([])
  })

  it('detects a backslash-escaped apostrophe', () => {
    // The exact mistake that shipped, pinned so this check cannot be
    // "simplified" into something that would let it through again.
    expect(() => parse("summary: 'B3nNy\\'s largest undertaking: a site'")).toThrow()
    expect(parse("summary: 'B3nNy''s largest undertaking'").summary)
      .toBe("B3nNy's largest undertaking")
  })

  it('gives every community POI a string status the badge can name', () => {
    // `CommunityPoiStatusBadge` interpolates this into
    // `t('community_poi.status.' + status)`. A missing value does not throw —
    // it renders the key itself, in a badge, on a public page.
    const wrong: string[] = []
    for (const doc of documents()) {
      if (!doc.file.startsWith('content/community-poi/')) continue
      const data = parse(doc.frontmatter) as Record<string, unknown>
      if (typeof data.status !== 'string') {
        wrong.push(`${doc.file}: status is ${JSON.stringify(data.status)}`)
      }
    }
    expect(wrong.sort()).toEqual([])
  })

  it('keeps gallery captions and alt text as strings', () => {
    // A caption that parses into an object still renders — as `[object Object]`
    // or, in the case that shipped, as visible JSON braces in the figure.
    const wrong: string[] = []
    for (const doc of documents()) {
      const data = parse(doc.frontmatter) as Record<string, unknown>
      const gallery = data.gallery
      if (!Array.isArray(gallery)) continue
      gallery.forEach((entry, index) => {
        const item = entry as Record<string, unknown>
        if (typeof item.alt !== 'string') {
          wrong.push(`${doc.file}: gallery[${index}].alt is ${JSON.stringify(item.alt)}`)
        }
        if (item.caption !== undefined && typeof item.caption !== 'string') {
          wrong.push(`${doc.file}: gallery[${index}].caption is ${JSON.stringify(item.caption)}`)
        }
      })
    }
    expect(wrong.sort()).toEqual([])
  })
})
