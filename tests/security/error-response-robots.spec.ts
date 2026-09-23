import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Error responses must be neither indexable nor cacheable. @nuxtjs/robots
 * stamps `X-Robots-Tag: index, follow` and the route rules stamp an
 * edge-cache directive on the request before rendering, so a render that
 * fails afterwards would otherwise ship an error marked indexable and
 * cacheable — production served exactly that during the `$i18n` outage, and
 * on every 404.
 *
 * The plugin is loaded with Nitro's auto-imports stubbed, so both hook paths
 * (thrown error, returned error status) are exercised without booting a
 * server.
 */

type Hook = (...args: unknown[]) => void

const setResponseHeader = vi.fn()
let status = 200

beforeEach(() => {
  status = 200
  setResponseHeader.mockReset()
  vi.stubGlobal('defineNitroPlugin', (plugin: unknown) => plugin)
  vi.stubGlobal('setResponseHeader', setResponseHeader)
  vi.stubGlobal('getResponseStatus', () => status)
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

const event = { path: '/en' }

const expectMarkedAsError = () => {
  expect(setResponseHeader).toHaveBeenCalledWith(event, 'X-Robots-Tag', 'noindex')
  expect(setResponseHeader).toHaveBeenCalledWith(event, 'cloudflare-cdn-cache-control', 'no-store')
  expect(setResponseHeader).toHaveBeenCalledWith(event, 'Cache-Control', 'no-store')
}

describe('error response headers', () => {
  it('marks a thrown 500 as noindex and no-store', async () => {
    const hooks = await loadHooks()
    hooks.error!(new Error('Cannot redefine property: $i18n'), { event })
    expectMarkedAsError()
  })

  it('marks a thrown 404 as noindex and no-store', async () => {
    const hooks = await loadHooks()
    hooks.error!(Object.assign(new Error('Article not found'), { statusCode: 404 }), { event })
    expectMarkedAsError()
  })

  it('marks a returned 404 as noindex and no-store', async () => {
    const hooks = await loadHooks()
    status = 404
    hooks.beforeResponse!(event)
    expectMarkedAsError()
  })

  it('marks a returned 5xx as noindex and no-store', async () => {
    const hooks = await loadHooks()
    status = 503
    hooks.beforeResponse!(event)
    expectMarkedAsError()
  })

  it('leaves redirects alone', async () => {
    const hooks = await loadHooks()
    status = 302
    hooks.beforeResponse!(event)
    expect(setResponseHeader).not.toHaveBeenCalled()
  })

  it('leaves successful responses alone', async () => {
    const hooks = await loadHooks()
    hooks.beforeResponse!(event)
    expect(setResponseHeader).not.toHaveBeenCalled()
  })
})
