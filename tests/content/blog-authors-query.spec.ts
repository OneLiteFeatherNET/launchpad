// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { useBlogArticle } from '../../layers/blog/composables/useBlogContent'

const article = (author?: string | string[]) => ({
  slug: currentSlug,
  title: 'Post',
  author,
  releaseDate: '2000-01-01T00:00:00Z'
})

let currentSlug = ''
let counter = 0
const open = () => {
  currentSlug = `post-${++counter}`
  return mountSuspended(Harness, { route: `/en/blog/${currentSlug}` })
}

const profile = (slug: string) => ({ slug, name: slug.toUpperCase() })

const repo = {
  getBlogArticleBySlug: vi.fn(),
  getBlogArticleByTranslationKey: vi.fn(async () => null),
  getAuthorBySlug: vi.fn(),
  listAuthorsBySlugs: vi.fn()
}

mockNuxtImport('useContentRepository', () => () => repo)

const Harness = defineComponent({
  async setup() {
    const { authors } = await useBlogArticle()
    return { names: authors.value.map((author) => author.name).join(',') }
  },
  template: '<div>{{ names }}</div>'
})

beforeEach(() => {
  vi.clearAllMocks()
  const reversed = async (slugs: string[]) => [...slugs].reverse().map(profile)
  repo.listAuthorsBySlugs.mockImplementation(reversed)
})

describe('blog article authors', () => {
  it('reads all authors with a single query', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(['b',
'a',
'c']))
    await open()
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledTimes(1)
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledWith(['b',
'a',
'c'])
    expect(repo.getAuthorBySlug).not.toHaveBeenCalled()
  })

  it('keeps the order of the frontmatter', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(['b',
'a',
'c']))
    const wrapper = await open()
    expect(wrapper.text()).toBe('B,A,C')
  })

  it('accepts a single author given as a string', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article('a'))
    const wrapper = await open()
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledWith(['a'])
    expect(wrapper.text()).toBe('A')
  })

  it('skips authors the collection does not know', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(['a', 'ghost']))
    repo.listAuthorsBySlugs.mockResolvedValue([profile('a')])
    const wrapper = await open()
    expect(wrapper.text()).toBe('A')
  })

  it('does not query authors for an article without any', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(undefined))
    await open()
    expect(repo.listAuthorsBySlugs).not.toHaveBeenCalled()
  })
})
