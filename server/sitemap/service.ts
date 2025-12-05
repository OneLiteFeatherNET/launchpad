import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { BlogContentFetcher } from './content-fetcher'
import { SitemapBuilder } from './builder'
import { DEFAULT_LOCALE, supportedLocales } from './locales'
import { renderSitemap } from './render'
import type { SitemapContext } from './types'

export class SitemapService {
  constructor(private readonly fetcher = new BlogContentFetcher()) {}

  private createContext(event: H3Event): SitemapContext {
    const config = useRuntimeConfig(event)
    const baseUrl =
      (config.public?.siteUrl as string | undefined) ||
      (config.public?.baseUrl as string | undefined) ||
      'https://onelitefeather.net'

    return {
      baseUrl,
      defaultLocale: DEFAULT_LOCALE,
      locales: supportedLocales()
    }
  }

  async generate(event: H3Event): Promise<string> {
    const context = this.createContext(event)
    const articles = await this.fetcher.fetchArticles(event)

    const builder = new SitemapBuilder(context)
    builder.addStaticRoutes()
    builder.addBlogEntries(articles)

    return renderSitemap(builder.getEntries())
  }
}
