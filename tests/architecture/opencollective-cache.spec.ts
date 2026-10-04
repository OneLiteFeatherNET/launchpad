import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

describe('OpenCollective stats', () => {
  it('come from a cached server route, not a direct fetch of the external site', () => {
    expect(read('server/api/opencollective.get.ts')).toMatch(/defineCachedFunction|defineCachedEventHandler/)
    const composable = read('layers/opencollective/composables/useOpenCollective.ts')
    expect(composable).not.toMatch(/\.json/)
    expect(composable).toMatch(/\/api\/opencollective/)
  })
})
