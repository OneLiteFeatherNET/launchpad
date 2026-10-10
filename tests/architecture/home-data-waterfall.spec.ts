import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * A `<LazyX hydrate-on-visible>` component is still rendered on the server,
 * but only after the page's own data calls have resolved. A data call made
 * inside it starts late and adds a full D1 round trip to an uncached render.
 * The page fetches, the section receives props.
 */
const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

describe('home page data fetching', () => {
  it('starts the FAQ query at page level', () => {
    expect(read('pages/index.vue')).toMatch(/useFaqContent\(\)/)
  })

  it('keeps the FAQ section free of its own data call', () => {
    const section = read('layers/home/components/FaqSection.vue')
    expect(section).not.toMatch(/useFaqContent|useAsyncData|useContentRepository/)
    expect(section).toMatch(/defineProps/)
  })

  it('keeps the FAQ section hydrate-on-visible', () => {
    expect(read('pages/index.vue')).toMatch(/<LazyFaqSection[^>]*hydrate-on-visible/)
  })
})
