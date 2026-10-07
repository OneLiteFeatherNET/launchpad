import type { BlogArticle, CommunityPoiSummary, Person, ProjectSummary } from '#layers/content-core'
import { authorSlugsOf, isReleasedAt, releaseTimeOf } from '#shared/utils/blogAuthors'
import type { AnySlide, BlogSlide, EventSlide, PoiSlide, ProjectSlide } from '../types-carousel'

/** How long content counts as new after it appeared on the site. */
export const HIGHLIGHT_WINDOW_DAYS = 30

/** Most new slides from blog, POIs and projects together. */
export const MAX_HIGHLIGHTS = 6

const DAY_MS = 86_400_000

const timeOf = (value: string | Date | null | undefined): number | null => {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

/** Whether `publishedAt` lies within the window before `now`; the future is not new. */
export function isNewAt(publishedAt: string | Date | null | undefined, now: Date): boolean {
  const time = timeOf(publishedAt)
  if (time === null) return false
  const age = now.getTime() - time
  return age >= 0 && age <= HIGHLIGHT_WINDOW_DAYS * DAY_MS
}

export interface HighlightSources {
  locale: string
  now: Date
  articles: readonly BlogArticle[]
  /** The authors of `articles`, resolved by the caller. */
  people: readonly Person[]
  pois: readonly CommunityPoiSummary[]
  projects: readonly ProjectSummary[]
}

type FreshSlide = BlogSlide | PoiSlide | ProjectSlide

const publishedTime = (article: BlogArticle): number | null => releaseTimeOf(article)

/** Released articles inside the window; lets the caller resolve only these authors. */
export function freshBlogArticles(articles: readonly BlogArticle[], now: Date): BlogArticle[] {
  return articles.filter((article) => (
    isReleasedAt(article, now) && isNewAt(new Date(publishedTime(article) ?? Number.NaN), now)
  ))
}

/**
 * Slides for content published on the site within the window, newest first and
 * at most {@link MAX_HIGHLIGHTS}. Content without a `publishedAt` is never new.
 */
export function freshSlides(sources: HighlightSources): FreshSlide[] {
  const { locale, now, articles, people, pois, projects } = sources
  const names = new Map(people.map((person) => [person.slug, person.name]))
  const dated: { at: number, slide: FreshSlide }[] = []

  for (const article of freshBlogArticles(articles, now)) {
    const at = publishedTime(article) as number
    const authors = authorSlugsOf(article).map((slug) => names.get(slug)).filter(Boolean)
    dated.push({
      at,
      slide: {
        type: 'blog',
        title: article.title,
        href: `/${locale}/blog/${article.slug}`,
        excerpt: article.description,
        image: article.headerImage,
        alt: article.headerImageAlt,
        author: authors.length ? authors.join(', ') : undefined,
        date: new Date(at).toISOString(),
        isNew: true
      }
    })
  }

  for (const poi of pois) {
    if (!isNewAt(poi.publishedAt, now)) continue
    dated.push({
      at: timeOf(poi.publishedAt) as number,
      slide: {
        type: 'poi',
        title: poi.title,
        href: `/${locale}/community-poi/${poi.slug}`,
        caption: poi.featuredCaption || poi.summary,
        image: poi.thumbnail,
        alt: poi.thumbnailAlt || poi.title,
        status: poi.status,
        progress: poi.progress,
        category: poi.category === 'farm' ? undefined : poi.category,
        isNew: true
      }
    })
  }

  for (const project of projects) {
    if (!isNewAt(project.publishedAt, now)) continue
    dated.push({
      at: timeOf(project.publishedAt) as number,
      slide: {
        type: 'project',
        title: project.title,
        href: `/${locale}/projects/${project.slug}`,
        summary: project.summary,
        image: project.logo,
        alt: project.logoAlt,
        status: project.status,
        platforms: project.platforms ?? undefined,
        isNew: true
      }
    })
  }

  return dated
    .sort((a, b) => (b.at - a.at) || a.slide.href.localeCompare(b.slide.href))
    .slice(0, MAX_HIGHLIGHTS)
    .map(({ slide }) => slide)
}

/** What the carousel needs of a promoted event; the events layer's card satisfies it. */
export interface HighlightEvent {
  title: string
  summary?: string
  startsAt: string
  endsAt?: string
  announcedAt?: string
  path: string
  thumbnail?: string
  thumbnailAlt?: string
}

/** An event slide, marked new when the event was announced inside the window. */
export function eventSlide(event: HighlightEvent, now: Date): EventSlide {
  return {
    type: 'event',
    title: event.title,
    dateStart: event.startsAt,
    dateEnd: event.endsAt,
    href: event.path,
    image: event.thumbnail,
    alt: event.thumbnailAlt,
    note: event.summary,
    ...(isNewAt(event.announcedAt, now) ? { isNew: true } : {})
  }
}

interface ComposeInput {
  events: readonly AnySlide[]
  fresh: readonly AnySlide[]
  curated: readonly AnySlide[]
}

const hrefOf = (slide: AnySlide): string | undefined => ('href' in slide ? slide.href : undefined)

/**
 * Promoted events first, then the new slides, then the curated ones; a curated
 * slide that points where a generated one does is dropped.
 */
export function composeSlides(input: ComposeInput): AnySlide[] {
  const { events, fresh, curated } = input
  const generated = [...events, ...fresh]
  const taken = new Set(generated.map(hrefOf).filter(Boolean))
  return [
    ...generated,
    ...curated.filter((slide) => {
      const href = hrefOf(slide)
      return !href || !taken.has(href)
    })
  ]
}
