// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent } from 'vue'
import { clearError, clearNuxtData, useError } from '#imports'
import { useEventDetail } from '../../layers/events/composables/useEvents'
import type { EventDocument } from '../../layers/events/types'

/**
 * `useEventDetail` decides 404 with `isEventReachableAt`, which folds in
 * `unlisted`: an unlisted event stays reachable — and renders its `hidden`
 * phase as a preview — while a public event in the same phase still 404s.
 * See design.md D2/D3.
 *
 * The schedule never reaches its `startsAt`, so the phase stays `hidden` no
 * matter when this test runs — no injected clock is needed because
 * `useEventDetail` fixes `now` itself (design.md D4); this test only has to
 * avoid a schedule that could ever stop being hidden.
 */
const HIDDEN_SCHEDULE = { startsAt: '3000-01-01T00:00:00Z' }

function event(slug: string, overrides: Partial<EventDocument> = {}): EventDocument {
  return {
    slug,
    title: slug,
    summary: `${slug} summary`,
    type: 'build',
    event: HIDDEN_SCHEDULE,
    ...overrides,
  } as EventDocument
}

const RUNNING_SCHEDULE = { startsAt: '2020-01-01T00:00:00Z' }
const FAR_SESSION = { label: 'Nacht', first: '2099-01-01T21:00:00+01:00', durationMinutes: 180 }

const events: EventDocument[] = [
  event('with-session', { event: RUNNING_SCHEDULE, sessions: FAR_SESSION } as Partial<EventDocument>),
  event('without-session', { event: RUNNING_SCHEDULE }),
  event('hidden-session', { unlisted: true, sessions: FAR_SESSION } as Partial<EventDocument>),
  event('preview-only', { unlisted: true }),
event('public-hidden'),
  event('hosted', {
 unlisted: true, hosts: ['gast',
'ghost',
'tp']
} as Partial<EventDocument>),
]

const fakeRepo = {
  listEvents: vi.fn(async () => events),
  getEventBySlug: vi.fn(async (_locale: string, slug: string) => (
    events.find((doc) => doc.slug === slug) ?? null
  )),
  getEventByTranslationKey: vi.fn(async () => null),
  getServerConnect: vi.fn(async () => null),
  getTeamDocument: vi.fn(async () => ({ members: [{ id: 'tp', slug: 'tp', name: 'Team Person' }] })),
  listAuthorsBySlugs: vi.fn(async (slugs: string[]) => slugs.filter((slug) => slug === 'gast').map((slug) => ({ slug, name: 'Gast' }))),
}

// useContentRepository is a plain auto-imported function (not #app's own),
// so wrapping `original` is unnecessary here — a full replacement is safe.
mockNuxtImport('useContentRepository', () => () => fakeRepo)

// The page loads lazily: every harness derives its text from the data, which
// follows once the lookup settles. A missing event arrives as the error page
// (`useError`) rather than as a throw, so the harness renders its status code.
const Harness = defineComponent({
  async setup() {
    const { detail } = await useEventDetail()
    const error = useError()
    const outcome = computed(() => error.value
      ? `error:${error.value.statusCode}`
      : `phase:${detail.value?.phase}`)
    return { outcome }
  },
  template: '<div>{{ outcome }}</div>',
})

const HostsHarness = defineComponent({
  async setup() {
    const { detail } = await useEventDetail()
    const outcome = computed(() => (detail.value?.hosts ?? [])
      .map((host) => `${host.name}>${host.profilePath}`).join(','))
    return { outcome }
  },
  template: '<div>{{ outcome }}</div>',
})

const SessionHarness = defineComponent({
  async setup() {
    const { detail } = await useEventDetail()
    const outcome = computed(() => `next:${detail.value?.nextSession?.startsAt ?? 'none'}`)
    return { outcome }
  },
  template: '<div>{{ outcome }}</div>',
})

const open = async (component: object, route: string) => {
  const wrapper = await mountSuspended(component, { route })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  clearNuxtData()
  clearError()
})

describe('useEventDetail nextSession', () => {
  it('decides the next session on the server for a running event', async () => {
    const wrapper = await open(SessionHarness, '/de/events/with-session')
    expect(wrapper.text()).toBe('next:2099-01-01T20:00:00.000Z')
  })

  it('has no next session for an event without sessions', async () => {
    const wrapper = await open(SessionHarness, '/de/events/without-session')
    expect(wrapper.text()).toBe('next:none')
  })

  it('has no next session while the event is hidden', async () => {
    const wrapper = await open(SessionHarness, '/de/events/hidden-session')
    expect(wrapper.text()).toBe('next:none')
  })
})

describe('useEventDetail hosts', () => {
  it('resolves hosts in frontmatter order with their profile paths', async () => {
    const wrapper = await open(HostsHarness, '/de/events/hosted')
    expect(wrapper.text()).toBe('Gast>/de/blog/author/gast,Team Person>/de/team/tp')
  })

  it('skips a host that resolves to nobody', async () => {
    const wrapper = await open(HostsHarness, '/de/events/hosted')
    expect(wrapper.text()).not.toContain('ghost')
  })

  it('has no hosts for an event without any', async () => {
    const wrapper = await open(HostsHarness, '/de/events/preview-only')
    expect(wrapper.text()).toBe('')
  })
})

describe('useEventDetail', () => {
  it('reaches an unlisted event even hidden, with phase hidden', async () => {
    const wrapper = await open(Harness, '/de/events/preview-only')
    expect(wrapper.text()).toBe('phase:hidden')
  })

  it('404s a public event that is still hidden', async () => {
    const wrapper = await open(Harness, '/de/events/public-hidden')
    expect(wrapper.text()).toBe('error:404')
  })

  it('404s an unknown slug', async () => {
    const wrapper = await open(Harness, '/de/events/does-not-exist')
    expect(wrapper.text()).toBe('error:404')
  })
})
