// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import NavigationBar from '../../layers/navigation/components/NavigationBar.vue'
import { SEASONS } from '../../layers/season/utils/seasons'

/**
 * The layout hands a season's logo to the navigation (design D5) — the
 * navigation layer never learns that seasons exist. The mark changes; what a
 * screen reader hears for it does not. Runs over every registered season, so
 * a season whose logo path is missing or misspelled fails here, named.
 */
describe('NavigationBar logo', () => {
  async function logo(props: Record<string, unknown> = {}) {
    const wrapper = await mountSuspended(NavigationBar, { props })
    return wrapper.find('header img, nav img')
  }

  it('shows the year-round mark by default', async () => {
    const img = await logo()
    expect(img.attributes('src')).toContain('images/logo.svg')
    expect(img.attributes('alt')).toBeTruthy()
  })

  it.each(SEASONS.map((season) => [season.id, season.logo] as const))(
    '%s shows its own mark, under the same name',
    async (_id, logoSrc) => {
      const plain = await logo()
      const img = await logo({ logoSrc })
      expect(img.attributes('src')).toContain(logoSrc)
      expect(img.attributes('alt')).toBe(plain.attributes('alt'))
    },
  )
})
