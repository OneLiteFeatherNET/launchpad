import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `listBlogArticles` feeds one screen: the blog overview, which renders a
 * headline card and a grid of teasers. Queried without a projection,
 * @nuxt/content builds `SELECT *` and every row arrives with its `body` — the
 * full minimark AST of the article — which is then serialised into the SSR
 * payload so the client can hydrate a list that never displays it.
 *
 * Narrowing the query is the fix, and narrowing is also how it breaks: drop a
 * column a card reads and that card renders an empty slot, silently, on a page
 * nobody type-checks between the query and the template.
 *
 * So this does not merely assert that a projection exists. It reads the fields
 * the overview actually touches out of its own source and requires the
 * projection to cover them — the two ends of the contract, compared.
 */

const ADAPTER = 'utils/content/nuxtContentAdapter.ts'

/** The files that consume a row from `listBlogArticles`. */
const CONSUMERS = ['components/features/blog/page/card/ArticleCard.vue',
  'components/features/blog/page/top1/Top1.vue',
  'pages/blog/index.vue',
  'composables/useBlogContent.ts']

/** The names an article row goes by in those files. */
const ROW_IDENTIFIERS = ['blogArticle',
  'entry',
  'article']

const SELECT_CALL = /listBlogArticles\([\s\S]*?\.select\(([^)]*)\)/
const QUOTED = /'([a-zA-Z][\w]*)'/g

function read(file: string): string {
  return readFileSync(`${repoRoot}/${file}`, 'utf8')
}

/** Field names the projection asks for. */
function projectedFields(): string[] {
  const call = SELECT_CALL.exec(read(ADAPTER))
  if (!call) return []
  return [...call[1]!.matchAll(QUOTED)].map(([, field]) => field!)
}

/**
 * Field names the overview reads off a row.
 *
 * No whitespace is tolerated around the dot. An earlier version allowed it and
 * matched straight through a comment — `"…rendering an empty article.\n  if
 * (slug.value …"` produced a required field called `if`. A property access has
 * no spaces in it; a sentence that happens to end in one of these words does.
 */
function requiredFields(): string[] {
  const names = ROW_IDENTIFIERS.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const access = new RegExp(`\\b(?:${names})[!?]?\\.([a-zA-Z]\\w*)`, 'g')
  const found = new Set<string>()
  for (const file of CONSUMERS) {
    for (const [, field] of read(file).matchAll(access)) found.add(field!)
  }
  // Reads that are not row columns.
  for (const method of ['map',
'filter',
'slice',
'value',
'length',
'getTime',
'sort',
'push']) {
    found.delete(method)
  }
  return [...found].sort()
}

describe('blog overview projection', () => {
  it('finds both ends of the contract', () => {
    // Without this, an empty projection and an empty field list would agree.
    expect(projectedFields().length).toBeGreaterThan(5)
    const required = requiredFields()
    expect(required).toContain('slug')
    expect(required).toContain('headerImage')
    // `releaseDate` is read only by the release-gate helper, never rendered —
    // exactly the kind of column a projection written from the template alone
    // would miss.
    expect(required).toContain('releaseDate')
    // Prose in a comment is not a property access — see requiredFields.
    expect(required).not.toContain('if')
  })

  it('covers every field the overview reads', () => {
    const projected = new Set(projectedFields())
    const missing = requiredFields().filter((field) => !projected.has(field))
    expect(missing).toEqual([])
  })

  it('does not ship the article body to a list view', () => {
    expect(projectedFields()).not.toContain('body')
  })
})
