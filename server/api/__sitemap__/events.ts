import { queryCollection } from '@nuxt/content/server'
import type { EventDocument } from '#layers/events'
// Reaches past content-core's public index for the same reason as team.ts
// next to it: Nitro's `impound` plugin refuses `#layers/content-core`, whose
// index pulls in `@nuxt/content` through `useContentRepository`. The
// `#layers/events` import above is `import type` and adds no runtime edge.
import { locales } from '~/layers/content-core/utils/content/locales'

/**
 * Sitemap source for event detail pages.
 *
 * The `events` collection deliberately carries no `defineSitemapSchema`:
 * whether an event may be listed depends on the moment of the request, which a
 * build-time entry cannot know. This route decides it per request with the
 * same rule the pages use (`visibleEventSitemapEntries` from shared/utils,
 * auto-imported on the Nitro side).
 */
export default defineEventHandler(async (event) => {
  const eventsByLocale: Record<string, EventDocument[]> = {}
  for (const locale of locales) {
    const key = `events_${locale}` as 'events_de' | 'events_en'
    eventsByLocale[locale] = (await queryCollection(event, key).all()) as EventDocument[]
  }
  return visibleEventSitemapEntries(eventsByLocale, new Date())
})
