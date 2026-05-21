import { queryCollection } from '@nuxt/content/server'
import type { TeamDocument, TeamMember } from '~/types/team'

/**
 * Sitemap source for individual team profile pages.
 *
 * The team JSON is a `data`-type Nuxt Content collection (a single
 * document per locale), so the per-member URLs don't fall out of
 * `asSitemapCollection` the way blog posts do. We materialise them
 * here, one entry per locale × member, so both /de/team/<slug> and
 * /en/team/<slug> end up in the per-locale sitemaps.
 */
type LocaleKey = 'de' | 'en'

const LOCALES: ReadonlyArray<LocaleKey> = ['de', 'en']

export default defineEventHandler(async (event) => {
  const out: { loc: string }[] = []
  for (const locale of LOCALES) {
    const key = `team_${locale}` as 'team_de' | 'team_en'
    const docs = (await queryCollection(event, key).all()) as TeamDocument[]
    const doc = docs[0]
    const members = (doc?.members || []) as TeamMember[]
    for (const m of members) {
      if (!m.slug || m.openPosition) continue
      out.push({ loc: `/${locale}/team/${m.slug}` })
    }
  }
  return out
})
