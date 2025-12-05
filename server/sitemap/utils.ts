import type { BlogArticle } from '~/types/blog'

export const normalizeDate = (value?: string | Date | null) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const isReleased = (article: BlogArticle) => {
  const release = normalizeDate((article as any).releaseDate ?? article.pubDate)
  if (!release) return true
  return release.getTime() <= Date.now()
}
