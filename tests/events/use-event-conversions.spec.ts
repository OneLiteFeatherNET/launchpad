// @vitest-environment nuxt
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useEventConversions } from '../../layers/events/composables/useEventConversions'
import type { EventDocument } from '../../layers/events/types'

// The factory reads `trackEvent` when the composable is called, so each test
// gets the spy created in its own beforeEach.
let trackEvent: Mock

mockNuxtImport('useAnalytics', () => () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
  trackShare: vi.fn(),
}))

beforeEach(() => {
  trackEvent = vi.fn()
})

const detail = {
  event: { slug: 'slender', translationKey: 'event-slender-2026' } as EventDocument,
  phase: 'running' as const,
}

describe('useEventConversions', () => {
  it('tracks one server address copy with the event, locale and phase', () => {
    const { trackServerAddressCopied } = useEventConversions()

    trackServerAddressCopied(detail, 'de')

    expect(trackEvent).toHaveBeenCalledTimes(1)
    expect(trackEvent).toHaveBeenCalledWith('event_server_address_copied', {
      event_slug: 'slender',
      event_key: 'event-slender-2026',
      locale: 'de',
      event_phase: 'running',
    })
  })
})
