import { queryCollection } from '@nuxt/content/server'
// Type-only entry points, never the layer barrels — see team.ts next to it.
import type { BlogArticle } from '#layers/blog/types'
// Same path as blog-authors.ts: `#layers/content-core` cannot be value-imported here.
import { locales } from '~/layers/content-core/utils/content/locales'

/**
 * Sitemap source for the list pages that have a derivable lastmod: blog,
 * projects and community POI. The app already lists them; this only adds
 * their date. `indexPageSitemapEntries` from shared/utils holds the rule.
 */
export default defineEventHandler(async (event) => {
  const byLocale: Record<string, {
    articles: BlogArticle[]
    projects: Array<{ slug?: string, updatedAt?: Date | string }>
    pois: Array<{ slug?: string, updatedAt?: Date | string, startedAt?: Date | string }>
  }> = {}
  for (const locale of locales) {
    const articles = (await queryCollection(event, `blog_${locale}` as 'blog_de' | 'blog_en')
      .select('pubDate', 'releaseDate', 'updatedDate')
      .all()) as BlogArticle[]
    const projects = await queryCollection(event, `projects_${locale}` as 'projects_de' | 'projects_en')
      .select('updatedAt')
      .all()
    const pois = await queryCollection(event, `community_poi_${locale}` as 'community_poi_de' | 'community_poi_en')
      .select('updatedAt', 'startedAt')
      .all()
    byLocale[locale] = { articles, projects, pois }
  }
  return indexPageSitemapEntries(byLocale, new Date())
})
