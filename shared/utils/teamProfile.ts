/**
 * A member profile with neither bio nor slogan renders only name and role —
 * Google reports it as a soft 404. Shared by the profile page (noindex) and
 * the Nitro sitemap source (omit); keep this file top level, see AGENTS.md.
 */
import { localizedAlternates, type SitemapAlternate } from './sitemapAlternates'

export interface TeamProfileText {
  bio?: string | null
  slogan?: string | null
}

export function isThinTeamProfile(member: TeamProfileText): boolean {
  return !member.bio?.trim() && !member.slogan?.trim()
}

/**
 * Sitemap entries for the profiles listed in each language. A member counts
 * as an alternate only in the languages where its profile is listed, so a
 * thin profile in one language is not offered there. The team data carries
 * no modification date, so these entries have no lastmod.
 */
export interface TeamSitemapEntry {
  loc: string
  alternatives: SitemapAlternate[]
}

type TeamSlugsByLocale = Record<string, readonly string[]>

export function teamSitemapEntries(slugsByLocale: TeamSlugsByLocale): TeamSitemapEntry[] {
  const localesBySlug = new Map<string, string[]>()
  for (const [locale, slugs] of Object.entries(slugsByLocale)) {
    for (const slug of slugs) localesBySlug.set(slug, [...(localesBySlug.get(slug) ?? []), locale])
  }
  const entries: TeamSitemapEntry[] = []
  for (const [locale, slugs] of Object.entries(slugsByLocale)) {
    for (const slug of slugs) {
      const locales = localesBySlug.get(slug) ?? [locale]
      entries.push({
        loc: `/${locale}/team/${slug}`,
        alternatives: localizedAlternates(locales, (l) => `/${l}/team/${slug}`),
      })
    }
  }
  return entries
}
