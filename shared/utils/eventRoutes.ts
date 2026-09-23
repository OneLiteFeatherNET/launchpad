import { isEventVisibleAt, type EventScheduleFields } from './eventPhase'

/**
 * Where an event lives, and which events a sitemap may list — shared for the
 * same reason as eventPhase.ts: the pages link to these paths and the Nitro
 * sitemap source publishes them, and the two must never disagree.
 */

/** The localized detail path of an event, e.g. `/de/events/herbst-bauevent`. */
export function eventDetailPath(locale: string, slug: string): string {
  return `/${locale}/events/${slug}`
}

export interface EventSitemapSource {
  slug: string
  event: EventScheduleFields
}

/**
 * Sitemap entries for every event visible at `now`, per locale. Hidden events
 * are left out entirely, so an unannounced event is not discoverable through
 * the sitemap before its page would answer.
 */
export function visibleEventSitemapEntries(
  eventsByLocale: Record<string, EventSitemapSource[]>,
  now: Date | number
): { loc: string }[] {
  const entries: { loc: string }[] = []
  for (const [locale, events] of Object.entries(eventsByLocale)) {
    for (const entry of events) {
      if (!entry.slug || !isEventVisibleAt(entry.event, now)) continue
      entries.push({ loc: eventDetailPath(locale, entry.slug) })
    }
  }
  return entries
}
