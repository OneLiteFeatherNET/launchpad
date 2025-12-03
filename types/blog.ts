import type { BlogDeCollectionItem, BlogEnCollectionItem } from '@nuxt/content'

export interface BlogAlternateHeader {
  hreflang: string
  href: string
}

export interface BlogAlternateLanguageLink {
  locale: string
  url: string
}

export interface BlogSEO {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  twitterTitle?: string
  twitterDescription?: string
}

// Extend content-generated item type with optional new header fields
export type BlogArticle = (
  | BlogDeCollectionItem
  | BlogEnCollectionItem
) & {
  releaseDate?: string | Date
  canonical?: string
  alternates?: BlogAlternateHeader[]
  seo?: BlogSEO
  head?: Record<string, any>
}
