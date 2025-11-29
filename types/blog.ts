import type { BlogDeCollectionItem, BlogEnCollectionItem } from '@nuxt/content'

export interface BlogAlternateHeader {
  hreflang: string
  href: string
}

export interface BlogAlternateLanguageLink {
  locale: string
  url: string
}

// Extend content-generated item type with optional new header fields
export type BlogArticle = (
  | BlogDeCollectionItem
  | BlogEnCollectionItem
) & {
  canonical?: string
  alternates?: BlogAlternateHeader[]
}
