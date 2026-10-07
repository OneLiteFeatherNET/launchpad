// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { clearNuxtData } from '#imports'
import { useBlogPostsByAuthor } from '../../layers/blog/composables/useBlogPostsByAuthor'

/** Dates sit far from any real clock reading, so `new Date()` cannot change a result. */
const dated = (slug: string, author: string | string[], released: string) => ({
  slug,
  title: slug,
  author,
  pubDate: released,
  releaseDate: released,
})

const repo = {
  listBlogArticles: vi.fn(),
  getTeamDocument: vi.fn(async () => ({ members: [{ id: 'tp', slug: 'tp', name: 'Team Person' }] })),
  listAuthorsBySlugs: vi.fn(async () => []),
}

mockNuxtImport('useContentRepository', () => () => repo)

const Harness = defineComponent({
  async setup() {
    const { articles } = await useBlogPostsByAuthor('tp')
    return { text: articles.value.map((article) => article.slug).join(',') }
  },
  template: '<div>{{ text }}</div>',
})

const list = async () => {
  const wrapper = await mountSuspended(Harness, { route: '/de/team/tp' })
  await flushPromises()
  return wrapper.text()
}

beforeEach(() => {
  vi.clearAllMocks()
  clearNuxtData()
})

describe('posts of an author for the team profile', () => {
  it('lists the newest post first', async () => {
    repo.listBlogArticles.mockResolvedValue([
      dated('old', 'tp', '2001-01-01T00:00:00Z'),
      dated('new', 'tp', '2003-01-01T00:00:00Z'),
      dated('mid', ['gast', 'tp'], '2002-01-01T00:00:00Z'),
    ])
    expect(await list()).toBe('new,mid,old')
  })

  it('leaves out a post whose release date is still ahead', async () => {
    repo.listBlogArticles.mockResolvedValue([
      dated('later', 'tp', '3000-01-01T00:00:00Z'), dated('out', 'tp', '2001-01-01T00:00:00Z'),
    ])
    expect(await list()).toBe('out')
  })

  it('leaves out posts of other authors', async () => {
    repo.listBlogArticles.mockResolvedValue([dated('theirs', 'gast', '2001-01-01T00:00:00Z')])
    expect(await list()).toBe('')
  })

  it('returns an empty list without failing when the author has no post', async () => {
    repo.listBlogArticles.mockResolvedValue([])
    expect(await list()).toBe('')
  })
})
