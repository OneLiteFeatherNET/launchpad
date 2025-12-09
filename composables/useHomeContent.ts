import type {
  HomeCarouselDocument,
  HomeCarouselSlide,
  ServerConceptDocument,
  ServerConnectDocument,
  SponsorsDocument,
  SponsorEntry
} from '~/types/home'

export function useHomeContent() {
  const { locale } = useI18n()

  // Server concept content from Nuxt Content (i18n)
  const { data: conceptData } = useAsyncData<ServerConceptDocument[]>(
    'server-concept-home',
    () => {
      // @ts-ignore queryCollection is provided by @nuxt/content
      return queryCollection('server_concept_' + (locale?.value || 'de')).all()
    },
    { watch: [locale] }
  )

  const concept = computed<ServerConceptDocument | null>(
    () => (conceptData.value?.[0] as ServerConceptDocument | undefined) ?? null
  )

  // Server Connect content from Nuxt Content (i18n)
  const { data: connectData } = useAsyncData<ServerConnectDocument[]>(
    'server-connect',
    () => {
      // @ts-ignore queryCollection is provided by @nuxt/content
      return queryCollection('server_connect_' + (locale?.value || 'de')).all()
    },
    { watch: [locale] }
  )

  const connect = computed<ServerConnectDocument | null>(
    () => (connectData.value?.[0] as ServerConnectDocument | undefined) ?? null
  )

  // Carousel content from Nuxt Content (i18n)
  const { data: homeCarousel } = useAsyncData<HomeCarouselDocument[]>(
    'home-carousel',
    () => {
      // @ts-ignore queryCollection is provided by @nuxt/content
      return queryCollection('home_carousel_' + (locale?.value || 'de')).all()
    },
    { watch: [locale] }
  )

  const slides = computed<HomeCarouselSlide[]>(() => {
    const doc = homeCarousel.value?.[0] as HomeCarouselDocument | undefined
    return (doc?.slides as HomeCarouselSlide[] | undefined) ?? []
  })

  return {
    concept,
    connect,
    slides,
    sponsors: computed(() => []) // deprecated: use useSponsoring instead
  }
}
