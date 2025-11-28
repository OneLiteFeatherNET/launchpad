import type { BlogDeCollectionItem, BlogEnCollectionItem } from '@nuxt/content'

export type BlogArticle =
  | BlogDeCollectionItem
  | BlogEnCollectionItem

export interface BlogAlternateLanguageLink {
  locale: string
  url: string
}

