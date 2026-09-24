import { describe, expect, it } from 'vitest'
import {
  BRIDGE_END,
  BRIDGE_START,
  generateTokens,
  renderSeasons,
  SEASONS,
} from '../../scripts/md3-tokens.mjs'
import { luminance, schemeColors, seasonCss, seasonIds, seasonsCss, themeCss } from '../helpers/theme'

/**
 * A season repaints the site by redeclaring the colour roles under
 * `html[data-season="…"]` (assets/css/seasons.css). It only works if it
 * redeclares *all* of them: one left out keeps its base value while everything
 * around it changes, which is how a blue focus ring ends up on a pumpkin
 * button. The generator guarantees completeness; these tests keep the
 * checked-in file honest about it.
 */

/** Season id and token name of every generated value that differs from the file. */
function staleSeasonTokens(css: string): string[] {
  const stale: string[] = []
  for (const [id, seeds] of Object.entries(SEASONS)) {
    const checkedIn = schemeColors(seasonCss(id, css) ?? '')
    for (const [name, expected] of Object.entries(generateTokens(seeds.core, seeds.custom))) {
      const actual = checkedIn.get(name)
      if (actual?.light !== expected.light || actual?.dark !== expected.dark) stale.push(`${id}: ${name}`)
    }
  }
  return stale
}

/** The decoration section of one season block, one declared name per entry. */
function bridgeNames(id: string): string[] {
  const block = seasonCss(id) ?? ''
  const start = block.indexOf(BRIDGE_START)
  const end = block.indexOf(BRIDGE_END)
  if (start === -1 || end === -1) return []
  return [...block.slice(start, end).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? '')
}

/**
 * Colour values outside the MD3 roles: the raw brand colours in `:root` (the
 * connect box's glow) and the gradients. They are fixed hex, so a season
 * that does not answer them leaves them glowing in the base brand's colours.
 */
function decorationColours(): string[] {
  const css = themeCss()
  const names = [...css.matchAll(/(--(?:brand|gradient)-[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? '')
  return [...new Set(names)].sort()
}

describe('seasonal colour roles', () => {
  it('are up to date with the generator', () => {
    expect(seasonsCss()).toBe(renderSeasons())
  })

  it('name the season and role that was edited by hand', () => {
    const tampered = seasonsCss().replace(
      /--color-secondary: light-dark\(#[0-9a-f]{6}/,
      '--color-secondary: light-dark(#123456',
    )
    expect(staleSeasonTokens(tampered)).toEqual(['halloween: secondary'])
    expect(staleSeasonTokens(seasonsCss())).toEqual([])
  })

  it('has one block for every season the generator knows', () => {
    expect(seasonIds()).toEqual(Object.keys(SEASONS))
  })

  it.each(Object.keys(SEASONS))('%s redeclares every role of the base scheme', (id) => {
    const base = [...schemeColors(themeCss()).keys()].filter((name) => name in generateTokens())
    const season = schemeColors(seasonCss(id) ?? '')
    expect(base.filter((name) => !season.has(name))).toEqual([])
  })

  it.each(Object.keys(SEASONS))('%s answers every decoration colour exactly once', (id) => {
    const bridged = bridgeNames(id)
    expect(decorationColours().length).toBeGreaterThan(0)
    expect([...bridged].sort()).toEqual(decorationColours())
    expect(bridged.length).toBe(new Set(bridged).size)
  })
})

/** HSL hue of `#rrggbb` in degrees, 0–360. */
function hue(hex: string): number {
  const [r = 0,
g = 0,
b = 0] = [1,
3,
5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  if (delta === 0) return 0
  let raw = (r - g) / delta + 4
  if (max === r) raw = ((g - b) / delta) % 6
  else if (max === g) raw = (b - r) / delta + 2
  return (raw * 60 + 360) % 360
}

describe('halloween colour effect', () => {
  const colors = schemeColors(seasonCss('halloween') ?? '')

  it.each(['light', 'dark'] as const)('reads violet and pumpkin in the %s scheme', (scheme) => {
    const primary = hue(colors.get('primary')?.[scheme] ?? '#000000')
    const secondary = hue(colors.get('secondary')?.[scheme] ?? '#000000')
    expect(primary).toBeGreaterThanOrEqual(260)
    expect(primary).toBeLessThanOrEqual(300)
    expect(secondary).toBeGreaterThanOrEqual(20)
    expect(secondary).toBeLessThanOrEqual(45)
  })

  it('keeps the light scheme light', () => {
    // A page that turns dark in light mode reads as broken, not dressed up.
    expect(luminance(colors.get('surface')?.light ?? '#000000')).toBeGreaterThan(0.8)
  })
})
