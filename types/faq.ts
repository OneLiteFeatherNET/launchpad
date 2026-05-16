import type { PageCollectionItemBase } from '@nuxt/content'

/**
 * Domain model for a single FAQ entry.
 *
 * NOTE: `body`/`PageCollectionItemBase` is currently required because the FAQ
 * page renders the Markdown body via `<ContentRenderer>`. This is the one
 * remaining provider-specific coupling at the rendering layer; a future CMS
 * adapter would need to map its rich-text payload onto this shape (or the
 * rendering would move to plain HTML). Data access itself is already behind
 * the ContentRepository.
 */
export interface FaqEntry extends PageCollectionItemBase {
  key: string
  question: string
  order?: number
}
