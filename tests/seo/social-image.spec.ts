import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DEFAULT_SOCIAL_IMAGE, resolveSocialImage } from '../../layers/content-core/utils/socialImage'
import { repoRoot } from '../helpers/sources'

/**
 * Every indexable page needs an og:image. Before the fallback existed, only
 * team profiles had one in production: nuxt-og-image runs with
 * `zeroRuntime: true`, which strips `defineOgImage()` outside prerendering,
 * and nothing is prerendered.
 */

const SITE = 'https://onelitefeather.net'
const transform = (src: string) => `https://img.onelitefeather.net/cdn-cgi/image/w=1200,h=630,f=webp${src}`

describe('social image resolution', () => {
  it('falls back to the site default, absolute and 1200×630', () => {
    expect(resolveSocialImage(undefined, SITE, transform)).toEqual({
      url: 'https://onelitefeather.net/images/og-default.png',
      width: 1200,
      height: 630
    })
  })

  it('does not route the default through the image provider', () => {
    // The provider's origin is not public/; a transformed URL would 404.
    expect(resolveSocialImage(undefined, SITE, transform).url).not.toContain('img.onelitefeather.net')
  })

  it('uses the page image through the provider when given', () => {
    const resolved = resolveSocialImage('/images/blog/post.png', SITE, transform)
    expect(resolved.url).toBe('https://img.onelitefeather.net/cdn-cgi/image/w=1200,h=630,f=webp/images/blog/post.png')
  })

  it('makes a relative result absolute (image provider `none`)', () => {
    const resolved = resolveSocialImage('/images/blog/post.png', SITE, src => src)
    expect(resolved.url).toBe('https://onelitefeather.net/images/blog/post.png')
  })

  it('ships the default image in public/', () => {
    expect(existsSync(`${repoRoot}/public${DEFAULT_SOCIAL_IMAGE.path}`)).toBe(true)
  })
})

const PAGE_SEO = 'layers/content-core/composables/usePageSeo.ts'
const ARTICLE_SEO = 'layers/blog/composables/useArticleSeo.ts'

/** The argument text of every `img(…)` call in a source file, balanced parens included. */
function imgCalls(source: string): string[] {
  const calls: string[] = []
  for (const match of source.matchAll(/\bimg\(/g)) {
    const start = match.index
    let depth = 0
    for (let i = start + 3; i < source.length; i++) {
      if (source[i] === '(') depth++
      if (source[i] === ')' && --depth === 0) {
        calls.push(source.slice(start, i + 1))
        break
      }
    }
  }
  return calls
}

const sizeOf = (call = '') => ({
  width: Number(/width: (\d+)/.exec(call)?.[1]),
  height: Number(/height: (\d+)/.exec(call)?.[1])
})

const readRepo = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

describe('social image crop', () => {
  it('crops the page og:image to the declared 1200×630 with fit cover', () => {
    const calls = imgCalls(readRepo(PAGE_SEO))
    expect(calls, 'usePageSeo has one img() transform').toHaveLength(1)
    expect(calls[0], 'fit must be cover, or Cloudflare scales instead of cropping').toContain("fit: 'cover'")
    expect(sizeOf(calls[0])).toEqual({ width: 1200, height: 630 })
  })

  it('requests the width and height that resolveSocialImage declares', () => {
    const [call] = imgCalls(readRepo(PAGE_SEO))
    const declared = resolveSocialImage('/images/blog/post.png', SITE, src => src)
    expect(sizeOf(call)).toEqual({ width: declared.width, height: declared.height })
  })

  it('crops the article og:image and the three Article image variants with fit cover', () => {
    const wide = imgCalls(readRepo(ARTICLE_SEO)).filter(call => sizeOf(call).width === 1200)
    expect(wide, 'og:image plus the 1200×630, 1200×900 and 1200×1200 variants').toHaveLength(4)
    for (const call of wide) {
      expect(call, `fit cover missing in ${call}`).toContain("fit: 'cover'")
    }
    const heights = wide.map(call => sizeOf(call).height).sort((a, b) => a - b)
    expect(heights).toEqual([
      630,
      630,
      900,
      1200
    ])
  })

  it('crops the article thumbnail to 600×400 with fit cover', () => {
    const [thumbnail] = imgCalls(readRepo(ARTICLE_SEO)).filter(call => sizeOf(call).width === 600)
    expect(thumbnail, 'article thumbnail transform').toBeDefined()
    expect(thumbnail).toContain("fit: 'cover'")
    expect(sizeOf(thumbnail)).toEqual({ width: 600, height: 400 })
  })

  it('every sized img() call in the SEO composables crops with fit cover', () => {
    const sized = [PAGE_SEO, ARTICLE_SEO]
      .flatMap(file => imgCalls(readRepo(file)))
      .filter(call => /width: \d+/.test(call) && /height: \d+/.test(call))
    expect(sized).toHaveLength(6)
    for (const call of sized) {
      expect(call, `fit cover missing in ${call}`).toContain("fit: 'cover'")
    }
  })
})
