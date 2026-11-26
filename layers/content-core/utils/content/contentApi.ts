import type { ContentRepository } from './repository'

/**
 * The wire contract between the browser's fetch adapter and the Nitro route
 * `server/api/content/[method].get.ts`. Kept free of zod and of anything that
 * names @nuxt/content so the browser can import it.
 */
export const CONTENT_API_PATH = '/api/content'

/**
 * Every method of {@link ContentRepository}, and the only names the route
 * accepts. The `satisfies` clause fails the type check when a name here is not
 * a repository method; tests/content-api holds the other direction (every
 * adapter method is listed).
 */
export const CONTENT_METHODS = [
  'listBlogArticles',
  'getBlogArticleBySlug',
  'getBlogArticleByTranslationKey',
  'getAuthorBySlug',
  'listAuthorsBySlugs',
  'listFaqEntries',
  'getTeamDocument',
  'listTeamFaqEntries',
  'getServerConcept',
  'getAboutDocument',
  'getServerConnect',
  'getHomeCarousel',
  'getSponsorsDocument',
  'listCommunityPois',
  'listFeaturedCommunityPois',
  'getCommunityPoiBySlug',
  'getCommunityPoiByTranslationKey',
  'listCommunityPoiEmbedsBySlugs',
  'listCommunityPoisByProject',
  'listEvents',
  'listEventSchedules',
  'getEventBySlug',
  'getEventByTranslationKey',
  'listProjects',
  'listProjectsBySlugs',
  'getProjectBySlug',
  'getProjectByTranslationKey'
] as const satisfies readonly (keyof ContentRepository)[]

export type ContentMethod = (typeof CONTENT_METHODS)[number]
