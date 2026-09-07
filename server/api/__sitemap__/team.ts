import { queryCollection } from '@nuxt/content/server'
import type { TeamDeCollectionItem, TeamEnCollectionItem } from '@nuxt/content'
// NOTE: this reaches past content-core's public index deliberately. Nitro's
// `impound` plugin refuses `#layers/content-core` here because content-core's
// index.ts pulls in `useContentRepository`, which imports `@nuxt/content`
// directly — disallowed outside the Nuxt app bundle. Verified by `nuxi build`:
// the `#layers/content-core` alias produces a Rollup "Importing directly from
// module entry-points is not allowed" error for this route. Registered as a
// named exception in tests/architecture/module-boundaries.spec.ts.
import { locales } from '~/layers/content-core/utils/content/locales'

// TeamDocument/TeamMember are duplicated from the `team` layer's types.ts
// rather than imported from it: this route already reaches past
// content-core's index for the same Nitro/impound reason above, and the
// `team` layer lives outside the layers this root file may import a bare
// index from without adding a second, harder-to-justify exception. Naming
// @nuxt/content directly is already this file's registered exception, so
// deriving the shape from it here costs nothing new.
type TeamDocument = TeamDeCollectionItem | TeamEnCollectionItem
type TeamMember = NonNullable<TeamDocument['members']>[number]

/**
 * Sitemap source for individual team profile pages.
 *
 * The team JSON is a `data`-type Nuxt Content collection (a single
 * document per locale), so the per-member URLs don't fall out of
 * `asSitemapCollection` the way blog posts do. We materialise them
 * here, one entry per locale × member, so both /de/team/<slug> and
 * /en/team/<slug> end up in the per-locale sitemaps.
 */

export default defineEventHandler(async (event) => {
  const out: { loc: string }[] = []
  for (const locale of locales) {
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
