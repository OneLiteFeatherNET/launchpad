/**
 * Release rule and author lookups for blog articles, shared by the author
 * page, the team profile and the Nitro sitemap source so they never disagree
 * about which articles exist for a visitor.
 */

export interface BlogAuthorFields {
  slug?: string
  author?: string | string[]
  releaseDate?: Date | string
  pubDate?: Date | string
}

/** Release time in ms, or null when the article has no usable date. */
export function releaseTimeOf(entry: BlogAuthorFields): number | null {
  const raw = entry.releaseDate ?? entry.pubDate
  if (!raw) return null
  const time = new Date(raw).getTime()
  return Number.isNaN(time) ? null : time
}

/** An article is out once its release date (or pubDate) has passed. */
export function isReleasedAt(entry: BlogAuthorFields, now: Date): boolean {
  const release = releaseTimeOf(entry)
  return release === null || release <= now.getTime()
}

export function authorSlugsOf(entry: BlogAuthorFields): string[] {
  if (!entry.author) return []
  return (Array.isArray(entry.author) ? entry.author : [entry.author]).map(String)
}

/** Released articles naming `slug` as author, newest first. */
export function articlesByAuthor<T extends BlogAuthorFields>(
  entries: readonly T[],
  slug: string,
  now: Date
): T[] {
  return entries
    .filter((entry) => isReleasedAt(entry, now) && authorSlugsOf(entry).includes(slug))
    .sort((a, b) => (releaseTimeOf(b) ?? 0) - (releaseTimeOf(a) ?? 0))
}

/** Every author slug with at least one released article, first-seen order. */
export function releasedAuthorSlugs(entries: readonly BlogAuthorFields[], now: Date): string[] {
  const slugs = new Set<string>()
  for (const entry of entries) {
    if (!isReleasedAt(entry, now)) continue
    for (const slug of authorSlugsOf(entry)) slugs.add(slug)
  }
  return [...slugs]
}

export function blogAuthorPath(locale: string, slug: string): string {
  return `/${locale}/blog/author/${slug}`
}

export interface BlogAuthorSitemapSource {
  articles: readonly BlogAuthorFields[]
  /** Slugs that resolve to a person in this locale (roster plus authors). */
  resolvable: readonly string[]
}

/** Sitemap entries for exactly the author pages that answer 200 at `now`. */
export function blogAuthorSitemapEntries(
  byLocale: Record<string, BlogAuthorSitemapSource>,
  now: Date
): { loc: string }[] {
  const entries: { loc: string }[] = []
  for (const [locale, { articles, resolvable }] of Object.entries(byLocale)) {
    for (const slug of releasedAuthorSlugs(articles, now)) {
      if (resolvable.includes(slug)) entries.push({ loc: blogAuthorPath(locale, slug) })
    }
  }
  return entries
}
