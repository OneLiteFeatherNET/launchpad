import type { BlogArticle } from '~/types/blog'

export type LocaleCode = 'de' | 'en'
export type BlogCollectionKey = 'blog_de' | 'blog_en'

export interface SitemapContext {
  baseUrl: string
  defaultLocale: LocaleCode
  locales: LocaleCode[]
}

export interface AlternateLink {
  hreflang: string
  href: string
}

export interface UrlEntry {
  loc: string
  lastmod?: string
  alternates?: AlternateLink[]
}

export type LocalizedArticle = BlogArticle & { locale: LocaleCode }
