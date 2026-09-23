import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Server errors must not be indexable. @nuxtjs/robots stamps
 * `X-Robots-Tag: index, follow` on the request before rendering, so a render
 * that fails afterwards would otherwise ship a 500 marked indexable — which
 * is what production served during the `$i18n` outage.
 *
 * The plugin is loaded with Nitro's auto-imports stubbed, so both hook paths
 * (thrown error, returned 5xx) are exercised without booting a server.
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

describe('error response robots header', () => {
  it('marks a thrown 500 as noindex', async () => {
    const hooks = await loadHooks()
    hooks.error!(new Error('Cannot redefine property: $i18n'), { event })
    expect(setResponseHeader).toHaveBeenCalledWith(event, 'X-Robots-Tag', 'noindex')
  })

  it('leaves a thrown 404 to the page', async () => {
    const hooks = await loadHooks()
    hooks.error!(Object.assign(new Error('Not found'), { statusCode: 404 }), { event })
    expect(setResponseHeader).not.toHaveBeenCalled()
  })

  it('marks a returned 5xx as noindex', async () => {
    const hooks = await loadHooks()
    status = 503
    hooks.beforeResponse!(event)
    expect(setResponseHeader).toHaveBeenCalledWith(event, 'X-Robots-Tag', 'noindex')
  })

  it('leaves successful responses alone', async () => {
    const hooks = await loadHooks()
    hooks.beforeResponse!(event)
    expect(setResponseHeader).not.toHaveBeenCalled()
  })
})
