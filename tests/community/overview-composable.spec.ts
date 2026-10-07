// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData } from '#imports'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useCommunityOverview } from '../../composables/useCommunityOverview'

const repo = {
  listCommunityPois: vi.fn(),
  listEvents: vi.fn(),
  getTeamDocument: vi.fn()
}

mockNuxtImport('useContentRepository', () => () => repo)

const probe = defineComponent({
  setup() {
    const { overview, numbers } = useCommunityOverview()
    return () => h('pre', JSON.stringify({ overview: overview.value, numbers: numbers.value }))
  }
})

const render = async () => {
  const wrapper = await mountSuspended(probe, { route: '/de/community' })
  await flushPromises()
  return JSON.parse(wrapper.get('pre').text()) as {
    overview: { contributors: { name: string }[] }
    numbers: Record<string, number | null>
  }
}

beforeEach(() => {
  clearNuxtData()
  vi.clearAllMocks()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  repo.listCommunityPois.mockResolvedValue([
    { slug: 'maze', title: 'Maze', builders: [{ name: 'Ada', mcName: 'ada' }] },
    {
      slug: 'harbour',
      title: 'Harbour',
      builders: [{ name: 'Ada', mcName: 'ADA' }, { name: 'Bo' }]
    }
  ])
  repo.listEvents.mockResolvedValue([
    {
      slug: 'old',
      title: 'Old',
      event: { startsAt: '2020-01-01T10:00:00Z', endsAt: '2020-01-02T10:00:00Z' },
      results: { placements: [{ place: 1, name: 'Cy' }] }
    },
    {
      slug: 'secret',
      title: 'Secret',
      unlisted: true,
      event: { startsAt: '2020-01-01T10:00:00Z', endsAt: '2020-01-02T10:00:00Z' },
      results: { placements: [{ place: 1, name: 'Hidden Person' }] }
    }
  ])
  repo.getTeamDocument.mockResolvedValue({
    members: [
      { name: 'A' },
      { name: 'B' },
      { name: 'Open', openPosition: true }
    ]
  })
  registerEndpoint('/api/community/discord', () => ({ members: 99 }))
  registerEndpoint('/api/opencollective', () => ({
    slug: 'x', currency: 'EUR', totalRaised: 0, goal: 0, contributors: 4, updatedAt: '', link: ''
  }))
})

describe('useCommunityOverview', () => {
  it('asks the repository for the locale of the page', async () => {
    await render()
    expect(repo.listCommunityPois).toHaveBeenCalledWith('de')
    expect(repo.listEvents).toHaveBeenCalledWith('de')
    expect(repo.getTeamDocument).toHaveBeenCalledWith('de')
  })

  it('counts team members without open positions', async () => {
    expect((await render()).numbers.teamSize).toBe(2)
  })

  it('counts every POI as a build', async () => {
    expect((await render()).numbers.buildCount).toBe(2)
  })

  it('counts each person once, with placements of listed past events only', async () => {
    const { overview, numbers } = await render()
    expect(overview.contributors.map((c) => c.name).sort()).toEqual([
      'Ada',
      'Bo',
      'Cy'
    ])
    expect(numbers.contributorCount).toBe(3)
  })

  it('does not let an unlisted event leak a name into the payload', async () => {
    const { overview } = await render()
    expect(JSON.stringify(overview)).not.toContain('Hidden Person')
  })

  it('passes the Discord count and the supporter count through', async () => {
    const { numbers } = await render()
    expect(numbers.discordMembers).toBe(99)
    expect(numbers.supporters).toBe(4)
  })

  it('still renders the other numbers when Discord has no count', async () => {
    registerEndpoint('/api/community/discord', () => ({ members: null }))
    const { numbers } = await render()
    expect(numbers.discordMembers).toBeNull()
    expect(numbers.teamSize).toBe(2)
  })
})
