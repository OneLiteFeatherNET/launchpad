import type { Locale, FaqEntry } from '#layers/content-core'

/**
 * Fetches all FAQ entries for the active locale, ordered by the optional
 * `order` frontmatter field. The Markdown body of each entry is rendered by
 * the caller via `<ContentRenderer>` so links and other inline formatting
 * survive into the DOM.
 */
export function useFaqContent() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'en') as Locale)

  const { data: entries } = useAsyncData<FaqEntry[]>(
    () => `faq-${activeLocale.value}`,
    () => repo.listFaqEntries(activeLocale.value),
    { watch: [activeLocale] }
  )

  const items = computed<FaqEntry[]>(() => entries.value || [])

  return { items }
}
