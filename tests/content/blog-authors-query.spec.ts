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
const open = (locale = 'en') => {
  currentSlug = `post-${++counter}`
  return mountSuspended(Harness, { route: `/${locale}/blog/${currentSlug}` })
}

const profile = (slug: string) => ({ slug, name: slug.toUpperCase() })

const repo = {
  getBlogArticleBySlug: vi.fn(),
  getBlogArticleByTranslationKey: vi.fn(async () => null),
  getTeamDocument: vi.fn(),
  listAuthorsBySlugs: vi.fn()
}

mockNuxtImport('useContentRepository', () => () => repo)

const Harness = defineComponent({
  async setup() {
    const { authors } = await useBlogArticle()
    return { text: authors.value.map((author) => `${author.name}>${author.profilePath}`).join(',') }
  },
  template: '<div>{{ text }}</div>'
})

beforeEach(() => {
  vi.clearAllMocks()
  repo.getTeamDocument.mockResolvedValue({
    members: [{ id: 't', name: 'Team Person', slug: 'tp' }]
  })
  repo.listAuthorsBySlugs.mockImplementation(async (slugs: string[]) =>
    [...slugs].reverse().filter((slug) => slug !== 'ghost').map(profile))
})

describe('blog article authors', () => {
  it('reads the external authors with a single query', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(['b', 'a', 'c']))
    await open()
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledTimes(1)
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledWith(['b', 'a', 'c'])
  })

  it('keeps the order of the frontmatter', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(['b', 'a', 'c']))
    const wrapper = await open()
    expect(wrapper.text()).toBe(
      'B>/en/blog/author/b,A>/en/blog/author/a,C>/en/blog/author/c'
    )
  })

  it('links a team author to the team profile in the page locale', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article('tp'))
    const wrapper = await open('de')
    expect(wrapper.text()).toBe('Team Person>/de/team/tp')
  })

  it('does not ask the authors collection for a team author', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article('tp'))
    await open()
    expect(repo.listAuthorsBySlugs).not.toHaveBeenCalled()
  })

  it('mixes team and external authors in frontmatter order', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(['a', 'tp']))
    const wrapper = await open()
    expect(wrapper.text()).toBe('A>/en/blog/author/a,Team Person>/en/team/tp')
  })

  it('accepts a single author given as a string', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article('a'))
    const wrapper = await open()
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledWith(['a'])
    expect(wrapper.text()).toBe('A>/en/blog/author/a')
  })

  it('skips authors that resolve to nobody', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(['a', 'ghost']))
    const wrapper = await open()
    expect(wrapper.text()).toBe('A>/en/blog/author/a')
  })

  it('does not query people for an article without authors', async () => {
    repo.getBlogArticleBySlug.mockImplementation(async () => article(undefined))
    await open()
    expect(repo.listAuthorsBySlugs).not.toHaveBeenCalled()
    expect(repo.getTeamDocument).not.toHaveBeenCalled()
  })
})
