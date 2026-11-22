import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCollectiveStats, OPEN_COLLECTIVE_CACHE_TTL } from '../../shared/utils/openCollective'

type Handler = () => Promise<Record<string, unknown>>

// The Nuxt test transform injects the app's useRuntimeConfig into server files too.
vi.mock('#app/nuxt', async (importOriginal) => ({
  ...await importOriginal<Record<string, unknown>>(),
  useRuntimeConfig: () => ({ public: {} })
}))

// The route relies on Nitro auto-imports; stub them so it runs as a plain module.
const loadHandler = async (fetcher: typeof fetch): Promise<Handler> => {
  vi.resetModules()
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
  vi.stubGlobal('defineEventHandler', (fn: unknown) => fn)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: {} }))
  vi.stubGlobal('loadCollectiveStats', loadCollectiveStats)
  vi.stubGlobal('OPEN_COLLECTIVE_CACHE_TTL', OPEN_COLLECTIVE_CACHE_TTL)
  vi.stubGlobal('fetch', fetcher)
  return (await import('../../server/api/opencollective.get')).default as unknown as Handler
}

const ok = (body: unknown) => (
  async () => new Response(JSON.stringify(body), { status: 200 })
) as typeof fetch

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('/api/opencollective', () => {
  it('reports the numbers as available when the source answers', async () => {
    const handler = await loadHandler(ok({ balance: 12345, backersCount: 7 }))
    expect(await handler()).toMatchObject({ available: true, totalRaised: 123, contributors: 7 })
  })

  it('reports a real zero balance as available, not as an outage', async () => {
    const handler = await loadHandler(ok({ balance: 0 }))
    expect(await handler()).toMatchObject({ available: true, totalRaised: 0 })
  })

  const outages: Array<[string, typeof fetch]> = [
    ['an HTTP error', (async () => new Response('', { status: 503 })) as typeof fetch],
    ['a network error', (async () => { throw new TypeError('fetch failed') }) as typeof fetch],
    ['malformed JSON', (async () => new Response('<html>', { status: 200 })) as typeof fetch],
    ['JSON without a balance', ok({ backersCount: 3 })]
  ]

  it.each(outages)('reports unavailable without any numbers on %s', async (_name, fetcher) => {
    const result = await (await loadHandler(fetcher))()
    expect(result.available).toBe(false)
    expect(result).not.toHaveProperty('totalRaised')
    expect(result).not.toHaveProperty('goal')
    expect(result.link).toBe('https://opencollective.com/onelitefeather')
  })

  it('logs the slug and the cause of an outage', async () => {
    const handler = await loadHandler((async () => new Response('', { status: 503 })) as typeof fetch)
    await handler()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(warn.mock.calls[0])).toMatch(/onelitefeather[\s\S]*503/)
  })
})
