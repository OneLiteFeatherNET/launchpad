import type { UrlEntry } from './types'

const xmlEscape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const renderAlternate = (href: string, hreflang: string) =>
  `<xhtml:link rel="alternate" hreflang="${xmlEscape(hreflang)}" href="${xmlEscape(href)}" />`

const renderEntry = (entry: UrlEntry) => {
  const alternates = (entry.alternates || []).map((alt) => renderAlternate(alt.href, alt.hreflang)).join('')
  const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''
  return `<url><loc>${xmlEscape(entry.loc)}</loc>${lastmod}${alternates}</url>`
}

export const renderSitemap = (entries: UrlEntry[]) => {
  const body = entries.map(renderEntry).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`
}
