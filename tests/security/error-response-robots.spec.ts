import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Error responses must be neither indexable nor cacheable. @nuxtjs/robots
 * stamps `X-Robots-Tag: index, follow` and the route rules stamp an
 * edge-cache directive on the request before rendering, so a render that
 * fails afterwards would otherwise ship an error marked indexable and
 * cacheable — production served exactly that during the `$i18n` outage, and
 * on every 404.
 *
 * The plugin is loaded with Nitro's auto-imports stubbed, so the `response`
 * hook is exercised without booting a server.
 */

type Hook = (...args: unknown[]) => void

beforeEach(() => {
  vi.stubGlobal('defineNitroPlugin', (plugin: unknown) => plugin)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const loadHooks = async () => {
  vi.resetModules()
  const { default: plugin } = await import('../../server/plugins/error-response-headers')
  const hooks: Record<string, Hook> = {}
  ;(plugin as unknown as (app: unknown) => void)({
    hooks: { hook: (name: string, fn: Hook) => { hooks[name] = fn } }
  })
  return hooks
}

const respond = async (status: number) => {
  const hooks = await loadHooks()
  const res = new Response(null, { status })
  hooks.response!(res, { path: '/en' })
  return res.headers
}

const expectMarkedAsError = (headers: Headers) => {
  expect(headers.get('X-Robots-Tag')).toBe('noindex')
  expect(headers.get('cloudflare-cdn-cache-control')).toBe('no-store')
  expect(headers.get('Cache-Control')).toBe('no-store')
}

describe('error response headers', () => {
  it('marks a 404 as noindex and no-store', async () => {
    expectMarkedAsError(await respond(404))
  })

  it('marks a 500 as noindex and no-store', async () => {
    expectMarkedAsError(await respond(500))
  })

  it('marks a 503 as noindex and no-store', async () => {
    expectMarkedAsError(await respond(503))
  })

  it('leaves redirects alone', async () => {
    expect((await respond(302)).get('X-Robots-Tag')).toBeNull()
  })

  it('leaves successful responses alone', async () => {
    expect((await respond(200)).get('Cache-Control')).toBeNull()
  })
})
