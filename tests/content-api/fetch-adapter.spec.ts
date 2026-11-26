import { describe, expect, it } from 'vitest'
import { CONTENT_METHODS } from '../../layers/content-core/utils/content/contentApi'
import { handleContentQuery } from '../../layers/content-core/utils/content/contentApiHandler'
import { createFetchContentAdapter } from '../../layers/content-core/utils/content/fetchContentAdapter'
import { createNuxtContentAdapter } from '../../layers/content-core/utils/content/nuxtContentAdapter'

/**
 * Rows shaped like what @nuxt/content hands back from SQLite: ISO strings for
 * dates, null for absent columns, JSON columns already parsed.
 */
const ROW = {
  id: 'blog_en/x.md',
  slug: 'x',
  title: 'X',
  pubDate: '2026-03-01T10:00:00.000Z',
  releaseDate: null,
  tags: ['a', 'b'],
  author: null,
  path: '/blog/x',
  stem: 'blog/x',
  gallery: [1],
  schematics: [],
  featured: true,
  projects: ['p'],
  event: { start: '2026-05-01T18:00:00.000Z', end: null }
}

function query() {
  const builder: Record<string, unknown> = {}
  for (const name of ['select',
'where',
'order']) builder[name] = () => builder
  builder.all = async () => [{ ...ROW }]
  builder.first = async () => ({ ...ROW })
  return builder
}

const server = createNuxtContentAdapter((() => query()) as never)

const ARGS: Record<string, unknown[]> = {
  listBlogArticles: ['en'],
  getBlogArticleBySlug: ['en', 'x'],
  getBlogArticleByTranslationKey: ['en', 'k'],
  getAuthorBySlug: ['someone'],
  listAuthorsBySlugs: [['a', 'b']],
  listFaqEntries: ['de'],
  getTeamDocument: ['de'],
  listTeamFaqEntries: ['de'],
  getServerConcept: ['en'],
  getAboutDocument: ['en'],
  getServerConnect: ['en'],
  getHomeCarousel: ['en'],
  getSponsorsDocument: ['en'],
  listCommunityPois: ['en'],
  listFeaturedCommunityPois: ['en'],
  getCommunityPoiBySlug: ['en', 'x'],
  getCommunityPoiByTranslationKey: ['en', 'k'],
  listCommunityPoiEmbedsBySlugs: ['en', ['x']],
  listCommunityPoisByProject: ['en', 'p'],
  listEvents: ['en'],
  listEventSchedules: ['en'],
  getEventBySlug: ['en', 'x'],
  getEventByTranslationKey: ['en', 'k'],
  listProjects: ['en'],
  listProjectsBySlugs: ['en', ['x']],
  getProjectBySlug: ['en', 'x'],
  getProjectByTranslationKey: ['en', 'k']
}

interface Request { url: string, args: string }

/** A $fetch stand-in: the response passes through JSON text and the real handler. */
function loopback(requests: Request[] = []) {
  return async (url: string, options: { query: { args: string } }) => {
    requests.push({ url, args: options.query.args })
    const method = url.split('/').pop()!
    const result = await handleContentQuery(server, method, options.query.args)
    return JSON.parse(JSON.stringify({ result: result ?? null })) as { result: unknown }
  }
}

type Callable = Record<string, (...args: unknown[]) => Promise<unknown>>

describe('fetch adapter', () => {
  it('has argument fixtures for every method', () => {
    expect(Object.keys(ARGS).sort()).toEqual([...CONTENT_METHODS].sort())
  })

  it.each(CONTENT_METHODS)('%s returns what the server adapter returns, after JSON transport', async (method) => {
    const client = createFetchContentAdapter(loopback() as never) as unknown as Callable
    const args = ARGS[method]!
    const fromServer = await (server as unknown as Callable)[method]!(...args)
    const fromClient = await client[method]!(...args)
    expect(fromClient).toStrictEqual(fromServer)
  })

  it('keeps date strings and null fields untouched', async () => {
    const client = createFetchContentAdapter(loopback() as never)
    const article = await client.getBlogArticleBySlug('en', 'x') as unknown as typeof ROW
    expect(article.pubDate).toBe('2026-03-01T10:00:00.000Z')
    expect(article.releaseDate).toBeNull()
  })

  it('requests /api/content/<method> with the arguments as one JSON array in call order', async () => {
    const requests: Request[] = []
    const client = createFetchContentAdapter(loopback(requests) as never)
    await client.getBlogArticleBySlug('de', 'my-slug')
    await client.getBlogArticleBySlug('de', 'my-slug')
    expect(requests).toEqual([
      { url: '/api/content/getBlogArticleBySlug', args: '["de","my-slug"]' }, { url: '/api/content/getBlogArticleBySlug', args: '["de","my-slug"]' }
    ])
  })
})
