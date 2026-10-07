// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData } from '#imports'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useCommunityPoisByProject } from '../../layers/community-poi/composables/useCommunityPoi'

const repo = { listCommunityPoisByProject: vi.fn() }

mockNuxtImport('useContentRepository', () => () => repo)

const poi = (slug: string, status: string, updatedAt: string) => ({
  slug, title: slug, summary: slug, status, updatedAt,
})

const render = async (slug: string) => {
  const wrapper = await mountSuspended(defineComponent({
    async setup() {
      const { pois } = await useCommunityPoisByProject(slug)
      return () => h('pre', JSON.stringify(pois.value.map((p) => p.slug)))
    },
  }), { route: '/de/projects/arcr' })
  await flushPromises()
  return JSON.parse(wrapper.get('pre').text()) as string[]
}

beforeEach(() => {
  clearNuxtData()
  vi.clearAllMocks()
  repo.listCommunityPoisByProject.mockResolvedValue([
    poi('done', 'completed', '2026-09-01'),
    poi('old', 'in-progress', '2026-01-01'),
    poi('fresh', 'in-progress', '2026-09-01'),
  ])
})

describe('useCommunityPoisByProject', () => {
  it('asks for the locale of the page and the project slug', async () => {
    await render('arcr')
    expect(repo.listCommunityPoisByProject).toHaveBeenCalledWith('de', 'arcr')
  })

  it('orders the cards like the overview: active builds first, then the most recent', async () => {
    expect(await render('arcr')).toEqual(['fresh',
'old',
'done'])
  })

  it('does not ask the repository without a slug', async () => {
    expect(await render('')).toEqual([])
    expect(repo.listCommunityPoisByProject).not.toHaveBeenCalled()
  })
})
