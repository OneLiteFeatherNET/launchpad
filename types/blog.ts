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

export interface BlogAuthorProfile {
  slug: string
  name: string
  role?: string
  avatar?: string
  bio?: string
  links?: {
    website?: string
    github?: string
    twitter?: string
    linkedin?: string
    mastodon?: string
    discord?: string
  }
}

// Extend content-generated item type with optional new header fields
export type BlogArticle = (
  | BlogDeCollectionItem
  | BlogEnCollectionItem
) & {
  author?: string | string[]
  authors?: BlogAuthorProfile[]
  releaseDate?: string | Date
  canonical?: string
  alternates?: BlogAlternateHeader[]
  seo?: BlogSEO
  head?: Record<string, any>
}
