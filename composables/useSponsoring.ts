import { queryCollection } from '#imports'
import type { SponsorEntry, SponsorsDocument } from '~/types/sponsoring'

export function useSponsoring() {
  const { locale } = useI18n()
  type SponsorsCollectionKey = 'sponsors_de' | 'sponsors_en'
  const collectionKey = computed<SponsorsCollectionKey>(
    () => (`sponsors_${locale?.value || 'de'}`) as SponsorsCollectionKey
  )

  const { data } = useAsyncData<SponsorsDocument | null>(
    'sponsors',
    () => queryCollection(collectionKey.value).first<SponsorsDocument>(),
    { watch: [collectionKey] }
  )

  const sponsors = computed<SponsorEntry[]>(() => {
    const doc = data.value || undefined
    return (doc?.sponsors as SponsorEntry[] | undefined) ?? []
  })

  return { sponsors }
}
