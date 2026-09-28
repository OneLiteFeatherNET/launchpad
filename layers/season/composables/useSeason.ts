import type { ActiveSeason } from '../types'
import { resolveSeason } from '../utils/seasons'

/**
 * The season in effect, decided once per request on the server.
 *
 * `useState` runs its initialiser on the server and ships the result in the
 * payload, so the client adopts the server's answer instead of reading its own
 * clock. Deciding on both sides would mismatch during hydration for anyone
 * loading across midnight in Berlin, or from a device whose clock or zone
 * disagrees — a bug that shows only on the days that matter.
 *
 * Only request-independent input goes in: `NUXT_PUBLIC_SEASON` (forces or
 * kills a season in production without a build), then the calendar. The HTML
 * is cached at the edge, so the render may not read the query
 * (tests/architecture/request-independent-render.spec.ts); the `?season=`
 * preview is applied in the browser after hydration instead
 * (plugins/season-preview.client.ts).
 */
export function useSeason() {
  return useState<ActiveSeason>('season', () => {
    const config = useRuntimeConfig()
    return resolveSeason({ date: new Date(), overrides: [config.public.season] })
  })
}
