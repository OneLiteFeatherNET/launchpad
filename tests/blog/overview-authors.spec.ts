// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent } from 'vue'
import { clearNuxtData } from '#imports'
import { useBlogOverview } from '../../layers/blog/composables/useBlogContent'

const dated = { pubDate: '2026-02-01T00:00:00Z', releaseDate: '2026-02-01T00:00:00Z' }

const articles = [
  { slug: 'a', title: 'A', author: 'tp', ...dated },
  { slug: 'b', title: 'B', author: ['gast', 'tp'], pubDate: '2026-01-01T00:00:00Z', releaseDate: '2026-01-01T00:00:00Z' },
  { slug: 'c', title: 'C', pubDate: '2025-01-01T00:00:00Z', releaseDate: '2025-01-01T00:00:00Z' },
]

const repo = {
  listBlogArticles: vi.fn(async () => articles),
  getTeamDocument: vi.fn(async () => ({ members: [{ id: 't', name: 'Team Person', slug: 'tp' }] })),
  listAuthorsBySlugs: vi.fn(async () => [{ slug: 'gast', name: 'Gast' }]),
}

mockNuxtImport('useContentRepository', () => () => repo)

const Harness = defineComponent({
  setup() {
    const { top1Article, allPosts, authorsOf } = useBlogOverview()
    const text = computed(() => [top1Article.value, ...allPosts.value]
      .filter((article) => article !== null)
      .map((article) => `${article.slug}:${authorsOf(article).map((a) => a.name).join('+')}`)
      .join('|'))
    return { text }
  },
  template: '<div>{{ text }}</div>',
})

const open = async () => {
  const wrapper = await mountSuspended(Harness, { route: '/de/blog' })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  clearNuxtData()
})

describe('blog overview authors', () => {
  it('names the authors of every article in frontmatter order', async () => {
    const wrapper = await open()
    expect(wrapper.text()).toBe('a:Team Person|b:Gast+Team Person|c:')
  })

  it('resolves all authors of the overview with one authors query', async () => {
    await open()
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledTimes(1)
  })
})
