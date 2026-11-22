import type { CollectiveResult } from '#layers/opencollective/types'

// Nitro's cache is per isolate; the cf cache in loadCollectiveStats spans isolates.
// swr is off (a background refresh needs waitUntil); throws are not cached.
const cachedStats = defineCachedFunction(
  (slug: string, currency: string, goal: number) => loadCollectiveStats(fetch, {
    slug,
    currency,
    goal,
    link: `https://opencollective.com/${slug}`,
    now: () => new Date().toISOString()
  }),
  { name: 'opencollective', maxAge: OPEN_COLLECTIVE_CACHE_TTL, swr: false, getKey: (slug: string) => slug }
)

export default defineEventHandler(async (): Promise<CollectiveResult> => {
  const pub = useRuntimeConfig().public as Record<string, string | number | undefined>
  const slug = String(pub.openCollectiveSlug || 'onelitefeather')
  const currency = String(pub.openCollectiveCurrency || 'EUR')
  const goal = Number(pub.openCollectiveGoal ?? 3000)
  try {
    return { available: true, ...await cachedStats(slug, currency, goal) }
  } catch (err) {
    // No numbers on purpose: zeros would render as a real "0 raised".
    console.warn('[opencollective] stats unavailable', { slug, error: err instanceof Error ? err.message : String(err) })
    return { available: false, slug, link: `https://opencollective.com/${slug}` }
  }
})
