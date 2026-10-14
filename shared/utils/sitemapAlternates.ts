/**
 * hreflang alternates for sitemap entries in the shape @nuxtjs/sitemap takes
 * as `alternatives`. x-default is the en URL, as in the pages' own <head>.
 */

export interface SitemapAlternate {
  hreflang: string
  href: string
}

const REGIONS: Record<string, string> = { de: 'de-DE', en: 'en-US' }

/** One alternate per locale where the page exists, plus x-default when en is one of them. */
export function localizedAlternates(
  locales: readonly string[],
  hrefOf: (locale: string) => string
): SitemapAlternate[] {
  const alternates = locales.map((locale) => ({
    hreflang: REGIONS[locale] ?? locale,
    href: hrefOf(locale),
  }))
  if (locales.includes('en')) alternates.push({ hreflang: 'x-default', href: hrefOf('en') })
  return alternates
}
