import type { Locale } from '#layers/content-core'
import type { SponsorEntry, SponsorsDocument } from '../types'

export function useSponsoring() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data, status } = useAsyncData<SponsorsDocument | null>(
    () => `sponsors-${activeLocale.value}`,
    () => repo.getSponsorsDocument(activeLocale.value),
    { watch: [activeLocale], ...PAGE_DATA_OPTIONS }
  )

  const sponsors = computed<SponsorEntry[]>(() => {
    const doc = data.value || undefined
    return (doc?.sponsors as SponsorEntry[] | undefined) ?? []
  })

  return { sponsors, loading: useIsLoading(status) }
}
