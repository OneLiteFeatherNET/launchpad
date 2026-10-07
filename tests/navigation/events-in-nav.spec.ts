// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData } from '#imports'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useEventsInNav } from '../../composables/useEventsInNav'

const repo = { listEventSchedules: vi.fn() }

mockNuxtImport('useContentRepository', () => () => repo)

const probe = defineComponent({
  setup() {
    const { eventsTopLevel } = useEventsInNav()
    return () => h('pre', String(eventsTopLevel.value))
  }
})

const render = async () => {
  const wrapper = await mountSuspended(probe, { route: '/de' })
  await flushPromises()
  return wrapper.get('pre').text()
}

beforeEach(() => {
  clearNuxtData()
  vi.clearAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-07T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useEventsInNav', () => {
  it('asks for the schedules of the page locale', async () => {
    repo.listEventSchedules.mockResolvedValue([])
    await render()
    expect(repo.listEventSchedules).toHaveBeenCalledWith('de')
  })

  it('is false while only past, hidden or unlisted events exist', async () => {
    repo.listEventSchedules.mockResolvedValue([
      { event: { startsAt: '2026-01-01T10:00:00Z', endsAt: '2026-01-02T10:00:00Z' } },
      { event: { startsAt: '2027-01-01T10:00:00Z' } },
      { unlisted: true, event: { startsAt: '2026-10-01T10:00:00Z' } }
    ])
    expect(await render()).toBe('false')
  })

  it('is true with a listed running event', async () => {
    repo.listEventSchedules.mockResolvedValue([
      { event: { startsAt: '2026-10-01T10:00:00Z', endsAt: '2026-10-20T10:00:00Z' } }
    ])
    expect(await render()).toBe('true')
  })
})
