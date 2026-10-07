import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * `/<locale>/blog/author/<slug>` is a static route segment and beats the
 * article catch-all, so an article whose slug is `author` could never be
 * opened. Nothing else would notice.
 */

const RESERVED = 'author'

export function reservedSlugProblems(docs: { file: string, slug: unknown }[]): string[] {
  return docs
    .filter((doc) => doc.slug === RESERVED)
    .map((doc) => `${doc.file}: slug "${RESERVED}" is reserved for /blog/author/<slug>`)
}

function blogDocuments(): { file: string, slug: unknown }[] {
  return collectSourceFiles(['content/blog'], ['.md']).map((file) => {
    const text = readFileSync(file, 'utf8')
    const data = (parse(text.slice(3, text.indexOf('\n---', 3))) ?? {}) as { slug?: unknown }
    return { file: relativeToRepo(file), slug: data.slug }
  })
}

describe('blog article slugs', () => {
  it('names the file of an article that takes the reserved slug', () => {
    const problems = reservedSlugProblems([
      { file: 'content/blog/de/author.md', slug: 'author' }, { file: 'content/blog/de/other.md', slug: 'other' },
    ])
    expect(problems).toEqual([
      'content/blog/de/author.md: slug "author" is reserved for /blog/author/<slug>',
    ])
  })

  it('accepts slugs that merely contain the word', () => {
    expect(reservedSlugProblems([{ file: 'a.md', slug: 'author-interview' }])).toEqual([])
  })

  it('reads the blog files', () => {
    expect(blogDocuments().length).toBeGreaterThan(5)
  })

  it('keeps every real article off the reserved slug', () => {
    expect(reservedSlugProblems(blogDocuments())).toEqual([])
  })
})
