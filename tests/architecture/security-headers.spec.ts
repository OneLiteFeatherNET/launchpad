import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CSP_ENFORCED,
  CSP_REPORT_ONLY,
  CSP_SOURCES,
  PERMISSIONS_POLICY,
  SECURITY_HEADERS
} from '#shared/utils/securityHeaders'

type Hook = (...args: unknown[]) => void

/** Loads the plugin against stubbed Nitro globals; returns the hooks it registers. */
async function loadPlugin() {
  const hooks = new Map<string, Hook>()
  vi.resetModules()
  vi.stubGlobal('SECURITY_HEADERS', SECURITY_HEADERS)
  vi.stubGlobal('defineNitroPlugin', (plugin: (app: unknown) => void) => plugin)
  const { default: plugin } = await import('../../server/plugins/security-headers')
  const hook = (name: string, fn: Hook) => hooks.set(name, fn)
  ;(plugin as (app: unknown) => void)({ hooks: { hook } })
  return { hooks }
}

const respond = async (status: number) => {
  const { hooks } = await loadPlugin()
  const res = new Response(null, { status })
  hooks.get('response')!(res, {})
  return Object.fromEntries(res.headers)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('security headers', () => {
  it('sets a referrer policy that keeps paths off cross-origin requests', () => {
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('sends nosniff from the app instead of relying on the zone', () => {
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff')
  })

  it.each(['camera',
'microphone',
'geolocation',
'payment',
'usb'])('turns %s off', (feature) => {
    expect(PERMISSIONS_POLICY).toContain(`${feature}=()`)
  })

  it('keeps fullscreen for the BlueMap embed', () => {
    expect(PERMISSIONS_POLICY).toContain('fullscreen=(self "https://bluemap.onelitefeather.dev")')
  })

  it('enforces frame-ancestors on its own, because report-only ignores it', () => {
    expect(CSP_ENFORCED).toBe("frame-ancestors 'self'")
    expect(CSP_REPORT_ONLY).not.toContain('frame-ancestors')
    expect(SECURITY_HEADERS['Content-Security-Policy']).toBe(CSP_ENFORCED)
  })

  it('collects no reports', () => {
    expect(CSP_REPORT_ONLY).not.toMatch(/report-(uri|to)/)
    expect(SECURITY_HEADERS).not.toHaveProperty('Report-To')
    expect(SECURITY_HEADERS).not.toHaveProperty('Reporting-Endpoints')
  })

  it('sends the policy report-only', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy-Report-Only']).toBe(CSP_REPORT_ONLY)
  })
})

describe('content security policy source list', () => {
  it('allows exactly these sources', () => {
    expect(CSP_SOURCES).toEqual({
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'https://static.cloudflareinsights.com'
      ],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': [
        "'self'",
        'data:',
        'https://img.onelitefeather.net',
        'https://mc-heads.net',
        'https://images.opencollective.com'
      ],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'frame-src': ['https://bluemap.onelitefeather.dev'],
      'worker-src': ["'self'", 'blob:'],
      'manifest-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"]
    })
  })

  it('never allows a wildcard or eval', () => {
    expect(CSP_REPORT_ONLY).not.toMatch(/\*|unsafe-eval/)
  })

  it('serialises one directive per entry', () => {
    expect(CSP_REPORT_ONLY.split('; ')).toHaveLength(Object.keys(CSP_SOURCES).length)
  })
})

describe('security-headers plugin', () => {
  const lower = ([name, value]: [string, string]) => [name.toLowerCase(), value]
  const expected = Object.fromEntries(Object.entries(SECURITY_HEADERS).map(lower))

  it('applies every header to a normal response', async () => {
    expect(await respond(200)).toEqual(expected)
  })

  it('applies every header to an error response', async () => {
    expect(await respond(500)).toEqual(expected)
  })

  it('never sets a cookie or cache directive, so edge caching stays as it is', () => {
    const names = Object.keys(SECURITY_HEADERS).map(n => n.toLowerCase())
    expect(names).not.toContain('set-cookie')
    expect(names).not.toContain('cache-control')
    expect(names).not.toContain('cloudflare-cdn-cache-control')
  })
})
