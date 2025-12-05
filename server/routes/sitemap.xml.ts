import { defineEventHandler } from 'h3'
import { SitemapService } from '../sitemap/service'

const sitemapService = new SitemapService()

export default defineEventHandler(async (event) => {
  const xml = await sitemapService.generate(event)
  event.node.res.setHeader('Content-Type', 'application/xml')
  return xml
})
