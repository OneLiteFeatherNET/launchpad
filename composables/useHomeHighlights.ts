import type { Locale } from '#layers/content-core'
import type { AnySlide } from '#layers/home'
import { authorSlugsOf } from '#shared/utils/blogAuthors'

export interface HomeHighlights {
  /** The moment "new" was decided, as an ISO string. */
  now: string
  slides: AnySlide[]
  /** Not-new content for filling a sparse carousel, newest first. */
  recent: AnySlide[]
}

const emptyHighlights = (): HomeHighlights => ({
  now: new Date(0).toISOString(),
  slides: [],
  recent: []
})

/**
 * The home carousel's new slides: blog, POIs and projects published within the
 * last 30 days. Lives at the root because it reads three domains, which no
 * layer may know about each other.
 *
 * The window is decided inside the data handler, so `now` is fixed on the
 * server and travels in the payload; the browser never asks the clock again.
 */
export function useHomeHighlights() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: highlights } = useAsyncData<HomeHighlights>(
    () => `home-highlights-${activeLocale.value}`,
    async () => {
      const now = new Date()
      const [
        articles,
        pois,
        projects
      ] = await Promise.all([
        repo.listBlogArticles(activeLocale.value),
        repo.listCommunityPois(activeLocale.value),
        repo.listProjects(activeLocale.value)
      ])
      const shown = [
        ...freshBlogArticles(articles, now), ...recentBlogArticles(articles, now, MIN_SLIDES)
      ]
      const people = await resolvePeople(
        [...new Set(shown.flatMap(authorSlugsOf))],
        activeLocale.value
      )
      const sources = { locale: activeLocale.value, now, articles: shown, people, pois, projects }
      return {
        now: now.toISOString(),
        slides: freshSlides(sources),
        recent: recentSlides(sources)
      }
    },
    { watch: [activeLocale], default: emptyHighlights }
  )

  return { highlights }
}
