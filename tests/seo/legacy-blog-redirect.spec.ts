import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { legacyBlogRedirectTarget } from '../../shared/utils/legacyBlogRedirect'
import { repoRoot } from '../helpers/sources'

/** Blog links without a locale prefix move permanently to the English blog. */
describe('legacy blog redirect target', () => {
  it.each([
    ['/blog', '/en/blog'],
    ['/blog/', '/en/blog/'],
    ['/blog/some-post', '/en/blog/some-post'],
    ['/blog/some-post?utm=1', '/en/blog/some-post?utm=1'],
    ['/blog?page=2', '/en/blog?page=2'],
    ['/blog/en/dev-blog-1', '/en/blog/dev-blog-1'],
    ['/blog/de/foo', '/de/blog/foo'],
    ['/blog/en/dev-blog-1?utm=1', '/en/blog/dev-blog-1?utm=1'],
    ['/blog/en', '/en/blog'],
    ['/blog/english-post', '/en/blog/english-post']
  ])('moves %s to %s', (path, target) => {
    expect(legacyBlogRedirectTarget(path)).toBe(target)
  })

  it.each([
    '/',
    '/en/blog',
    '/de/blog/post',
    '/blogger',
    '/blog-archive',
    '/api/blog'
  ])('leaves %s alone', (path) => {
    expect(legacyBlogRedirectTarget(path)).toBeNull()
  })
})

/**
 * @nuxtjs/sitemap drops a URL when a route rule with `redirect` matches its
 * path or its path without the locale prefix, so a `/blog` rule would remove
 * `/en/blog` and `/de/blog` from the sitemap.
 */
describe('redirect route rules and the sitemap', () => {
  const config = readFileSync(`${repoRoot}/nuxt.config.ts`, 'utf8')
  const sources = [...config.matchAll(/^\s*'([^']+)':\s*\{\s*redirect:/gm)].map(m => m[1] as string)

  it('finds the redirect rules', () => {
    expect(sources.length).toBeGreaterThan(0)
  })

  // No locale page lives at /data-privacy, so the sitemap cannot lose one to it.
  const UNPREFIXED_REDIRECTS = ['/data-privacy']

  it.each(sources)('keeps %s inside a locale prefix', (source) => {
    if (UNPREFIXED_REDIRECTS.includes(source)) return
    expect(source, 'an un-prefixed redirect rule also matches /en and /de pages').toMatch(/^\/(en|de)\//)
  })
})

describe('legacy blog redirect middleware', () => {
  const source = readFileSync(`${repoRoot}/server/middleware/legacy-blog-redirect.ts`, 'utf8')

  it('redirects with 301 and no edge cache directive', () => {
    expect(source).toContain('301')
    expect(source).not.toContain('cloudflare-cdn-cache-control')
  })
})
