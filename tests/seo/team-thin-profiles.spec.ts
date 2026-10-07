import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

describe('thin team profiles stay out of the index', () => {
  it('the detail page sets noindex from isThinTeamProfile', () => {
    const call = /usePageSeo\(\{([\s\S]*?)\n\}\)/.exec(read('pages/team/[slug].vue'))?.[1]
    expect(call, 'usePageSeo({...}) call not found').toBeDefined()
    expect(call).toMatch(/noindex:\s*member\.value\s*\?\s*isThinTeamProfile\(member\.value\)/)
  })

  it('the sitemap source skips thin profiles via the shared predicate', () => {
    expect(read('server/api/__sitemap__/team.ts')).toMatch(/isThinTeamProfile\(m\)/)
  })
})
