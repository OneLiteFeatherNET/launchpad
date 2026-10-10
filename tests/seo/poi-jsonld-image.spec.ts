import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The POI page's CreativeWork image was the raw frontmatter path, resolved
 * against the site origin. Those images are served by img.onelitefeather.net
 * in production, so the JSON-LD pointed at a 404. It must use the same
 * absolute, transformed URL as og:image, which usePageSeo already computes.
 */
const poiSource = readFileSync(join(repoRoot, 'pages/community-poi/[...slug].vue'), 'utf8')
const seoSource = readFileSync(join(repoRoot, 'layers/content-core/composables/usePageSeo.ts'), 'utf8')

describe('community POI JSON-LD image', () => {
  it('uses the resolved social image, not the raw thumbnail path', () => {
    expect(poiSource).toMatch(/image: poi\.value\.thumbnail \? socialImage\.value\.url : undefined/)
  })

  it('takes that image from usePageSeo, the one og:image uses', () => {
    expect(poiSource).toMatch(/const \{ socialImage \} = usePageSeo\(/)
    expect(seoSource).toMatch(/return \{ socialImage \}/)
  })
})
