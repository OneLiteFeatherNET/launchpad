import type { BlogCollectionKey, LocaleCode } from './types'

export const LOCALE_COLLECTIONS: Record<LocaleCode, BlogCollectionKey> = {
  de: 'blog_de',
  en: 'blog_en'
}

export const DEFAULT_LOCALE: LocaleCode = 'de'

export const supportedLocales = (): LocaleCode[] => Object.keys(LOCALE_COLLECTIONS) as LocaleCode[]
