import { isReleasedAt, type BlogAuthorFields } from './blogAuthors'
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
 * left out, so the app's own entry for them stands.
 */
export function indexPageSitemapEntries(
  byLocale: Record<string, IndexPageItems>,
  now: Date
): { loc: string, lastmod: Date }[] {
  const entries: { loc: string, lastmod: Date }[] = []
  for (const [locale, items] of Object.entries(byLocale)) {
    const dated = [
      { path: 'blog', lastmod: newestDate(items.articles.filter((article) => isReleasedAt(article, now)).map(articleLastmod)) },
      { path: 'projects', lastmod: newestDate(items.projects.map((project) => project.updatedAt)) },
      { path: 'community-poi', lastmod: newestDate(items.pois.map((poi) => poi.updatedAt ?? poi.startedAt)) },
    ]
    for (const { path, lastmod } of dated) {
      if (lastmod) entries.push({ loc: `/${locale}/${path}`, lastmod })
    }
  }
  return entries
}
