// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { clearError, clearNuxtData, useError } from '#imports'
import { useBlogArticle, useBlogOverview } from '../../layers/blog/composables/useBlogContent'

/** A lookup the test finishes by hand, so the loading state can be observed. */
let finishLookup: (article: unknown) => void = () => {}
let finishList: (articles: unknown[]) => void = () => {}

const repo = {
  listBlogArticles: vi.fn(() => new Promise((resolve) => { finishList = resolve })),
  getBlogArticleBySlug: vi.fn(() => new Promise((resolve) => { finishLookup = resolve })),
  listCommunityPoiEmbedsBySlugs: vi.fn(async () => []),
  getBlogArticleByTranslationKey: vi.fn(async () => null),
  listAuthorsBySlugs: vi.fn(async () => []),
  getTeamDocument: vi.fn(async () => ({ members: [] }))
}

mockNuxtImport('useContentRepository', () => () => repo)
mockNuxtImport('useSetI18nParams', () => () => vi.fn())

const released = {
  slug: 'hello',
  title: 'Hello world',
  author: [],
  pubDate: '2000-01-01T00:00:00Z',
  releaseDate: '2000-01-01T00:00:00Z'
}

const Harness = defineComponent({
  async setup() {
    const { blog, loading } = await useBlogArticle()
    return { blog, loading }
  },
  template: '<p>{{ loading ? "loading" : (blog ? blog.title : "empty") }}</p>'
})

const open = (path: string) => mountSuspended(Harness, { route: path })

beforeEach(() => {
  vi.clearAllMocks()
  clearNuxtData()
  clearError()
})

describe('article page data', () => {
  it('renders at once and reports loading while the article is on its way', async () => {
    const wrapper = await open('/en/blog/hello')
    expect(wrapper.text()).toBe('loading')
    finishLookup(released)
    await flushPromises()
    expect(wrapper.text()).toBe('Hello world')
  })

  it('raises the 404 page when the article does not exist', async () => {
    const wrapper = await open('/en/blog/does-not-exist')
    expect(useError().value).toBeUndefined()
    finishLookup(null)
    await flushPromises()
    expect(wrapper.text()).toBe('empty')
    expect(useError().value).toMatchObject({ statusCode: 404 })
  })

  it('raises the 404 page for an article that is not released yet', async () => {
    await open('/en/blog/later')
    finishLookup({ ...released, pubDate: '3000-01-01T00:00:00Z', releaseDate: '3000-01-01T00:00:00Z' })
    await flushPromises()
    expect(useError().value).toMatchObject({ statusCode: 404 })
  })
})

const Overview = defineComponent({
  setup() {
    const { top1Article, loading } = useBlogOverview()
    return { top1Article, loading }
  },
  template: '<p>{{ loading ? "loading" : (top1Article ? top1Article.slug : "empty") }}</p>'
})

describe('blog overview data', () => {
  it('reports loading until the list arrives, then shows it', async () => {
    const wrapper = await mountSuspended(Overview, { route: '/en/blog' })
    expect(wrapper.text()).toBe('loading')
    finishList([released])
    await flushPromises()
    expect(wrapper.text()).toBe('hello')
  })
})
