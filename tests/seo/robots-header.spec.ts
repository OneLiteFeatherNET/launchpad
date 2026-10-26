import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * A robots meta tag written through useHead never reaches the X-Robots-Tag
 * header, which @nuxtjs/robots fills from route rules alone: a thin team
 * profile said `noindex` in the page and `index` in the header. useRobotsRule
 * writes both. Source check, because the composable needs the Nuxt app.
 */
const source = readFileSync(join(repoRoot, 'layers/content-core/composables/usePageSeo.ts'), 'utf8')

describe('usePageSeo robots directive', () => {
  it('goes through useRobotsRule', () => {
    expect(source).toMatch(/useRobotsRule\(/)
  })

  it('is no longer written as a meta tag by useHead', () => {
    expect(source).not.toMatch(/name:\s*'robots'/)
  })
})
