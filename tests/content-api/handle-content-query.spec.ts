import { describe, expect, it, vi } from 'vitest'
import { ContentQueryError, handleContentQuery } from '../../layers/content-core/utils/content/contentApiHandler'
import { CONTENT_METHODS } from '../../layers/content-core/utils/content/contentApi'
import { createNuxtContentAdapter } from '../../layers/content-core/utils/content/nuxtContentAdapter'

const fakeRepository = () => ({
  listBlogArticles: vi.fn(async () => [{ slug: 'a' }]),
  getBlogArticleBySlug: vi.fn(async () => null),
  listAuthorsBySlugs: vi.fn(async () => [])
})

const failure = async (run: () => Promise<unknown>): Promise<ContentQueryError> => {
  try {
    await run()
  } catch (error) {
    expect(error).toBeInstanceOf(ContentQueryError)
    return error as ContentQueryError
  }
  throw new Error('expected a ContentQueryError, got a result')
}

describe('handleContentQuery', () => {
  it('returns the repository result for an allowed method', async () => {
    const repository = fakeRepository()
    const result = await handleContentQuery(repository as never, 'listBlogArticles', JSON.stringify(['en']))
    expect(result).toEqual([{ slug: 'a' }])
    expect(repository.listBlogArticles).toHaveBeenCalledWith('en')
  })

  it('passes a null result through', async () => {
    const result = await handleContentQuery(fakeRepository() as never, 'getBlogArticleBySlug', JSON.stringify(['en', 'nope']))
    expect(result).toBeNull()
  })

  it('answers 404 for a method the repository does not have', async () => {
    const error = await failure(() => handleContentQuery(fakeRepository() as never, 'dropTables', '[]'))
    expect(error.status).toBe(404)
  })

  it('answers 404 for names inherited from Object.prototype', async () => {
    const error = await failure(() => handleContentQuery(fakeRepository() as never, 'constructor', '[]'))
    expect(error.status).toBe(404)
  })

  it.each([
    ['unknown locale', JSON.stringify(['fr'])],
    ['missing arguments', JSON.stringify([])],
    ['too many arguments', JSON.stringify(['en', 'x'])],
    ['not JSON', 'not-json'],
    ['not an array', JSON.stringify({ locale: 'en' })],
    ['missing args parameter', undefined]
  ])('answers 400 for %s', async (_name, args) => {
    const error = await failure(() => handleContentQuery(fakeRepository() as never, 'listBlogArticles', args))
    expect(error.status).toBe(400)
  })

  it('answers 400 for a slug above 200 characters', async () => {
    const args = JSON.stringify(['en', 'x'.repeat(201)])
    const error = await failure(() => handleContentQuery(fakeRepository() as never, 'getBlogArticleBySlug', args))
    expect(error.status).toBe(400)
  })

  it('answers 400 for more than 50 slugs', async () => {
    const slugs = Array.from({ length: 51 }, (_, i) => `s${i}`)
    const error = await failure(() => handleContentQuery(fakeRepository() as never, 'listAuthorsBySlugs', JSON.stringify([slugs])))
    expect(error.status).toBe(400)
  })

  it('has a schema for every method of the adapter and nothing else', () => {
    const adapterMethods = Object.keys(createNuxtContentAdapter((() => ({})) as never)).sort()
    expect([...CONTENT_METHODS].sort()).toEqual(adapterMethods)
  })
})
