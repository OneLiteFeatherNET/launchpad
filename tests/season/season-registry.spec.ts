import { describe, expect, it } from 'vitest'
import { SEASONS } from '../../layers/season/utils/seasons'
import { SEASONS as GENERATED } from '../../scripts/md3-tokens.mjs'
import { schemeColors, seasonCss, seasonIds } from '../helpers/theme'

/**
 * A season exists in two places: the registry here (window, assets) and the
 * generator's seeds (colours, written to seasons.css). Neither can check the
 * other at build time — an id in only one of them is a season that switches
 * on without colours, or colours nothing ever switches on.
 */
describe('season registry', () => {
  it('has a colour block for every season, and a season for every block', () => {
    const registered = SEASONS.map((season) => season.id).sort()
    expect(seasonIds().sort()).toEqual(registered)
    expect(Object.keys(GENERATED).sort()).toEqual(registered)
  })

  it.each(SEASONS.map((season) => [season.id, season] as const))(
    '%s paints the browser chrome in its surface colour',
    (id, season) => {
      const surface = schemeColors(seasonCss(id) ?? '').get('surface')
      expect(season.themeColor).toEqual({ light: surface?.light, dark: surface?.dark })
    },
  )
})
