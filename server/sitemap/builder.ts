import { DEFAULT_LOCALE, supportedLocales } from './locales'
import { normalizeDate } from './utils'
import type {
  AlternateLink,
  LocalizedArticle,
  SitemapContext,
  UrlEntry
} from './types'

export class SitemapBuilder {
  private readonly entries: UrlEntry[] = []

  constructor(private readonly context: SitemapContext) {}

  addStaticRoutes() {
    for (const locale of this.context.locales) {
      this.entries.push(
        this.buildUrlEntry(`/${locale}`, this.buildStaticAlternates('')),
        this.buildUrlEntry(`/${locale}/blog`, this.buildStaticAlternates('/blog'))
      )
    }
  }

  addBlogEntries(articles: LocalizedArticle[]) {
    const grouped = this.groupByTranslation(articles)
    for (const entry of articles) {
      const lastmod = normalizeDate(entry.updatedDate || entry.pubDate)
      const alternates = this.buildAlternateLinks(grouped, entry)
      this.entries.push(
        this.buildUrlEntry(
          `/${entry.locale}/blog/${entry.slug}`,
          alternates,
          lastmod ? lastmod.toISOString() : undefined
        )
      )
    }
  }

  getEntries(): UrlEntry[] {
    return this.entries
  }

  private buildUrlEntry(path: string, alternates: AlternateLink[], lastmod?: string): UrlEntry {
    return {
      loc: `${this.context.baseUrl}${path}`,
      lastmod,
      alternates
    }
  }

  private buildStaticAlternates(path: string): AlternateLink[] {
    const links = supportedLocales().map((lng) => ({
      hreflang: lng,
      href: `${this.context.baseUrl}/${lng}${path}`
    }))
    this.ensureDefaultAlternate(links)
    return links
  }

  private buildAlternateLinks(
    grouped: Map<string, LocalizedArticle[]>,
    entry: LocalizedArticle
  ): AlternateLink[] {
    const key = entry.translationKey || entry.slug
    const peers = grouped.get(key) || [entry]
    const links = peers.map((item) => ({
      hreflang: item.locale,
      href: `${this.context.baseUrl}/${item.locale}/blog/${item.slug}`
    }))
    this.ensureDefaultAlternate(links)
    return links
  }

  private ensureDefaultAlternate(links: AlternateLink[]) {
    const defaultHref =
      links.find((link) => link.hreflang === this.context.defaultLocale)?.href || links[0]?.href

    if (defaultHref && !links.some((link) => link.hreflang === 'x-default')) {
      links.push({ hreflang: 'x-default', href: defaultHref })
    }
  }

  private groupByTranslation(articles: LocalizedArticle[]) {
    const grouped = new Map<string, LocalizedArticle[]>()
    for (const entry of articles) {
      const key = entry.translationKey || entry.slug
      grouped.set(key, [...(grouped.get(key) || []), entry])
    }
    return grouped
  }
}
