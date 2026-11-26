// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, type Component } from 'vue'
import { clearError, clearNuxtData, useError } from '#imports'
import { useCommunityPoiDetail } from '../../layers/community-poi/composables/useCommunityPoi'
import { useEventDetail } from '../../layers/events/composables/useEvents'
import { useProjectDetail } from '../../layers/projects/composables/useProjects'
import { useTeamProfile } from '../../layers/team/composables/useTeamProfile'

/**
 * Every detail page loads lazily: it renders at once with `loading` set, shows
 * its content when the lookup settles, and raises the 404 page when the lookup
 * finds nothing. The lookups here are finished by hand so each state can be
 * observed.
 */
const finish: Record<string, (value: unknown) => void> = {}
const deferred = (name: string) => vi.fn(() => new Promise((resolve) => { finish[name] = resolve }))

const repo = {
  getEventBySlug: deferred('event'),
  getProjectBySlug: deferred('project'),
  getCommunityPoiBySlug: deferred('poi'),
  getTeamDocument: deferred('team'),
  getEventByTranslationKey: vi.fn(async () => null),
  getProjectByTranslationKey: vi.fn(async () => null),
  getCommunityPoiByTranslationKey: vi.fn(async () => null),
  getServerConnect: vi.fn(async () => null),
  listAuthorsBySlugs: vi.fn(async () => [])
}

mockNuxtImport('useContentRepository', () => () => repo)
mockNuxtImport('useSetI18nParams', () => () => vi.fn())

interface Loaded {
  loading: { value: boolean }
  title: () => string | undefined
}

const harness = (read: () => Promise<Loaded>) => defineComponent({
  async setup() {
    const { loading, title } = await read()
    return { loading, title }
  },
  template: '<p>{{ loading ? "loading" : (title() ?? "empty") }}</p>'
})

interface Case {
  name: string
  route: string
  component: Component
  label: string
  found: unknown
}

const cases: Case[] = [
  {
    name: 'event',
    route: '/en/events/x',
    component: harness(async () => {
      const { detail, loading } = await useEventDetail()
      return { loading, title: () => detail.value?.event.title }
    }),
    label: 'Event X',
    found: {
      slug: 'x',
      title: 'Event X',
      summary: 's',
      type: 'build',
      event: { startsAt: '2020-01-01T00:00:00Z' }
    }
  },
  {
    name: 'project',
    route: '/en/projects/x',
    component: harness(async () => {
      const { detail, loading } = await useProjectDetail()
      return { loading, title: () => detail.value?.project.title }
    }),
    label: 'Project X',
    found: { slug: 'x', title: 'Project X', summary: 's', status: 'active' }
  },
  {
    name: 'poi',
    route: '/en/community-poi/x',
    component: harness(async () => {
      const { poi, loading } = await useCommunityPoiDetail()
      return { loading, title: () => poi.value?.title }
    }),
    label: 'Poi X',
    found: { slug: 'x', title: 'Poi X', summary: 's', status: 'active' }
  },
  {
    name: 'team',
    route: '/en/team/x',
    component: harness(async () => {
      const { member, loading } = await useTeamProfile()
      return { loading, title: () => member.value?.name }
    }),
    label: 'Member X',
    found: { members: [{ slug: 'x', name: 'Member X' }] }
  }
]

beforeEach(() => {
  vi.clearAllMocks()
  clearNuxtData()
  clearError()
})

describe.each(cases)('$name page data', ({ name, route, component, label, found }) => {
  it('renders at once, then shows the content', async () => {
    const wrapper = await mountSuspended(component, { route })
    expect(wrapper.text()).toBe('loading')
    finish[name]!(found)
    await flushPromises()
    expect(wrapper.text()).toBe(label)
    expect(useError().value).toBeUndefined()
  })

  it('raises the 404 page when nothing is found', async () => {
    await mountSuspended(component, { route })
    finish[name]!(name === 'team' ? { members: [] } : null)
    await flushPromises()
    expect(useError().value).toMatchObject({ statusCode: 404 })
  })
})
