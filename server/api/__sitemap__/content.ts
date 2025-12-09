import { defineSitemapEventHandler, queryContent } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler(async (event) => {
  // Use queryContent from #imports to avoid package import resolution issues
  const docs = await queryContent(event).find()

  const entries: SitemapUrlInput[] = docs
    .filter((doc) => typeof doc._path === 'string')
    .map((doc) => {
      const lastmod =
        doc.sitemap?.lastmod ??
        doc.updatedAt ??
        doc.pubDate ??
        doc.publishedAt ??
        doc.date ??
        undefined

      return {
        loc: doc.sitemap?.loc || (doc._path as string),
        lastmod: lastmod ? new Date(lastmod as string) : undefined,
        changefreq: doc.sitemap?.changefreq,
        priority: doc.sitemap?.priority,
        images: doc.sitemap?.images,
        videos: doc.sitemap?.videos,
        alternates: Array.isArray(doc.alternates) ? doc.alternates : undefined
      }
    })

  return entries
})
