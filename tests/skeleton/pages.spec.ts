import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

/** Page -> the skeleton it shows while its data loads. */
const PAGES: [string, string][] = [
  ['pages/blog/index.vue', 'Top1Skeleton'],
  ['pages/blog/[...slug].vue', 'ArticleSkeleton'],
  ['pages/blog/author/[slug].vue', 'AuthorBoxSkeleton'],
  ['pages/events/index.vue', 'EventCardSkeleton'],
  ['pages/events/[...slug].vue', 'EventDetailSkeleton'],
  ['pages/projects/index.vue', 'ProjectsOverviewSkeleton'],
  ['pages/projects/[...slug].vue', 'ProjectDetailSkeleton'],
  ['pages/community-poi/index.vue', 'CommunityPoiGridSkeleton'],
  ['pages/community-poi/[...slug].vue', 'CommunityPoiDetailSkeleton'],
  ['pages/team/[slug].vue', 'TeamProfileSkeleton']
]

describe.each(PAGES)('%s', (page, skeleton) => {
  const source = read(page)

  it('takes `loading` from its data composable', () => {
    expect(source).toMatch(/const \{[^}]*\bloading\b[^}]*\} = (?:await )?use\w+\(/)
  })

  it(`shows ${skeleton} while it loads`, () => {
    expect(source).toContain(`<${skeleton}`)
    expect(source).toMatch(/v-if="loading"/)
  })
})

describe('skeleton components', () => {
  const skeletons = PAGES.map(([, name]) => name)
    .concat(['ArticleCardSkeleton'])
    .map((name) => {
      const layer = /^(Article|Top1|AuthorBox)/.test(name)
        ? 'blog'
        : /^Event/.test(name) ? 'events' : /^Project/.test(name) ? 'projects'
          : /^CommunityPoi/.test(name) ? 'community-poi' : 'team'
      return [name, read(`layers/${layer}/components/${name}.vue`)] as const
    })

  it.each(skeletons)('%s is a busy region or built from skeleton blocks', (_name, source) => {
    expect(source).toMatch(/Skeleton(?:Region|Block|Image|Text)/)
  })

  it('never renders a skeleton in the server HTML of a loaded page', () => {
    // Pages switch on `loading`, which is false once the server awaited the
    // data; no page forces a skeleton with a literal.
    for (const [page] of PAGES) expect(read(page)).not.toMatch(/Skeleton[^>]*v-if="true"/)
  })
})
