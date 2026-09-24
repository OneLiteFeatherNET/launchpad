// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
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

const events: EventDocument[] = [
  event('preview-only', { unlisted: true }), event('public-hidden'),
]

const fakeRepo = {
  listEvents: vi.fn(async () => events),
  getEventBySlug: vi.fn(async (_locale: string, slug: string) => (
    events.find((doc) => doc.slug === slug) ?? null
  )),
  getEventByTranslationKey: vi.fn(async () => null),
  getServerConnect: vi.fn(async () => null),
}

// useContentRepository is a plain auto-imported function (not #app's own),
// so wrapping `original` is unnecessary here — a full replacement is safe.
mockNuxtImport('useContentRepository', () => () => fakeRepo)

// `useEventDetail` throws a fatal NuxtError for the 404 case (a plain JS
// throw inside setup); Suspense inside `mountSuspended` swallows that rather
// than rejecting the mount, so the harness catches it itself and renders the
// status code instead — observable through the same `wrapper.text()` check
// as the success case.
const Harness = defineComponent({
  async setup() {
    try {
      const { detail } = await useEventDetail()
      return { outcome: `phase:${detail.value?.phase}` }
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode
      return { outcome: `error:${statusCode}` }
    }
  },
  template: '<div>{{ outcome }}</div>',
})

describe('useEventDetail', () => {
  it('reaches an unlisted event even hidden, with phase hidden', async () => {
    const wrapper = await mountSuspended(Harness, { route: '/de/events/preview-only' })
    expect(wrapper.text()).toBe('phase:hidden')
  })

  it('404s a public event that is still hidden', async () => {
    const wrapper = await mountSuspended(Harness, { route: '/de/events/public-hidden' })
    expect(wrapper.text()).toBe('error:404')
  })

  it('404s an unknown slug', async () => {
    const wrapper = await mountSuspended(Harness, { route: '/de/events/does-not-exist' })
    expect(wrapper.text()).toBe('error:404')
  })
})
