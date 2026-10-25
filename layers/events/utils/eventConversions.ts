import type { EventDocument, EventPhase } from '../types'

/**
 * The PostHog conversion for copying an event's server address. The slug is
 * the event key when no translation key exists, so both locales group alike.
 */
export function serverAddressCopiedEvent(
  event: Pick<EventDocument, 'slug' | 'translationKey'>,
  locale: string,
  phase: EventPhase
) {
  return {
    name: 'event_server_address_copied',
    properties: {
      event_slug: event.slug,
      event_key: event.translationKey ?? event.slug,
      locale,
      event_phase: phase
    }
  }
}
