import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Every page under /en and /de is cached at the edge by path and query alone.
 * The cache key holds no cookie, no header and no user — so a render that
 * reads any of them would be served, as cached, to every other visitor.
 *
 * Today no render reads them, which is the only reason caching these routes
 * is correct. This test keeps it that way: the first `route.query` or
 * `useCookie` in a page turns the cache into a leak, and nothing else would
 * notice. If a feature genuinely needs per-request input, it has to move out
 * of the cached HTML (client-only, or a separate uncached endpoint) and the
 * cache rules in nuxt.config.ts have to be revisited — not this list.
 *
 * `/` is the one request-dependent route (language redirect by cookie and
 * Accept-Language); it is excluded from caching in nuxt.config.ts and handled
 * by @nuxtjs/i18n, not by code in these directories.
 */

const APP_DIRS = ['pages',
  'layouts',
  'layers',
  'plugins',
  'composables',
  'components']
const APP_FILES = ['app.vue', 'error.vue']

const FORBIDDEN: Array<[RegExp, string]> = [
  [/\broute\.query\b/, 'route.query'],
  [/\buseRoute\(\)\s*\.query\b/, 'useRoute().query'],
  [/\$route\.query\b/, '$route.query'],
  [/\buseCookie\s*\(/, 'useCookie('],
  [/\buseRequestHeaders?\s*\(/, 'useRequestHeaders('],
  [/\buseRequestEvent\s*\(/, 'useRequestEvent('],
  [/\buseRequestURL\s*\(/, 'useRequestURL('],
]

const files = [
  ...collectSourceFiles(APP_DIRS, ['.vue', '.ts']), ...APP_FILES.map(file => join(repoRoot, file)),
]

describe('cached renders do not depend on the request', () => {
  it('finds the app sources', () => {
    // Guards against a path typo turning this into a test of nothing.
    expect(files.length).toBeGreaterThan(50)
  })

  it('no render reads query, cookies or request headers', () => {
    const violations: string[] = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      for (const [pattern, label] of FORBIDDEN) {
        if (pattern.test(source)) violations.push(`${relativeToRepo(file)}: ${label}`)
      }
    }
    expect(violations).toEqual([])
  })
})
