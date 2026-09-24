// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import SeasonDecor from '../../layers/season/components/SeasonDecor.vue'
import type { ActiveSeason } from '../../layers/season/types'
import { HALLOWEEN } from '../../layers/season/utils/seasons'

/**
 * The decoration's promises (spec seasonal-theming, "Saisonale Dekoration
 * beeinträchtigt die Seite nicht", and halloween-season, "Halloween-Deko"):
 * absent outside a season, invisible to assistive technology, transparent to
 * the pointer, still under reduced motion, no bats on narrow screens and no
 * more than three on wide ones, no image requests.
 */

const { state } = vi.hoisted(() => ({ state: { season: null as ActiveSeason } }))
// A real ref, as useState returns one: the template unwraps it.
mockNuxtImport('useSeason', () => () => shallowRef(state.season))

async function mountWith(season: ActiveSeason) {
  state.season = season
  return mountSuspended(SeasonDecor)
}

describe('SeasonDecor', () => {
  it('renders nothing outside a season', async () => {
    const wrapper = await mountWith(null)
    expect(wrapper.find('[data-testid="season-decor"]').exists()).toBe(false)
  })

  it('renders nothing for a season without decoration', async () => {
    const wrapper = await mountWith({ ...HALLOWEEN, decor: false })
    expect(wrapper.find('[data-testid="season-decor"]').exists()).toBe(false)
  })

  describe('during Halloween', () => {
    it('is hidden from assistive technology and lets clicks through', async () => {
      const layer = (await mountWith(HALLOWEEN)).get('[data-testid="season-decor"]')
      expect(layer.attributes('aria-hidden')).toBe('true')
      expect(layer.classes()).toEqual(expect.arrayContaining(['pointer-events-none',
'fixed',
'z-30']))
    })

    it('hangs a web in both top corners', async () => {
      const webs = (await mountWith(HALLOWEEN)).findAll('[data-decor="web"]')
      expect(webs).toHaveLength(2)
    })

    it('shows at most three bats, only from md up, and none under reduced motion', async () => {
      const bats = (await mountWith(HALLOWEEN)).findAll('[data-decor="bat"]')
      expect(bats.length).toBeGreaterThan(0)
      expect(bats.length).toBeLessThanOrEqual(3)
      for (const bat of bats) {
        // Opt-in: `motion-reduce:hidden` next to `md:block` loses to it in
        // Tailwind v4's variant order, so the bat would keep flying.
        expect(bat.classes()).toEqual(expect.arrayContaining(['hidden', 'motion-safe:md:block']))
        expect(bat.classes()).not.toContain('md:block')
      }
    })

    it('draws everything inline, without image files', async () => {
      const html = (await mountWith(HALLOWEEN)).html()
      expect(html).not.toMatch(/<img|url\(|href=/)
    })
  })
})
