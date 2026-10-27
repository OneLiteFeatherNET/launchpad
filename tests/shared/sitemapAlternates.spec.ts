import { describe, expect, it } from 'vitest'
import { localizedAlternates } from '../../shared/utils/sitemapAlternates'

const hrefOf = (locale: string) => `/${locale}/blog`

describe('localizedAlternates', () => {
  it('lists de-DE, en-US and x-default for a page that exists in both locales', () => {
    expect(localizedAlternates(['de', 'en'], hrefOf)).toEqual([
      { hreflang: 'de-DE', href: '/de/blog' },
      { hreflang: 'en-US', href: '/en/blog' },
      { hreflang: 'x-default', href: '/en/blog' },
    ])
  })

  it('lists only the locale where the page exists', () => {
    expect(localizedAlternates(['de'], hrefOf)).toEqual([
      { hreflang: 'de-DE', href: '/de/blog' },
    ])
  })

  it('points x-default at the en URL when only en exists', () => {
    expect(localizedAlternates(['en'], hrefOf)).toEqual([
      { hreflang: 'en-US', href: '/en/blog' }, { hreflang: 'x-default', href: '/en/blog' },
    ])
  })
})
