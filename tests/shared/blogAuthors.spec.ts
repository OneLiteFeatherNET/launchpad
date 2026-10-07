import { describe, expect, it } from 'vitest'
import { resolvePersonFrom } from '../../layers/content-core/utils/content/person'
import {
  articlesByAuthor,
  blogAuthorSitemapEntries,
  authorSlugsOf,
  isReleasedAt,
  releasedAuthorSlugs,
} from '../../shared/utils/blogAuthors'

const NOW = new Date('2026-06-01T12:00:00Z')

const post = (slug: string, overrides: Record<string, unknown> = {}) => ({
  slug,
  pubDate: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('isReleasedAt', () => {
  it('releases an article whose releaseDate has passed', () => {
    expect(isReleasedAt(post('a', { releaseDate: '2026-05-31T00:00:00Z' }), NOW)).toBe(true)
  })

  it('holds back an article whose releaseDate is in the future', () => {
    expect(isReleasedAt(post('a', { releaseDate: '2026-06-02T00:00:00Z' }), NOW)).toBe(false)
  })

  it('falls back to pubDate when there is no releaseDate', () => {
    expect(isReleasedAt(post('a', { pubDate: '2026-07-01T00:00:00Z' }), NOW)).toBe(false)
  })

  it('releases an article without any date', () => {
    expect(isReleasedAt({ slug: 'a' }, NOW)).toBe(true)
  })

  it('releases an article whose date does not parse', () => {
    expect(isReleasedAt(post('a', { releaseDate: 'soon' }), NOW)).toBe(true)
  })

  it('accepts Date values as stored by the content module', () => {
    expect(isReleasedAt(post('a', { releaseDate: new Date('2026-06-01T12:00:00Z') }), NOW)).toBe(true)
  })
})

describe('authorSlugsOf', () => {
  it('reads a single author given as a string', () => {
    expect(authorSlugsOf({ author: 'a' })).toEqual(['a'])
  })

  it('keeps the order of a list', () => {
    expect(authorSlugsOf({ author: ['b', 'a'] })).toEqual(['b', 'a'])
  })

  it('is empty without an author', () => {
    expect(authorSlugsOf({})).toEqual([])
  })
})

describe('articlesByAuthor', () => {
  it('finds an article whose author is a string', () => {
    const found = articlesByAuthor([post('a', { author: 'x' }), post('b', { author: 'y' })], 'x', NOW)
    expect(found.map((a) => a.slug)).toEqual(['a'])
  })

  it('finds an article whose author list contains the slug', () => {
    const found = articlesByAuthor([post('a', { author: ['x', 'gast'] })], 'gast', NOW)
    expect(found.map((a) => a.slug)).toEqual(['a'])
  })

  it('leaves out an article that is not released yet', () => {
    const found = articlesByAuthor([
      post('a', { author: 'x', releaseDate: '2026-07-01T00:00:00Z' }), post('b', { author: 'x' }),
    ], 'x', NOW)
    expect(found.map((a) => a.slug)).toEqual(['b'])
  })

  it('lists the newest article first', () => {
    const found = articlesByAuthor([
      post('old', { author: 'x', pubDate: '2025-01-01T00:00:00Z' }),
      post('new', { author: 'x', pubDate: '2026-03-01T00:00:00Z' }),
      post('mid', { author: 'x', pubDate: '2025-09-01T00:00:00Z' }),
    ], 'x', NOW)
    expect(found.map((a) => a.slug)).toEqual(['new',
'mid',
'old'])
  })

  it('orders by releaseDate when it differs from pubDate', () => {
    const found = articlesByAuthor([
      post('a', { author: 'x', pubDate: '2026-01-01T00:00:00Z', releaseDate: '2026-05-01T00:00:00Z' }), post('b', { author: 'x', pubDate: '2026-04-01T00:00:00Z' }),
    ], 'x', NOW)
    expect(found.map((a) => a.slug)).toEqual(['a', 'b'])
  })

  it('does not modify the input order', () => {
    const input = [post('old', { author: 'x', pubDate: '2025-01-01T00:00:00Z' }), post('new', { author: 'x' })]
    articlesByAuthor(input, 'x', NOW)
    expect(input.map((a) => a.slug)).toEqual(['old', 'new'])
  })
})

describe('releasedAuthorSlugs', () => {
  it('collects each author of released articles once, in first-seen order', () => {
    const slugs = releasedAuthorSlugs([
      post('a', { author: ['x', 'y'] }),
      post('b', { author: 'x' }),
      post('c', { author: 'z' }),
    ], NOW)
    expect(slugs).toEqual(['x',
'y',
'z'])
  })

  it('ignores authors of articles that are not released', () => {
    const slugs = releasedAuthorSlugs([
      post('a', { author: 'x' }), post('b', { author: 'later', releaseDate: '2026-12-01T00:00:00Z' }),
    ], NOW)
    expect(slugs).toEqual(['x'])
  })
})

describe('blogAuthorSitemapEntries', () => {
  const de = {
    articles: [post('a', { author: ['tp', 'gast'] }), post('b', { author: 'nobody' })],
    resolvable: ['tp', 'gast'],
  }

  it('lists one entry per author with a released article', () => {
    const entries = blogAuthorSitemapEntries({ de }, NOW)
    expect(entries).toEqual([{ loc: '/de/blog/author/tp' }, { loc: '/de/blog/author/gast' }])
  })

  it('leaves out an author that resolves to nobody', () => {
    const entries = blogAuthorSitemapEntries({ de }, NOW)
    expect(entries.map((entry) => entry.loc)).not.toContain('/de/blog/author/nobody')
  })

  it('leaves out an author whose only article is not released', () => {
    const entries = blogAuthorSitemapEntries({
      de: {
        articles: [post('a', { author: 'tp', releaseDate: '2026-12-01T00:00:00Z' })],
        resolvable: ['tp'],
      },
    }, NOW)
    expect(entries).toEqual([])
  })

  it('lists a person only in the languages where an article exists', () => {
    const entries = blogAuthorSitemapEntries({
      de,
      en: { articles: [], resolvable: ['tp'] },
    }, NOW)
    expect(entries.map((entry) => entry.loc)).not.toContain('/en/blog/author/tp')
  })

  it('uses the path the author page links to', () => {
    const [entry] = blogAuthorSitemapEntries({ en: { articles: [post('a', { author: 'gast' })], resolvable: ['gast'] } }, NOW)
    const person = resolvePersonFrom('gast', 'en', { team: null, authors: [{ slug: 'gast', name: 'Gast' }] })
    expect(entry?.loc).toBe(person?.profilePath)
  })
})
