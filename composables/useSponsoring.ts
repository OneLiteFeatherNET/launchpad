import type { SponsorEntry, SponsorsDocument } from '~/types/sponsoring'

export function useSponsoring() {
  const { locale } = useI18n()

  const { data } = useAsyncData<SponsorsDocument[]>(
    'sponsors',
    () => {
      // @ts-ignore queryCollection is provided by @nuxt/content
      return queryCollection('sponsors_' + (locale?.value || 'de')).all()
    },
    { watch: [locale] }
  )

  const sponsors = computed<SponsorEntry[]>(() => {
    const doc = data.value?.[0] as SponsorsDocument | undefined
    return (doc?.sponsors as SponsorEntry[] | undefined) ?? []
  })

  return { sponsors }
}
