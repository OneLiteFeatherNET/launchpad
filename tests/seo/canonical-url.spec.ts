import { describe, expect, it } from 'vitest'
import { withoutTrailingSlash } from '../../layers/content-core/utils/canonicalUrl'

describe('withoutTrailingSlash', () => {
  it('removes the slash after an article path', () => {
    expect(withoutTrailingSlash('https://onelitefeather.net/en/blog/dev-blog-1/'))
      .toBe('https://onelitefeather.net/en/blog/dev-blog-1')
  })

  it('leaves a path without a slash alone', () => {
    expect(withoutTrailingSlash('https://onelitefeather.net/en/blog'))
      .toBe('https://onelitefeather.net/en/blog')
  })

  it('keeps the slash of the bare origin', () => {
    expect(withoutTrailingSlash('https://onelitefeather.net/'))
      .toBe('https://onelitefeather.net/')
  })

  it('removes the slash of a locale root', () => {
    expect(withoutTrailingSlash('https://onelitefeather.net/de/'))
      .toBe('https://onelitefeather.net/de')
  })
})
