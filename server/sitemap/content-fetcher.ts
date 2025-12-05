import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import { LOCALE_COLLECTIONS } from './locales'
import { isReleased } from './utils'
import type { LocalizedArticle, LocaleCode } from './types'

export class BlogContentFetcher {
  async fetchArticles(event: H3Event): Promise<LocalizedArticle[]> {
    const articles: LocalizedArticle[] = []

    for (const locale of Object.keys(LOCALE_COLLECTIONS) as LocaleCode[]) {
      const collectionKey = LOCALE_COLLECTIONS[locale]
      const items = (await queryCollection(event, collectionKey).all()) as LocalizedArticle[]
      const visible = items.filter(isReleased).map((item) => ({ ...item, locale }))
      articles.push(...visible)
    }

    return articles
  }
}
