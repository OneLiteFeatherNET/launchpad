import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The edge cache is steered entirely by response headers set in
 * nuxt.config.ts `routeRules` (design: openspec change edge-caching-and-seo,
 * D2). Each rule below is a promise the cache keeps on the site's behalf, so
 * the table is checked row by row rather than trusted:
 *
 * - time-dependent pages 1 h fresh, static pages and legal pages 24 h, both
 *   stale-while-revalidate (design: perf-longer-edge-cache);
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

const LOCALES = ['en', 'de']

/** Static pages: same HTML until the next deploy. */
const DAY_PATHS = [
  'blog/some-article',
  'team',
  'team/some-member',
  'about',
  'projects',
  'projects/some-project',
  'community-poi',
  'community-poi/some-poi',
  'join',
  'survival-rules',
  'bluemap',
  'imprint',
  'privacy'
]

/** Pages that read the clock on the server (events, releases, seasons). */
const HOUR_PATHS = [
  '',
  'events',
  'events/some-event',
  'community',
  'blog',
  'blog/author/some-author',
  'some-unlisted-page'
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

const nodeRequire = createRequire(import.meta.url)
// radix3 and defu are not direct dependencies; resolve them the way Nitro
// does, through nuxt -> nitropack.
const nitroRequire = createRequire(createRequire(nodeRequire.resolve('nuxt/package.json')).resolve('nitropack/package.json'))
type Rules = { headers?: Record<string, string> }
const { createRouter, toRouteMatcher } = nitroRequire('radix3') as {
  createRouter: (opts: { routes: Record<string, Rules> }) => unknown
  toRouteMatcher: (router: unknown) => { matchAll: (path: string) => Rules[] }
}
const defu = nitroRequire('defu') as (...sources: Rules[]) => Rules

/** Edge directive a path ends up with after Nitro merges the matching rules. */
function edgeDirective(path: string): string | undefined {
  const routes: Record<string, Rules> = {}
  for (const line of routeRulesBlock().split('\n')) {
    const route = line.trimStart().match(/^'([^']+)':/)?.[1]
    if (!route) continue
    const days = line.match(/cachedPageHeaders\((\d+)\)/)?.[1]
    const literal = line.match(/'cloudflare-cdn-cache-control': '([^']+)'/)?.[1]
    if (days) routes[route] = { headers: { 'cloudflare-cdn-cache-control': `max-age=${days}` } }
    else if (literal) routes[route] = { headers: { 'cloudflare-cdn-cache-control': literal } }
    else routes[route] = {}
  }
  const matcher = toRouteMatcher(createRouter({ routes }))
  // Same merge as nitropack's getRouteRulesForPath.
  const rules = defu({}, ...matcher.matchAll(path).reverse())
  return rules.headers?.['cloudflare-cdn-cache-control']
}

// Pages with a translated slug (defineI18nRoute); a rule on the untranslated path
// would also put a 404 URL into the sitemap.
const LOCALIZED_SLUGS: Record<string, Record<string, string>> = {
  de: { 'survival-rules': 'survival-regeln' }
}
const pathFor = (locale: string, rest: string) => {
  const slug = LOCALIZED_SLUGS[locale]?.[rest] ?? rest
  return slug ? `/${locale}/${slug}` : `/${locale}`
}

describe('edge cache route rules', () => {
  it.each(LOCALES.flatMap(l => DAY_PATHS.map(p => pathFor(l, p))))('resolves %s to a day', (path) => {
    expect(edgeDirective(path)).toBe('max-age=86400')
  })

  it('has no rule for the untranslated German survival rules path', () => {
    expect(routeRulesBlock()).not.toContain("'/de/survival-rules'")
  })

  it.each(LOCALES.flatMap(l => HOUR_PATHS.map(p => pathFor(l, p))))('resolves %s to an hour, never a day', (path) => {
    expect(edgeDirective(path)).toBe('max-age=3600')
  })

  it.each(NEVER_CACHED)('resolves %s to no-store', (path) => {
    expect(edgeDirective(path.replace('**', 'x'))).toBe('no-store')
  })

  it.each(['/en/**', '/de/**'])('caches %s for an hour', (route) => {
    expect(ruleFor(route)).toContain('cachedPageHeaders(3600)')
  })

  it.each(LEGAL_PAGES)('caches %s for a day and keeps it out of the index', (route) => {
    const rule = ruleFor(route)
    expect(rule).toContain('cachedPageHeaders(86400)')
    expect(rule).toContain("robots: 'noindex, follow'")
  })

  it.each(['/sitemap_index.xml', '/__sitemap__/**'])('keeps sitemap %s out of the index', (route) => {
    expect(ruleFor(route)).toContain("robots: 'noindex, follow'")
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
