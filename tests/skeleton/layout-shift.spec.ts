import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'
import { compileUtilities } from '../helpers/theme'

const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

/** The skeletons of detail pages. Each is a short stand-in for a page of any length. */
const DETAIL_SKELETONS = [
  'layers/events/components/EventDetailSkeleton.vue',
  'layers/projects/components/ProjectDetailSkeleton.vue',
  'layers/community-poi/components/CommunityPoiDetailSkeleton.vue'
]

/** The class the default layout puts on the wrapper that holds the footer. */
const FOOTER_WHILE_BUSY = '[&:has([aria-busy=true])>footer]:invisible'

describe('detail skeletons', () => {
  it.each(DETAIL_SKELETONS)('%s does not force a full-screen height', (file) => {
    expect(read(file)).not.toContain('min-h-screen')
  })
})

describe('default layout', () => {
  it('keeps the footer out of sight while a skeleton is on screen', () => {
    expect(read('layouts/default.vue')).toContain(FOOTER_WHILE_BUSY)
  })

  it('compiles that class to a rule that hides the footer only while a region is busy', async () => {
    const css = await compileUtilities([FOOTER_WHILE_BUSY])
    expect(css).toContain('aria-busy')
    expect(css).toContain('footer')
    expect(css).toMatch(/visibility:\s*hidden/)
  })
})
