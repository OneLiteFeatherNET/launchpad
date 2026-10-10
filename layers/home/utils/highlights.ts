import type { BlogArticle, CommunityPoiSummary, Person, ProjectSummary } from '#layers/content-core'
import { authorSlugsOf, isReleasedAt, releaseTimeOf } from '#shared/utils/blogAuthors'
import type { AnySlide, BlogSlide, EventSlide, PoiSlide, ProjectSlide } from '../types-carousel'

/** How long content counts as new after it appeared on the site. */
export const HIGHLIGHT_WINDOW_DAYS = 30

/** The carousel is filled up with recent content to at least this many slides. */
export const MIN_SLIDES = 5

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

const isFreshArticle = (article: BlogArticle, now: Date): boolean => {
  const at = publishedTime(article)
  return isNewAt(at === null ? undefined : new Date(at), now)
}

/** Released articles inside the window; lets the caller resolve only these authors. */
export function freshBlogArticles(articles: readonly BlogArticle[], now: Date): BlogArticle[] {
  return articles.filter((article) => isReleasedAt(article, now) && isFreshArticle(article, now))
}

/** The `count` newest released articles outside the window, for filling up the carousel. */
export function recentBlogArticles(
  articles: readonly BlogArticle[],
  now: Date,
  count: number
): BlogArticle[] {
  return articles
    .filter((article) => isReleasedAt(article, now) && !isFreshArticle(article, now))
    .sort((a, b) => (publishedTime(b) ?? 0) - (publishedTime(a) ?? 0))
    .slice(0, count)
}

interface Dated {
  at: number
  isNew: boolean
  slide: FreshSlide
}

/** Every released entry with the time it counts from; callers split by `isNew`. */
function datedSlides(sources: HighlightSources): Dated[] {
  const { locale, now, articles, people, pois, projects } = sources
  const names = new Map(people.map((person) => [person.slug, person.name]))
  const dated: Dated[] = []

  for (const article of articles) {
    const at = publishedTime(article)
    if (!isReleasedAt(article, now)) continue
    const authors = authorSlugsOf(article).map((slug) => names.get(slug)).filter(Boolean)
    dated.push({
      at: at ?? 0,
      isNew: isNewAt(at === null ? undefined : new Date(at), now),
      slide: {
        type: 'blog',
        title: article.title,
        href: `/${locale}/blog/${article.slug}`,
        excerpt: article.description,
        image: article.headerImage,
        alt: article.headerImageAlt,
        author: authors.length ? authors.join(', ') : undefined,
        date: at === null ? undefined : new Date(at).toISOString()
      }
    })
  }

  for (const poi of pois) {
    const at = timeOf(poi.publishedAt ?? poi.updatedAt ?? poi.startedAt) ?? 0
    if (at > now.getTime()) continue
    dated.push({
      at,
      isNew: isNewAt(poi.publishedAt, now),
      slide: {
        type: 'poi',
        title: poi.title,
        href: `/${locale}/community-poi/${poi.slug}`,
        caption: poi.featuredCaption || poi.summary,
        image: poi.thumbnail,
        alt: poi.thumbnailAlt || poi.title,
        status: poi.status,
        progress: poi.progress,
        category: poi.category === 'farm' ? undefined : poi.category
      }
    })
  }

  for (const project of projects) {
    const at = timeOf(project.publishedAt ?? project.releasedAt) ?? 0
    if (at > now.getTime()) continue
    dated.push({
      at,
      isNew: isNewAt(project.publishedAt, now),
      slide: {
        type: 'project',
        title: project.title,
        href: `/${locale}/projects/${project.slug}`,
        summary: project.summary,
        image: project.logo,
        alt: project.logoAlt,
        status: project.status,
        platforms: project.platforms ?? undefined
      }
    })
  }

  return dated.sort((a, b) => (b.at - a.at) || a.slide.href.localeCompare(b.slide.href))
}

/**
 * Slides for content published on the site within the window, newest first and
 * at most {@link MAX_HIGHLIGHTS}. Content without a `publishedAt` is never new.
 */
export function freshSlides(sources: HighlightSources): FreshSlide[] {
  return datedSlides(sources)
    .filter((entry) => entry.isNew)
    .slice(0, MAX_HIGHLIGHTS)
    .map(({ slide }) => ({ ...slide, isNew: true }))
}

/** Released content that is not new, newest first, without a badge: the fill-up pool. */
export function recentSlides(sources: HighlightSources): FreshSlide[] {
  return datedSlides(sources)
    .filter((entry) => !entry.isNew)
    .slice(0, MIN_SLIDES)
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
  /** Not-new content, newest first; used only while fewer than {@link MIN_SLIDES} slides. */
  recent?: readonly AnySlide[]
}

const hrefOf = (slide: AnySlide): string | undefined => ('href' in slide ? slide.href : undefined)

/**
 * Promoted events first, then the new slides, then the curated ones; a curated
 * slide that points where a generated one does is dropped. Below
 * {@link MIN_SLIDES} the rest is filled with recent slides, skipping any
 * `href` already present.
 */
export function composeSlides(input: ComposeInput): AnySlide[] {
  const { events, fresh, curated, recent = [] } = input
  const generated = [...events, ...fresh]
  const taken = new Set(generated.map(hrefOf).filter(Boolean))
  const slides = [
    ...generated,
    ...curated.filter((slide) => {
      const href = hrefOf(slide)
      return !href || !taken.has(href)
    })
  ]
  for (const slide of slides) taken.add(hrefOf(slide))
  for (const slide of recent) {
    if (slides.length >= MIN_SLIDES) break
    const href = hrefOf(slide)
    if (href && taken.has(href)) continue
    slides.push(slide)
    if (href) taken.add(href)
  }
  return slides
}
