import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type {
  HomeCarouselDocument,
  HomeCarouselSlide,
  ServerConceptDocument,
  ServerConnectDocument
} from '~/types/home'
import type { CommunityPoi } from '~/types/community-poi'
import { COMMUNITY_POI_STATUS_ORDER } from '~/types/community-poi'
import type { PoiSlide } from '~/types/carousel'

const updatedTs = (entry: CommunityPoi): number => {
  const raw = entry.updatedAt ?? entry.startedAt
  if (!raw) return 0
  const parsed = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

const poiToSlide = (poi: CommunityPoi, localeCode: string): PoiSlide => ({
  type: 'poi',
  title: poi.title,
  href: `/${localeCode}/community-poi/${poi.slug}`,
  caption: poi.featuredCaption || poi.summary,
  image: poi.thumbnail,
  alt: poi.thumbnailAlt || poi.title,
  status: poi.status,
  progress: poi.progress,
  category: poi.category
})

export function useHomeContent() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: concept } = useAsyncData<ServerConceptDocument | null>(
    () => `server-concept-home-${activeLocale.value}`,
    () => repo.getServerConcept(activeLocale.value),
    { watch: [activeLocale] }
  )

  const { data: connect } = useAsyncData<ServerConnectDocument | null>(
    () => `server-connect-${activeLocale.value}`,
    () => repo.getServerConnect(activeLocale.value),
    { watch: [activeLocale] }
  )

  const { data: homeCarousel } = useAsyncData<HomeCarouselDocument | null>(
    () => `home-carousel-${activeLocale.value}`,
    () => repo.getHomeCarousel(activeLocale.value),
    { watch: [activeLocale] }
  )

  // Featured POIs surface on the home carousel without anyone touching the
  // carousel JSON: maintainers just flip `featured: true` in the POI's
  // frontmatter and the next build picks it up.
  const { data: featuredPois } = useAsyncData<CommunityPoi[]>(
    () => `featured-community-pois-${activeLocale.value}`,
    () => repo.listCommunityPois(activeLocale.value),
    { watch: [activeLocale] }
  )

  const slides = computed<HomeCarouselSlide[]>(() => {
    const base = (homeCarousel.value?.slides as HomeCarouselSlide[] | undefined) ?? []
    const featured = (featuredPois.value || []).filter((p) => p.featured)
    if (!featured.length) return base
    const ordered = [...featured].sort((a, b) => {
      const sa = COMMUNITY_POI_STATUS_ORDER[a.status] ?? 99
      const sb = COMMUNITY_POI_STATUS_ORDER[b.status] ?? 99
      if (sa !== sb) return sa - sb
      return updatedTs(b) - updatedTs(a)
    })
    const poiSlides = ordered.map((poi) => poiToSlide(poi, activeLocale.value))
    return [...base, ...poiSlides]
  })

  return {
    concept,
    connect,
    slides
  }
}
