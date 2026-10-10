import type { Locale } from '#layers/content-core'
import type { AboutDocument } from '../types'

/** The about page's document for the active locale. */
export async function useAbout() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: about } = await useAsyncData<AboutDocument | null>(
    () => `about-${activeLocale.value}`,
    () => repo.getAboutDocument(activeLocale.value),
    { watch: [activeLocale] }
  )

  return { about }
}
