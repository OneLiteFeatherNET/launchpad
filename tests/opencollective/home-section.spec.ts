import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

describe('home page funding section', () => {
  it('renders only while the stats are available', () => {
    const page = readFileSync(join(repoRoot, 'pages/index.vue'), 'utf8')
    expect(page).toMatch(/<LazyOpenCollectiveStats\s+v-if="collective\.available"/)
  })
})
