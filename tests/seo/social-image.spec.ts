import { existsSync } from 'node:fs'
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
