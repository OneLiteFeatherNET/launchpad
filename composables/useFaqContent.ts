import { queryCollection } from '#imports'
import type { PageCollectionItemBase } from '@nuxt/content'

type FaqCollectionKey = 'faq_de' | 'faq_en'

export interface FaqDocument extends PageCollectionItemBase {
  key: string
  question: string
  order?: number
}

/**
 * Fetches all FAQ entries for the active locale, ordered by the optional
 * `order` frontmatter field. The Markdown body of each entry is rendered by
 * the caller via `<ContentRenderer>` so links and other inline formatting
 * survive into the DOM.
 */
export function useFaqContent() {
  const { locale } = useI18n()
  const collection = computed<FaqCollectionKey>(() => (`faq_${locale?.value || 'en'}`) as FaqCollectionKey)

  const { data: entries } = useAsyncData<FaqDocument[]>(
    () => `faq-${collection.value}`,
    () => queryCollection(collection.value).order('order', 'ASC').all() as Promise<FaqDocument[]>,
    { watch: [collection] }
  )

  const items = computed<FaqDocument[]>(() => entries.value || [])

  return { items }
}
