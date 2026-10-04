import type { CollectiveResponse, CollectiveStats } from '../../layers/opencollective/types'

/** Seconds Cloudflare's subrequest cache keeps a successful response. */
export const OPEN_COLLECTIVE_CACHE_TTL = 600

type Init = { cf: Record<string, unknown>, signal?: AbortSignal }
type Fetcher = (url: string, init: Init) => Promise<Response>

type CollectiveDefaults = {
  slug: string
  currency: string
  goal: number
  link: string
  now: () => string
}

/**
 * Throws on any failure; callers decide the fallback, so an error is never
 * stored by a cache layer.
 */
export async function loadCollectiveStats(
  fetcher: Fetcher,
  d: CollectiveDefaults
): Promise<CollectiveStats> {
  const res = await fetcher(`${d.link}.json`, {
    signal: AbortSignal.timeout(5000),
    // Only honoured by the Workers runtime; shared by every isolate in the colo.
    cf: {
      cacheEverything: true,
      cacheTtlByStatus: { '200-299': OPEN_COLLECTIVE_CACHE_TTL, '300-599': 0 }
    }
  })
  if (!res.ok) throw new Error(`OpenCollective responded ${res.status}`)
  const body = (await res.json()) as CollectiveResponse

  const raisedCents = typeof body.balance === 'number' ? body.balance : 0
  const apiGoal = typeof body.yearlyIncome === 'number' ? Math.round(body.yearlyIncome / 100) : null

  return {
    slug: d.slug,
    currency: body.currency || d.currency,
    totalRaised: Math.max(0, Math.round(raisedCents / 100)),
    goal: apiGoal || d.goal,
    contributors: body.backersCount ?? null,
    updatedAt: body.updatedAt || body.lastTransactionAt || d.now(),
    link: d.link
  }
}
