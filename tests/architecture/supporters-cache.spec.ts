import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

describe('Lite supporters', () => {
  it('come from a cached server route that does not cache a failure', () => {
    const route = read('server/api/community/supporters.get.ts')
    expect(route).toMatch(/defineCachedFunction/)
    expect(route).toMatch(/swr:\s*false/)
    expect(route).toMatch(/supporters:\s*\[\]/)
    expect(route).toMatch(/loadLiteSupporters\(/)
  })

  it('reach the client only through the route, never by calling OpenCollective', () => {
    const composable = read('layers/opencollective/composables/useLiteSupporters.ts')
    expect(composable).toMatch(/\/api\/community\/supporters/)
    expect(composable).not.toMatch(/opencollective\.com/)
  })
})
