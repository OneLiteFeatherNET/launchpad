// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import NavigationBar from '../../layers/navigation/components/NavigationBar.vue'

/**
 * The layout hands a season's logo to the navigation (design D5) — the
 * navigation layer never learns that seasons exist. The mark changes; what a
 * screen reader hears for it does not.
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

  it('shows the mark it is given, under the same name', async () => {
    const plain = await logo()
    const img = await logo({ logoSrc: 'images/seasons/halloween/logo.svg' })
    expect(img.attributes('src')).toContain('images/seasons/halloween/logo.svg')
    expect(img.attributes('alt')).toBe(plain.attributes('alt'))
  })
})
