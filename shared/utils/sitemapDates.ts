/**
 * Dates for sitemap lastmod. Only real content dates reach these helpers: a
 * page without one gets no lastmod, never the build or request time.
 */

export type DateInput = Date | string | null | undefined

/** A valid date from a Date or a date string, or undefined. */
export function toValidDate(raw: DateInput): Date | undefined {
  if (!raw) return undefined
  const time = new Date(raw).getTime()
  return Number.isNaN(time) ? undefined : new Date(time)
}

/** The latest of the given dates, or undefined when none is usable. */
export function newestDate(dates: readonly DateInput[]): Date | undefined {
  let newest: Date | undefined
  for (const raw of dates) {
    const date = toValidDate(raw)
    if (date && (!newest || date.getTime() > newest.getTime())) newest = date
  }
  return newest
}

/**
 * A blog article's lastmod, the date its own sitemap entry carries (`onUrl`
 * in content.config.ts; that body cannot import this file).
 */
export function articleLastmod(article: {
  updatedDate?: DateInput
  releaseDate?: DateInput
  pubDate?: DateInput
}): Date | undefined {
  return toValidDate(article.updatedDate ?? article.releaseDate ?? article.pubDate)
}
