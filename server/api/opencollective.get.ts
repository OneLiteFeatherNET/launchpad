import type { CollectiveStats } from '#layers/opencollective/types'

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

export default defineEventHandler(async (): Promise<CollectiveStats> => {
  const pub = useRuntimeConfig().public as Record<string, string | number | undefined>
  const slug = String(pub.openCollectiveSlug || 'onelitefeather')
  const currency = String(pub.openCollectiveCurrency || 'EUR')
  const goal = Number(pub.openCollectiveGoal ?? 3000)
  try {
    return await cachedStats(slug, currency, goal)
  } catch (err) {
    console.warn('[opencollective] failed to load stats', err)
    return { slug, currency, totalRaised: 0, goal, contributors: null, updatedAt: new Date().toISOString(), link: `https://opencollective.com/${slug}` }
  }
})
