import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * In @nuxt/content v3 the zod schema is a DDL: each declared field becomes a
 * column. A frontmatter key the schema does not declare is not rejected and
 * not type-checked — it lands in the catch-all `meta` JSON blob, so reading it
 * yields `undefined` and filtering on it fails with "no such column".
 *
 * types/blog.ts widens the generated collection type with hand-written fields.
 * That compiles and type-checks whether or not the schema declares them, which
 * is how three of them ended up always undefined at runtime:
 *
 *   releaseDate  read by useBlogContent for release gating, which therefore
 *                always fell through to pubDate
 *   seo          read by useArticleSeo to override the meta title, so the
 *                override never applied
 *   head         spread into useHead on the article page, always empty
 *
 * The type is the right place to check: it is where a field gets promised to
 * the rest of the codebase.
 */

/**
 * Fields legitimately absent from the collection's own schema.
 *
 * Verified against the built SQL dump rather than assumed — `seo` and `head`
 * look exactly like the broken cases in review, and an earlier revision of
 * this change "fixed" them by declaring `seo` and deleting `head` from the
 * type. Both were wrong: the dump shows the columns present on plain `main`.
 */
const NOT_FROM_SCHEMA = new Set([
  // Attached at runtime: useBlogContent resolves author slugs against the
  // authors collection, so this is never in a markdown file.
  'authors',
  // Built into every @nuxt/content page collection. Declaring `seo` here
  // would replace the built-in shape with a narrower one.
  'seo',
  'head',
])

function blogTypeFields(): string[] {
  const text = readFileSync(join(repoRoot, 'types/blog.ts'), 'utf8')
  const block = /export type BlogArticle =[\s\S]*?\)\s*&\s*\{([\s\S]*?)\n\}/.exec(text)?.[1]
  if (block === undefined) throw new Error('BlogArticle shape not found in types/blog.ts')
  return [...block.matchAll(/^\s{2}(\w+)\??:/gm)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined)
}

const BLOG_SCHEMA = /const blogSchema = withI18nMeta\(z\.object\(\{([\s\S]*?)\n {2}\}\)\)/

function blogSchemaFields(): string[] {
  const text = readFileSync(join(repoRoot, 'content.config.ts'), 'utf8')
  const block = BLOG_SCHEMA.exec(text)?.[1]
  if (block === undefined) throw new Error('blogSchema not found in content.config.ts')
  const own = [...block.matchAll(/^\s{4}(\w+):/gm)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined)
  // withI18nMeta adds these to every collection it wraps.
  return own.concat([
    'translationKey',
    'canonical',
    'alternates',
  ])
}

describe('blog frontmatter columns', () => {
  it('parses both declarations', () => {
    // A broken regex here would silently turn the check below into a no-op.
    expect(blogTypeFields().length).toBeGreaterThan(3)
    expect(blogSchemaFields().length).toBeGreaterThan(8)
  })

  it('every field BlogArticle promises exists as a column', () => {
    const columns = new Set(blogSchemaFields())
    const missing = blogTypeFields()
      .filter((field) => !NOT_FROM_SCHEMA.has(field))
      .filter((field) => !columns.has(field))
      .sort()
    expect(missing).toEqual([])
  })
})
