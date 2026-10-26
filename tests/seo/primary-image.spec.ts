import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * Source checks, like event-noindex.spec.ts: `defineOgImage` does not exist in
 * the Nuxt test environment, so the composables cannot be mounted here. The
 * rendered result is checked by `scripts/seo-check.mjs` against a build.
 */
const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

describe('primaryImageOfPage', () => {
  it('is the social image in usePageSeo', () => {
    const webPage = /defineWebPage\(\{([\s\S]*?)\}\)/.exec(read('layers/content-core/composables/usePageSeo.ts'))?.[1]
    expect(webPage, 'defineWebPage({...}) call not found').toBeDefined()
    expect(webPage).toMatch(/primaryImageOfPage:\s*socialImage\.value\.url/)
  })

  it('is the preview social image in useArticleSeo', () => {
    const source = read('layers/blog/composables/useArticleSeo.ts')
    expect(source)
      .toMatch(/defineWebPage\(\{\s*primaryImageOfPage:\s*previewSocial\.value\.url\s*\}\)/)
  })
})
