import { isEventListedAt, type EventScheduleFields } from './eventPhase'

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
  unlisted?: boolean
  translationKey?: string
}

const regionOf: Record<string, string> = { de: 'de-DE', en: 'en-US' }

/**
 * Sitemap entries for every listed event at `now`, per locale. Hidden events
 * are left out entirely, so an unannounced event is not discoverable through
 * the sitemap before its page would answer; unlisted events are left out
 * regardless of phase, same as the overview and the carousel.
 *
 * Translations are paired by `translationKey`, as the detail page pairs them,
 * because the slugs of one event may differ between languages. Only listed
 * translations become alternates.
 */
export function visibleEventSitemapEntries(
  eventsByLocale: Record<string, EventSitemapSource[]>,
  now: Date | number
): { loc: string, alternatives?: { hreflang: string, href: string }[] }[] {
  const listed: Array<{ locale: string, entry: EventSitemapSource }> = []
  for (const [locale, events] of Object.entries(eventsByLocale)) {
    for (const entry of events) {
      if (!entry.slug || !isEventListedAt(entry.event, entry.unlisted, now)) continue
      listed.push({ locale, entry })
    }
  }
  return listed.map(({ locale, entry }) => {
    const translations = entry.translationKey
      ? listed.filter((other) => other.entry.translationKey === entry.translationKey)
      : []
    if (translations.length < 2) return { loc: eventDetailPath(locale, entry.slug) }
    return {
      loc: eventDetailPath(locale, entry.slug),
      alternatives: translations.map((other) => ({
        hreflang: regionOf[other.locale] ?? other.locale,
        href: eventDetailPath(other.locale, other.entry.slug),
      })),
    }
  })
}
