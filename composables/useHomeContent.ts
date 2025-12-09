import type {
  HomeCarouselDocument,
  HomeCarouselSlide,
  ServerConceptDocument,
  ServerConnectDocument
} from '~/types/home'

export function useHomeContent() {
  const { locale } = useI18n()

  const fetchCollection = async <T>(key: string) => {
    // @ts-expect-error queryCollection is provided by @nuxt/content at runtime
    return (await queryCollection(key).all()) as T[]
  }

  // Server concept content from Nuxt Content (i18n)
  const { data: conceptData } = useAsyncData<ServerConceptDocument[]>(
    'server-concept-home',
    () => fetchCollection<ServerConceptDocument>('server_concept_' + (locale?.value || 'de')),
    { watch: [locale] }
  )

  const concept = computed<ServerConceptDocument | null>(
    () => (conceptData.value?.[0] as ServerConceptDocument | undefined) ?? null
  )

  // Server Connect content from Nuxt Content (i18n)
  const { data: connectData } = useAsyncData<ServerConnectDocument[]>(
    'server-connect',
    () => fetchCollection<ServerConnectDocument>('server_connect_' + (locale?.value || 'de')),
    { watch: [locale] }
  )

  const connect = computed<ServerConnectDocument | null>(
    () => (connectData.value?.[0] as ServerConnectDocument | undefined) ?? null
  )

  // Carousel content from Nuxt Content (i18n)
  const { data: homeCarousel } = useAsyncData<HomeCarouselDocument[]>(
    'home-carousel',
    () => fetchCollection<HomeCarouselDocument>('home_carousel_' + (locale?.value || 'de')),
    { watch: [locale] }
  )

  const slides = computed<HomeCarouselSlide[]>(() => {
    const doc = homeCarousel.value?.[0] as HomeCarouselDocument | undefined
    return (doc?.slides as HomeCarouselSlide[] | undefined) ?? []
  })

  return {
    concept,
    connect,
    slides
  }
}
