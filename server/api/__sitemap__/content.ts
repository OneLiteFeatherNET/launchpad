import { defineSitemapEventHandler } from '#imports'
import { serverQueryContent } from '@nuxt/content/server'
import { createSitePathResolver } from '#site-config/server/composables/utils'
import type { SitemapUrlInput } from '#sitemap/types'

type ContentDoc = Record<string, any>

const KNOWN_LOCALES: Record<string, string> = {
  de: 'de-DE',
  en: 'en-US'
}

const guessLocale = (doc: ContentDoc): string => {
  if (typeof doc._locale === 'string') return doc._locale
  const path = typeof doc._path === 'string' ? doc._path : ''
  const firstSegment = path.split('/').filter(Boolean)[0]
  return KNOWN_LOCALES[firstSegment] ? firstSegment : 'en'
}

const toDate = (value: unknown): Date | undefined => {
  if (!value) return undefined
  const parsed = new Date(value as string)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export default defineSitemapEventHandler(async (event) => {
  const resolvePath = createSitePathResolver(event, {
    canonical: true,
    absolute: true,
    withBase: true
  })

  const docs = await serverQueryContent(event).find()

  // Group docs by translationKey (fallback to _id) to derive alternates when not provided
  const byTranslation = new Map<string, ContentDoc[]>()
  for (const doc of docs) {
    const key =
      typeof doc.translationKey === 'string'
        ? doc.translationKey
        : typeof doc._id === 'string'
          ? doc._id
          : undefined
    if (!key) continue
    byTranslation.set(key, [...(byTranslation.get(key) || []), doc])
  }

  const buildAlternates = (doc: ContentDoc): SitemapUrlInput['alternates'] => {
    const fromFrontmatter = Array.isArray(doc.alternates)
      ? (doc.alternates as Array<{ hreflang?: string; href?: string }>)
      : []

    const fromTranslations: Array<{ hreflang: string; href: string }> = []
    const key = typeof doc.translationKey === 'string' ? doc.translationKey : undefined
    if (key && byTranslation.has(key)) {
      const siblings = byTranslation.get(key) || []
      for (const sibling of siblings) {
        if (sibling === doc) continue
        const loc = resolvePath(
          sibling.sitemap?.loc || (sibling._path as string | undefined) || '/'
        )
        const locale = guessLocale(sibling)
        fromTranslations.push({ hreflang: KNOWN_LOCALES[locale] || locale, href: loc })
      }
    }

    const merged = [...fromFrontmatter, ...fromTranslations]
      .filter((alt) => alt && alt.hreflang && alt.href)
      .map((alt) => ({
        hreflang: alt.hreflang as string,
        href:
          typeof alt.href === 'string' && alt.href.startsWith('http')
            ? alt.href
            : resolvePath(alt.href as string)
      }))

    // Deduplicate by hreflang
    const seen = new Map<string, string>()
    for (const alt of merged) {
      if (!seen.has(alt.hreflang)) {
        seen.set(alt.hreflang, alt.href)
      }
    }

    return seen.size
      ? Array.from(seen.entries()).map(([hreflang, href]) => ({ hreflang, href }))
      : undefined
  }

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

      const baseLoc = doc.sitemap?.loc || (doc._path as string)
      const loc = resolvePath(baseLoc)
      const alternates = buildAlternates(doc)

      return {
        loc,
        lastmod: toDate(lastmod),
        changefreq: doc.sitemap?.changefreq,
        priority: doc.sitemap?.priority,
        images: doc.sitemap?.images,
        videos: doc.sitemap?.videos,
        alternates
      }
    })

  return entries
})
