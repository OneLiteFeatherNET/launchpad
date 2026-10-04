import { describe, expect, it, vi } from 'vitest'
import { loadCollectiveStats, OPEN_COLLECTIVE_CACHE_TTL } from '../../shared/utils/openCollective'

const defaults = {
  slug: 'onelitefeather',
  currency: 'EUR',
  goal: 3000,
  link: 'https://opencollective.com/onelitefeather',
  now: () => '2026-10-04T00:00:00.000Z'
}

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

describe('loadCollectiveStats', () => {
  it('asks the Cloudflare subrequest cache to keep successful responses', async () => {
    const fetcher = vi.fn(async () => jsonResponse({ balance: 12345 }))
    await loadCollectiveStats(fetcher, defaults)

    const call = fetcher.mock.calls[0] as unknown as [string, { cf: Record<string, unknown> }]
    const [url, init] = call
    expect(url).toBe('https://opencollective.com/onelitefeather.json')
    expect(init.cf.cacheEverything).toBe(true)
    expect(init.cf.cacheTtlByStatus).toEqual({ '200-299': OPEN_COLLECTIVE_CACHE_TTL, '300-599': 0 })
  })

  it('maps balance, yearly income and backers to stats', async () => {
    const fetcher = async () => jsonResponse({
      balance: 12345, yearlyIncome: 500000, backersCount: 7, currency: 'USD', updatedAt: '2026-10-01T00:00:00Z'
    })
    expect(await loadCollectiveStats(fetcher, defaults)).toEqual({
      slug: 'onelitefeather', currency: 'USD', totalRaised: 123, goal: 5000,
      contributors: 7, updatedAt: '2026-10-01T00:00:00Z', link: defaults.link
    })
  })

  it('throws on a failed response so no cache layer stores it', async () => {
    const fetcher = async () => jsonResponse({}, 503)
    await expect(loadCollectiveStats(fetcher, defaults)).rejects.toThrow()
  })
})
