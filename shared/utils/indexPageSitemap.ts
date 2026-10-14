import { isReleasedAt, type BlogAuthorFields } from './blogAuthors'
import { localizedAlternates, type SitemapAlternate } from './sitemapAlternates'
import { articleLastmod, newestDate } from './sitemapDates'

/**
 * lastmod for the list pages (blog, projects, community POI): the newest date
 * among the items they list, each dated as that item's own sitemap entry is.
 * The item rules mirror `onUrl` in content.config.ts.
 */

export interface IndexPageItems {
  articles: BlogAuthorFields[]
  projects: Array<{ slug?: string, updatedAt?: Date | string }>
  pois: Array<{ slug?: string, updatedAt?: Date | string, startedAt?: Date | string }>
}

/**
 * One entry per index page that has a derivable date. Pages without one are
 * left out, so the app's own entry for them stands. Every index page exists in
 * every locale, so each entry lists all of them as alternates, whatever their
 * dates. The sitemap merges this entry into the app's, and the alternates must
 * survive that merge.
 */
export function indexPageSitemapEntries(
  byLocale: Record<string, IndexPageItems>,
  now: Date
): { loc: string, lastmod: Date, alternatives: SitemapAlternate[] }[] {
  const entries: { loc: string, lastmod: Date, alternatives: SitemapAlternate[] }[] = []
  const locales = Object.keys(byLocale)
  for (const [locale, items] of Object.entries(byLocale)) {
    const dated = [
      { path: 'blog', lastmod: newestDate(items.articles.filter((article) => isReleasedAt(article, now)).map(articleLastmod)) },
      { path: 'projects', lastmod: newestDate(items.projects.map((project) => project.updatedAt)) },
      { path: 'community-poi', lastmod: newestDate(items.pois.map((poi) => poi.updatedAt ?? poi.startedAt)) },
    ]
    for (const { path, lastmod } of dated) {
      if (!lastmod) continue
      const alternatives = localizedAlternates(locales, (l) => `/${l}/${path}`)
      entries.push({ loc: `/${locale}/${path}`, lastmod, alternatives })
    }
  }
  return entries
}
