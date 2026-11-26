import { z } from 'zod'
import { CONTENT_METHODS } from './contentApi'
import type { ContentMethod } from './contentApi'
import { locales } from './locales'
import type { ContentRepository } from './repository'

/**
 * Server side of the content API: which methods exist and what arguments they
 * take. Imported by the Nitro route only — never by browser code, which would
 * ship zod for nothing.
 */
export class ContentQueryError extends Error {
  constructor(readonly status: 400 | 404, message: string) {
    super(message)
  }
}

const locale = z.enum(locales)
const slug = z.string().max(200)
const slugs = z.array(slug).max(50)

const ARGUMENTS = {
  listBlogArticles: z.tuple([locale]),
  getBlogArticleBySlug: z.tuple([locale, slug]),
  getBlogArticleByTranslationKey: z.tuple([locale, slug]),
  getAuthorBySlug: z.tuple([slug]),
  listAuthorsBySlugs: z.tuple([slugs]),
  listFaqEntries: z.tuple([locale]),
  getTeamDocument: z.tuple([locale]),
  listTeamFaqEntries: z.tuple([locale]),
  getServerConcept: z.tuple([locale]),
  getAboutDocument: z.tuple([locale]),
  getServerConnect: z.tuple([locale]),
  getHomeCarousel: z.tuple([locale]),
  getSponsorsDocument: z.tuple([locale]),
  listCommunityPois: z.tuple([locale]),
  listFeaturedCommunityPois: z.tuple([locale]),
  getCommunityPoiBySlug: z.tuple([locale, slug]),
  getCommunityPoiByTranslationKey: z.tuple([locale, slug]),
  listCommunityPoiEmbedsBySlugs: z.tuple([locale, slugs]),
  listCommunityPoisByProject: z.tuple([locale, slug]),
  listEvents: z.tuple([locale]),
  listEventSchedules: z.tuple([locale]),
  getEventBySlug: z.tuple([locale, slug]),
  getEventByTranslationKey: z.tuple([locale, slug]),
  listProjects: z.tuple([locale]),
  listProjectsBySlugs: z.tuple([locale, slugs]),
  getProjectBySlug: z.tuple([locale, slug]),
  getProjectByTranslationKey: z.tuple([locale, slug])
} satisfies Record<ContentMethod, z.ZodType<unknown[]>>

const KNOWN: readonly string[] = CONTENT_METHODS
const isContentMethod = (name: string): name is ContentMethod => KNOWN.includes(name)

/**
 * Runs one repository method for the route. Unknown method → 404; arguments
 * that are not the method's JSON array → 400.
 */
export async function handleContentQuery(
  repository: ContentRepository,
  method: string,
  rawArgs: string | undefined
): Promise<unknown> {
  if (!isContentMethod(method)) throw new ContentQueryError(404, 'Unknown content query')

  let parsed: unknown
  try {
    parsed = JSON.parse(rawArgs ?? '')
  } catch {
    throw new ContentQueryError(400, 'Invalid content query arguments')
  }
  const result = ARGUMENTS[method].safeParse(parsed)
  if (!result.success) throw new ContentQueryError(400, 'Invalid content query arguments')

  const call = repository[method] as (...args: unknown[]) => Promise<unknown>
  return call.apply(repository, result.data)
}
