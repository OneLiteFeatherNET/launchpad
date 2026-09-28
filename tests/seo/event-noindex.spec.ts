import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `usePageSeo({ noindex })` on the event detail page must track
 * `event.unlisted`, not the phase (design.md D4): an unlisted event stays out
 * of the index in every phase, a public event never gets `noindex`.
 *
 * A full render of this page is out of reach in this suite: mounting it
 * under `@vitest-environment nuxt` hits `defineOgImage` being undefined —
 * nuxt-og-image's build macro is not transformed under Vitest's Nuxt
 * environment, unrelated to this change. This check reads the source instead,
 * the same way tests/seo/page-titles.spec.ts verifies the `usePageSeo` call
 * shape without rendering.
 */
const PAGE_FILE = 'pages/events/[...slug].vue'

function pageSource(): string {
  return readFileSync(join(repoRoot, PAGE_FILE), 'utf8')
}

describe('event detail page noindex wiring', () => {
  it('finds the usePageSeo call it is checking', () => {
    // Without this the pattern below could pass by matching nothing.
    expect(pageSource()).toMatch(/usePageSeo\(\{/)
  })

  it('ties noindex to event.unlisted, not to the phase', () => {
    const call = /usePageSeo\(\{([\s\S]*?)\n\}\)/.exec(pageSource())?.[1]
    expect(call, 'usePageSeo({...}) call not found').toBeDefined()
    expect(call).toMatch(/noindex:\s*event\.value\?\.unlisted === true/)
  })
})
