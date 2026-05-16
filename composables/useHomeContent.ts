import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type {
  HomeCarouselDocument,
  HomeCarouselSlide,
  ServerConceptDocument,
  ServerConnectDocument
} from '~/types/home'

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

  const slides = computed<HomeCarouselSlide[]>(() => {
    return (homeCarousel.value?.slides as HomeCarouselSlide[] | undefined) ?? []
  })

  return {
    concept,
    connect,
    slides
  }
}
