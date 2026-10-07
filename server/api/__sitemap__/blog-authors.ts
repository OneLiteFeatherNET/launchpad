import { queryCollection } from '@nuxt/content/server'
// Type-only entry points, never the layer barrels — see team.ts next to it.
import type { BlogArticle } from '#layers/blog/types'
import type { TeamDocument } from '#layers/team/types'
// Reaches past content-core's public index for the same reason as team.ts
// next to it: Nitro's `impound` plugin refuses `#layers/content-core`.
import { locales } from '~/layers/content-core/utils/content/locales'

/**
 * Sitemap source for blog author pages.
 *
 * An author page answers 200 only for a person who resolves (roster first,
 * then `authors`) and has a released article in that language, which depends
 * on the moment of the request. `blogAuthorSitemapEntries` from shared/utils
 * applies the same rule as the page.
 */
export default defineEventHandler(async (event) => {
  const authors = await queryCollection(event, 'authors').select('slug').all()
  const byLocale: Record<string, { articles: BlogArticle[], resolvable: string[] }> = {}
  for (const locale of locales) {
    const articles = (await queryCollection(event, `blog_${locale}` as 'blog_de' | 'blog_en')
      .select('slug', 'author', 'pubDate', 'releaseDate')
      .all()) as BlogArticle[]
    const team = (await queryCollection(event, `team_${locale}` as 'team_de' | 'team_en')
      .all())[0] as TeamDocument | undefined
    const roster = (team?.members ?? [])
      .filter((member) => !member.openPosition && member.slug)
      .map((member) => member.slug as string)
    byLocale[locale] = { articles, resolvable: [...roster, ...authors.map((a) => a.slug)] }
  }
  return blogAuthorSitemapEntries(byLocale, new Date())
})
