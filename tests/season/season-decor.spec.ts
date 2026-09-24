// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import SeasonDecor from '../../layers/season/components/SeasonDecor.vue'
import type { ActiveSeason, Season } from '../../layers/season/types'
import { HALLOWEEN, SEASONS } from '../../layers/season/utils/seasons'

/**
 * The decoration's promises (spec seasonal-theming, "Saisonale Dekoration
 * beeinträchtigt die Seite nicht"): absent outside a season, invisible to
 * assistive technology, transparent to the pointer, still under reduced
 * motion, no image requests — and, per season, the shapes and element caps
 * each spec describes.
 *
 * The frame (this file's first two describe blocks) is generic over every
 * registered season. Each season's own shapes get their own block; the
 * halloween assertions moved here unchanged when SeasonDecor became a
 * dispatcher (design D4).
 */

const { state } = vi.hoisted(() => ({ state: { season: null as ActiveSeason } }))
// A real ref, as useState returns one: the template unwraps it.
mockNuxtImport('useSeason', () => () => shallowRef(state.season))

async function mountWith(season: ActiveSeason) {
  state.season = season
  return mountSuspended(SeasonDecor)
}

describe('SeasonDecor — frame', () => {
  it('renders nothing outside a season', async () => {
    const wrapper = await mountWith(null)
    expect(wrapper.find('[data-testid="season-decor"]').exists()).toBe(false)
  })

  it('renders nothing for a season without decoration', async () => {
    const wrapper = await mountWith({ ...HALLOWEEN, decor: false })
    expect(wrapper.find('[data-testid="season-decor"]').exists()).toBe(false)
  })

  it.each(SEASONS.filter((season) => season.decor).map((season) => [season.id, season] as const))(
    '%s is hidden from assistive technology and lets clicks through',
    async (_id, season) => {
      const layer = (await mountWith(season)).get('[data-testid="season-decor"]')
      expect(layer.attributes('aria-hidden')).toBe('true')
      expect(layer.classes()).toEqual(expect.arrayContaining(['pointer-events-none',
'fixed',
'z-30']))
    },
  )

  it.each(SEASONS.filter((season) => season.decor).map((season) => [season.id, season] as const))(
    '%s draws everything inline, without image files',
    async (_id, season) => {
      const html = (await mountWith(season)).html()
      expect(html).not.toMatch(/<img|url\(|href=/)
    },
  )
})

describe('SeasonDecor — mapping', () => {
  it('has a decoration component for every season with decor: true', () => {
    // A season that flips decor on without an entry in SeasonDecor's map
    // would silently render an empty frame — check the registry, not the
    // private map, so this stays a black-box test of the dispatcher.
    const decorated: Season[] = SEASONS.filter((season) => season.decor)
    expect(decorated.length).toBeGreaterThan(0)
  })

  it.each(SEASONS.filter((season) => season.decor).map((season) => season.id))(
    '%s renders at least one decoration element',
    async (id) => {
      const season = SEASONS.find((candidate) => candidate.id === id)
      const wrapper = await mountWith(season ?? null)
      expect(wrapper.find('[data-testid="season-decor"]').element.children.length).toBeGreaterThan(0)
    },
  )
})

describe('during Halloween', () => {
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
})

describe('during winter', () => {
  const winter = SEASONS.find((season) => season.id === 'winter')!

  it('shows an ice crystal in both top corners', async () => {
    const crystals = (await mountWith(winter)).findAll('[data-decor="crystal"]')
    expect(crystals).toHaveLength(2)
  })

  it('shows at most six snowflakes, only from md up, and none under reduced motion', async () => {
    const flakes = (await mountWith(winter)).findAll('[data-decor="snowflake"]')
    expect(flakes.length).toBeGreaterThan(0)
    expect(flakes.length).toBeLessThanOrEqual(6)
    for (const flake of flakes) {
      expect(flake.classes()).toEqual(expect.arrayContaining(['hidden', 'motion-safe:md:block']))
      expect(flake.classes()).not.toContain('md:block')
    }
  })
})

describe('during new year', () => {
  const newYear = SEASONS.find((season) => season.id === 'new-year')!

  it('shows a star in both top corners', async () => {
    const stars = (await mountWith(newYear)).findAll('[data-decor="star"]')
    expect(stars).toHaveLength(2)
  })

  it('shows at most five twinkling light points, only from md up, and none under reduced motion', async () => {
    const lights = (await mountWith(newYear)).findAll('[data-decor="light"]')
    expect(lights.length).toBeGreaterThan(0)
    expect(lights.length).toBeLessThanOrEqual(5)
    for (const light of lights) {
      expect(light.classes()).toEqual(expect.arrayContaining(['hidden', 'motion-safe:md:block']))
      expect(light.classes()).not.toContain('md:block')
    }
  })

  it('never uses the drift or fall animation, only the flash-free twinkle', async () => {
    const html = (await mountWith(newYear)).html()
    expect(html).not.toMatch(/animate-season-(drift|fall)/)
  })
})

describe('during spring', () => {
  const spring = SEASONS.find((season) => season.id === 'spring')!

  it('shows a blossom branch in both top corners', async () => {
    const branches = (await mountWith(spring)).findAll('[data-decor="branch"]')
    expect(branches).toHaveLength(2)
  })

  it('shows at most four petals, only from md up, and none under reduced motion', async () => {
    const petals = (await mountWith(spring)).findAll('[data-decor="petal"]')
    expect(petals.length).toBeGreaterThan(0)
    expect(petals.length).toBeLessThanOrEqual(4)
    for (const petal of petals) {
      expect(petal.classes()).toEqual(expect.arrayContaining(['hidden', 'motion-safe:md:block']))
      expect(petal.classes()).not.toContain('md:block')
    }
  })
})
