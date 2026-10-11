// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent } from 'vue'
import { clearNuxtData } from '#imports'
import { useBlogOverview } from '../../layers/blog/composables/useBlogContent'

// The clock is pinned so "released" and "scheduled" cannot flip with the day the suite runs.
const NOW = new Date('2026-06-01T12:00:00Z')

const article = (slug: string, author: string, releaseDate: string, pubDate = releaseDate) => ({
  slug,
  title: slug,
  author,
  pubDate,
  releaseDate,
})

const repo = {
  listBlogArticles: vi.fn(),
  getTeamDocument: vi.fn(async () => ({ members: [] })),
  listAuthorsBySlugs: vi.fn<(slugs: string[]) => Promise<unknown[]>>(async () => []),
}

mockNuxtImport('useContentRepository', () => () => repo)

const Harness = defineComponent({
  setup() {
    const { allPostsData } = useBlogOverview()
    const slugs = computed(() => (allPostsData.value ?? []).map((entry) => entry.slug).join(','))
    return { slugs }
  },
  template: '<div>{{ slugs }}</div>',
})

const open = async () => {
  const wrapper = await mountSuspended(Harness, { route: '/de/blog' })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  clearNuxtData()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('blog overview payload release gate', () => {
  it('leaves a post with a future releaseDate out of the payload', async () => {
    repo.listBlogArticles.mockResolvedValue([
      article('released', 'tp', '2026-02-01T00:00:00Z'), article('scheduled', 'tp', '2026-10-15T18:00:00+02:00'),
    ])
    const wrapper = await open()
    expect(wrapper.text()).toBe('released')
  })

  it('falls back to pubDate when a post has no releaseDate', async () => {
    repo.listBlogArticles.mockResolvedValue([
      { slug: 'released', title: 'released', author: 'tp', pubDate: '2026-02-01T00:00:00Z' }, { slug: 'scheduled', title: 'scheduled', author: 'tp', pubDate: '2026-10-15T18:00:00Z' },
    ])
    const wrapper = await open()
    expect(wrapper.text()).toBe('released')
  })

  it('resolves no author of a post that is still scheduled', async () => {
    repo.listBlogArticles.mockResolvedValue([
      article('released', 'tp', '2026-02-01T00:00:00Z'), article('scheduled', 'future-author', '2026-10-15T18:00:00Z'),
    ])
    await open()
    const resolved = repo.listAuthorsBySlugs.mock.calls.flatMap(([slugs]) => slugs)
    expect(resolved).not.toContain('future-author')
  })
})
