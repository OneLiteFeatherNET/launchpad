import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type { SponsorEntry, SponsorsDocument } from '~/types/sponsoring'

export function useSponsoring() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data } = useAsyncData<SponsorsDocument | null>(
    () => `sponsors-${activeLocale.value}`,
    () => repo.getSponsorsDocument(activeLocale.value),
    { watch: [activeLocale] }
  )

  const sponsors = computed<SponsorEntry[]>(() => {
    const doc = data.value || undefined
    return (doc?.sponsors as SponsorEntry[] | undefined) ?? []
  })

  return { sponsors }
}
