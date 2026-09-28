import { describe, expect, it } from 'vitest'
import type { Season } from '../../layers/season/types'
import { overlappingSeasons, SEASONS } from '../../layers/season/utils/seasons'
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

/**
 * `overlappingSeasons` (design D2) is what keeps the registry honest: at
 * most one season may claim a given calendar day. Adjacent windows — one
 * ending the day before another starts — are fine; that is how winter hands
 * off to new-year on 26/27 December.
 */
const season = (id: string, start: Season['start'], end: Season['end']): Season => ({
  id,
  start,
  end,
  decor: false,
  themeColor: { light: '#ffffff', dark: '#000000' },
  logo: 'images/logo.svg',
  favicon: '/favicon.svg',
})

describe('overlappingSeasons', () => {
  it('is empty for the real registry', () => {
    expect(overlappingSeasons(SEASONS)).toEqual([])
  })

  it('allows adjacent windows', () => {
    const winter = season('winter', { month: 12, day: 1 }, { month: 12, day: 26 })
    const newYear = season('new-year', { month: 12, day: 27 }, { month: 1, day: 6 })
    expect(overlappingSeasons([winter, newYear])).toEqual([])
  })

  it('reports both ids and the first shared day of overlapping windows', () => {
    const a = season('a', { month: 12, day: 1 }, { month: 12, day: 27 })
    const b = season('b', { month: 12, day: 27 }, { month: 1, day: 6 })
    expect(overlappingSeasons([a, b])).toEqual([
      { first: 'a', second: 'b', day: { month: 12, day: 27 } },
    ])
  })

  it('catches two windows that both wrap the year end', () => {
    const a = season('a', { month: 12, day: 15 }, { month: 1, day: 10 })
    const b = season('b', { month: 12, day: 20 }, { month: 1, day: 3 })
    // The brute force walks a calendar year from 1 January, so the first
    // shared day it finds is the earliest one in that order — 1 January,
    // even though the two windows already overlap from 20 December.
    expect(overlappingSeasons([a, b])).toEqual([
      { first: 'a', second: 'b', day: { month: 1, day: 1 } },
    ])
  })
})
