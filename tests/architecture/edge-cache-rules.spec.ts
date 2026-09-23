import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The edge cache is steered entirely by response headers set in
 * nuxt.config.ts `routeRules` (design: openspec change edge-caching-and-seo,
 * D2). Each rule below is a promise the cache keeps on the site's behalf, so
 * the table is checked row by row rather than trusted:
 *
 * - content pages 1 h fresh, legal pages 24 h, both stale-while-revalidate;
 * - `/` never cached — it redirects by cookie and Accept-Language, and a
 *   cached redirect would send every visitor to the first visitor's language;
 * - internal endpoints never cached.
 *
 * Read as text, like production-config.spec.ts: importing the config would
 * pull in every module it references.
 */

const LEGAL_PAGES = [
  '/en/imprint',
  '/de/imprint',
  '/en/privacy',
  '/de/privacy'
]

const NEVER_CACHED = [
  '/',
  '/ingest/**',
  '/__nuxt_content/**',
  '/api/**'
]

const source = readFileSync(`${repoRoot}/nuxt.config.ts`, 'utf8')

function routeRulesBlock(): string {
  const start = source.indexOf('    routeRules: {')
  expect(start).toBeGreaterThan(0)
  const end = source.indexOf('\n    },', start)
  return source.slice(start, end)
}

function ruleFor(route: string): string {
  const line = routeRulesBlock().split('\n').find(l => l.trimStart().startsWith(`'${route}':`))
  expect(line, `no routeRules entry for ${route}`).toBeDefined()
  return line!
}

describe('edge cache route rules', () => {
  it.each(['/en/**', '/de/**'])('caches %s for an hour', (route) => {
    expect(ruleFor(route)).toContain('cachedPageHeaders(3600)')
  })

  it.each(LEGAL_PAGES)('caches %s for a day and keeps it out of the index', (route) => {
    const rule = ruleFor(route)
    expect(rule).toContain('cachedPageHeaders(86400)')
    expect(rule).toContain("robots: 'noindex, follow'")
  })

  it.each(NEVER_CACHED)('never caches %s', (route) => {
    expect(ruleFor(route)).toContain("'cloudflare-cdn-cache-control': 'no-store'")
  })

  it('caches robots.txt for at most an hour', () => {
    expect(ruleFor('/robots.txt')).toContain("'cloudflare-cdn-cache-control': 'max-age=3600")
  })

  it('keeps stale-while-revalidate alive in the edge directive', () => {
    // Cloudflare disables stale-while-revalidate when the same directive
    // carries s-maxage, must-revalidate or proxy-revalidate.
    const helper = source.match(/const cachedPageHeaders[\s\S]*?\n\}\)/)?.[0]
    expect(helper).toBeDefined()
    const edge = helper!.match(/'cloudflare-cdn-cache-control': `([^`]+)`/)?.[1]
    expect(edge).toContain('stale-while-revalidate=')
    expect(edge).not.toMatch(/s-maxage|must-revalidate|proxy-revalidate/)
    // Browsers must revalidate on every visit; only the edge holds the page.
    expect(helper).toContain("'cache-control': 'public, max-age=0, must-revalidate'")
  })

  it('does not stack Nitro swr/cache on top of the edge cache', () => {
    // Nitro's own cache would add s-maxage and replay Set-Cookie to every
    // visitor (design D1).
    expect(routeRulesBlock()).not.toMatch(/\b(swr|isr|cache)\s*:/)
  })
})
