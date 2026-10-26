import { describe, expect, it } from 'vitest'
import { serverAddressCopiedEvent } from '../../layers/events/utils/eventConversions'

describe('serverAddressCopiedEvent', () => {
  it('names the conversion and carries slug, translation key, locale and phase', () => {
    expect(serverAddressCopiedEvent({ slug: 'slender', translationKey: 'event-slender-2026' }, 'de', 'running')).toEqual({
      name: 'event_server_address_copied',
      properties: { event_slug: 'slender', event_key: 'event-slender-2026', locale: 'de', event_phase: 'running' },
    })
  })

  it('uses the slug as event key when the event has no translation key', () => {
    expect(serverAddressCopiedEvent({ slug: 'herbst' }, 'en', 'announced').properties.event_key).toBe('herbst')
  })
})
