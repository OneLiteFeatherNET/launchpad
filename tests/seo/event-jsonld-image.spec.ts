import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The event page's Event.image resolved the raw frontmatter path against the
 * site origin. Those images are served by img.onelitefeather.net in
 * production, so the JSON-LD pointed at a 404. It must use the absolute,
 * transformed URL that og:image uses, which usePageSeo already computes.
 */
const PAGE_FILE = 'pages/events/[...slug].vue'
const source = readFileSync(join(repoRoot, PAGE_FILE), 'utf8')

describe('event detail JSON-LD image', () => {
  it('uses the resolved social image, not the raw thumbnail path', () => {
    expect(source).toMatch(/image: event\.value\.thumbnail \? socialImage\.value\.url : undefined/)
  })

  it('takes that image from usePageSeo, the one og:image uses', () => {
    expect(source).toMatch(/const \{ socialImage \} = usePageSeo\(\{/)
  })

  it('no longer resolves the raw thumbnail path against the site origin', () => {
    expect(source).not.toMatch(/new URL\(event\.value\.thumbnail, site\.url\)/)
  })
})
