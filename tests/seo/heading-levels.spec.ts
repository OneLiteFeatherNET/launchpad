import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/** A page has one main heading; on the blog overview it is the page name. */
const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')
const count = (source: string, pattern: RegExp) => (source.match(pattern) ?? []).length

describe('blog overview headings', () => {
  it('has exactly one <h1> in the page', () => {
    expect(count(read('pages/blog/index.vue'), /<h1[\s>]/g)).toBe(1)
  })

  it('shows the top article title as an <h2> with its type token', () => {
    const top = read('layers/blog/components/Top1.vue')
    expect(top).not.toMatch(/<h1[\s>]/)
    expect(top).toMatch(/<h2 class="[^"]*text-headline-small/)
  })

  it('keeps <h1> out of the article cards', () => {
    expect(read('layers/blog/components/ArticleCard.vue')).not.toMatch(/<h1[\s>]/)
  })
})
