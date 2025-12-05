import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { BlogContentFetcher } from '../sitemap/content-fetcher'
import { SitemapBuilder } from '../sitemap/builder'
import { renderSitemap } from '../sitemap/render'
import { DEFAULT_LOCALE, supportedLocales } from '../sitemap/locales'
import type { SitemapContext } from '../sitemap/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl =
    config.public?.siteUrl || config.public?.baseUrl || 'https://onelitefeather.net'

  const context: SitemapContext = {
    baseUrl,
    defaultLocale: DEFAULT_LOCALE,
    locales: supportedLocales()
  }

  const fetcher = new BlogContentFetcher()
  const articles = await fetcher.fetchArticles(event)

  const builder = new SitemapBuilder(context)
  builder.addStaticRoutes()
  builder.addBlogEntries(articles)

  const xml = renderSitemap(builder.getEntries())
  event.node.res.setHeader('Content-Type', 'application/xml')
  return xml
})
