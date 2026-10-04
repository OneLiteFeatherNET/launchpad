// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { computed, defineComponent } from 'vue'
import { useHomeContent } from '../../layers/home/composables/useHomeContent'

const poi = (slug: string, status: string, updatedAt: string) => ({
  slug,
  title: slug,
  summary: `${slug} summary`,
  status,
  progress: 10,
  featured: true,
  updatedAt,
  galleryCount: 0,
  schematicCount: 0
})

const repo = {
  getServerConcept: vi.fn(async () => null),
  getServerConnect: vi.fn(async () => null),
  getHomeCarousel: vi.fn(async () => null),
  listCommunityPois: vi.fn(async () => []),
  listFeaturedCommunityPois: vi.fn()
}

mockNuxtImport('useContentRepository', () => () => repo)

const Harness = defineComponent({
  setup() {
    const { slides } = useHomeContent()
    return { titles: computed(() => slides.value.map((slide) => (slide as { title: string }).title).join(',')) }
  },
  template: '<div>{{ titles }}</div>'
})

beforeEach(() => {
  clearNuxtData()
  vi.clearAllMocks()
  repo.listFeaturedCommunityPois.mockResolvedValue([
    poi('done', 'completed', '2026-01-01'),
    poi('old-active', 'in-progress', '2026-01-01'),
    poi('new-active', 'in-progress', '2026-06-01')
  ])
})

describe('home featured community pois', () => {
  it('asks for the featured list and never loads the whole collection', async () => {
    await mountSuspended(Harness, { route: '/en' })
    await flushPromises()
    expect(repo.listFeaturedCommunityPois).toHaveBeenCalledTimes(1)
    expect(repo.listCommunityPois).not.toHaveBeenCalled()
  })

  it('orders by status, then by most recent update', async () => {
    const wrapper = await mountSuspended(Harness, { route: '/en' })
    await flushPromises()
    expect(wrapper.text()).toBe('new-active,old-active,done')
  })
})
