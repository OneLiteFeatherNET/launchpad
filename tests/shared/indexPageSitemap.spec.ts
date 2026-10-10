import { describe, expect, it } from 'vitest'
import { indexPageSitemapEntries } from '../../shared/utils/indexPageSitemap'
import { newestDate } from '../../shared/utils/sitemapDates'

const NOW = new Date('2026-06-01T12:00:00Z')
const at = (iso: string) => new Date(iso)

describe('newestDate', () => {
  it('returns the latest of several dates', () => {
    const dates = [
      '2025-01-01T00:00:00Z',
      at('2026-03-01T00:00:00Z'),
      undefined,
    ]
    expect(newestDate(dates)).toEqual(at('2026-03-01T00:00:00Z'))
  })

  it('is undefined when no date is usable', () => {
    const dates = [
      undefined,
      null,
      'soon',
    ]
    expect(newestDate(dates)).toBeUndefined()
  })
})

describe('indexPageSitemapEntries', () => {
  it('gives the blog index the newest modified date of its released articles', () => {
    const older = { slug: 'alt', pubDate: '2025-01-01T00:00:00Z', updatedDate: '2026-02-01T00:00:00Z' }
    const newer = { slug: 'neu', pubDate: '2026-03-01T00:00:00Z' }
    const entries = indexPageSitemapEntries({
      de: { articles: [older, newer], projects: [], pois: [] },
    }, NOW)
    expect(entries).toEqual([{ loc: '/de/blog', lastmod: at('2026-03-01T00:00:00Z') }])
  })

  it('ignores an article that is not released yet when dating the blog index', () => {
    const entries = indexPageSitemapEntries({
      de: {
        articles: [
          { slug: 'bald', pubDate: '2026-01-01T00:00:00Z', releaseDate: '2026-12-01T00:00:00Z' },
        ],
        projects: [],
        pois: [],
      },
    }, NOW)
    expect(entries.map((entry) => entry.loc)).not.toContain('/de/blog')
  })

  it('gives the projects index the newest updatedAt of its projects', () => {
    const entries = indexPageSitemapEntries({
      en: {
        articles: [],
        projects: [
          { slug: 'a', updatedAt: '2026-01-10T00:00:00Z' },
          { slug: 'b', updatedAt: '2026-04-02T00:00:00Z' },
          { slug: 'c' },
        ],
        pois: [],
      },
    }, NOW)
    expect(entries).toEqual([{ loc: '/en/projects', lastmod: at('2026-04-02T00:00:00Z') }])
  })

  it('dates a community POI by updatedAt, falling back to startedAt', () => {
    const startedOnly = { slug: 'a', startedAt: '2026-05-01T00:00:00Z' }
    const edited = { slug: 'b', updatedAt: '2026-02-01T00:00:00Z', startedAt: '2025-01-01T00:00:00Z' }
    const entries = indexPageSitemapEntries({
      de: { articles: [], projects: [], pois: [startedOnly, edited] },
    }, NOW)
    expect(entries).toEqual([{ loc: '/de/community-poi', lastmod: at('2026-05-01T00:00:00Z') }])
  })

  it('omits an index whose items carry no date', () => {
    expect(indexPageSitemapEntries({
      de: { articles: [], projects: [{ slug: 'a' }], pois: [{ slug: 'b' }] },
    }, NOW)).toEqual([])
  })

  it('dates each locale from its own items', () => {
    const entries = indexPageSitemapEntries({
      de: { articles: [{ slug: 'a', pubDate: '2026-01-01T00:00:00Z' }], projects: [], pois: [] },
      en: { articles: [{ slug: 'b', pubDate: '2026-02-01T00:00:00Z' }], projects: [], pois: [] },
    }, NOW)
    const [de, en] = entries
    expect(de).toEqual({ loc: '/de/blog', lastmod: at('2026-01-01T00:00:00Z') })
    expect(en).toEqual({ loc: '/en/blog', lastmod: at('2026-02-01T00:00:00Z') })
  })
})
