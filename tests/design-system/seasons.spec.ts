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
    const tokens = generateTokens(seeds.core, seeds.custom, seeds.neutralChroma)
    for (const [name, expected] of Object.entries(tokens)) {
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

/**
 * Hue range of `primary` and `secondary`, in both schemes, from each
 * season's spec (design D6). Every season the register knows MUST have a
 * row here, so a new season never goes unchecked.
 */
const COLOUR_EFFECT: Record<string, { primary: [number, number], secondary: [number, number] }> = {
  halloween: { primary: [260, 300], secondary: [20, 45] },
  winter: { primary: [190, 220], secondary: [35, 55] },
  'new-year': { primary: [240, 270], secondary: [35, 55] },
  spring: { primary: [100, 140], secondary: [320, 355] },
}

/** Smallest angle between two hues, 0–180°. */
function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

describe('seasonal colour effect', () => {
  it('has a colour-effect row for every registered season', () => {
    expect(Object.keys(COLOUR_EFFECT).sort()).toEqual(Object.keys(SEASONS).sort())
  })

  it.each(Object.entries(COLOUR_EFFECT))('%s stays in its hue range in both schemes', (id, ranges) => {
    const colors = schemeColors(seasonCss(id) ?? '')
    for (const scheme of ['light', 'dark'] as const) {
      const primary = hue(colors.get('primary')?.[scheme] ?? '#000000')
      const secondary = hue(colors.get('secondary')?.[scheme] ?? '#000000')
      expect(primary).toBeGreaterThanOrEqual(ranges.primary[0])
      expect(primary).toBeLessThanOrEqual(ranges.primary[1])
      expect(secondary).toBeGreaterThanOrEqual(ranges.secondary[0])
      expect(secondary).toBeLessThanOrEqual(ranges.secondary[1])
    }
  })

  it.each(Object.keys(COLOUR_EFFECT))('%s keeps the light scheme light', (id) => {
    // A page that turns dark in light mode reads as broken, not dressed up.
    const colors = schemeColors(seasonCss(id) ?? '')
    expect(luminance(colors.get('surface')?.light ?? '#000000')).toBeGreaterThan(0.8)
  })

  it('never lets a seasonal animation cycle in under 3 seconds', () => {
    // WCAG 2.3.1: a flash more than three times a second can trigger a
    // seizure. A 3s floor on the whole cycle keeps every animated decoration
    // — however it is tuned later — far under that limit.
    const css = themeCss()
    const durations = [...css.matchAll(/--animate-season-[a-z-]+:\s*[a-z-]+\s+([\d.]+)s\b/g)]
    expect(durations.length).toBeGreaterThan(0)
    for (const [, seconds] of durations) {
      expect(Number(seconds)).toBeGreaterThanOrEqual(3)
    }
  })

  it('only moves or fades in seasonal @keyframes, never triggers layout', () => {
    const css = themeCss()
    const names = [...css.matchAll(/--animate-season-([a-z-]+):/g)].map((m) => m[1])
    expect(names.length).toBeGreaterThan(0)
    const allowed = /^(transform|translate|rotate|scale|opacity)$/
    for (const name of names) {
      const block = new RegExp(`@keyframes\\s+season-${name}\\s*\\{([\\s\\S]*?)\\n    \\}`).exec(css)?.[1] ?? ''
      expect(block.length).toBeGreaterThan(0)
      const properties = [...block.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1] ?? '')
      const disallowed = properties.filter((property) => !allowed.test(property))
      expect(disallowed).toEqual([])
    }
  })

  it('opens a firework bucket over at least a second before its first peak', () => {
    // spec new-year-season, "Neujahrs-Deko mit sanftem Feuerwerk": the
    // fade-in alone — not the whole cycle — must take at least 1s, so a
    // bucket never seems to pop into view.
    const css = themeCss()
    const duration = Number(/--animate-season-burst:\s*[a-z-]+\s+([\d.]+)s/.exec(css)?.[1])
    expect(duration).toBeGreaterThan(0)
    const block = /@keyframes\s+season-burst\s*\{([\s\S]*?)\n {4}\}/.exec(css)?.[1] ?? ''
    const steps = [...block.matchAll(/(\d+(?:\.\d+)?)%\s*\{[^}]*opacity:\s*([\d.]+)/g)]
      .map((match) => ({ percent: Number(match[1]), opacity: Number(match[2]) }))
    const firstPeak = steps.find((step) => step.percent > 0 && step.opacity > 0)
    expect(firstPeak).toBeDefined()
    expect(((firstPeak?.percent ?? 0) / 100) * duration).toBeGreaterThanOrEqual(1)
  })

  it('keeps winter\'s primary and secondary at least 30° from error, in both schemes', () => {
    // Winter is deliberately red-free so interactive elements never read as
    // an error state (spec winter-season).
    const colors = schemeColors(seasonCss('winter') ?? '')
    for (const scheme of ['light', 'dark'] as const) {
      const error = hue(colors.get('error')?.[scheme] ?? '#000000')
      const primary = hue(colors.get('primary')?.[scheme] ?? '#000000')
      const secondary = hue(colors.get('secondary')?.[scheme] ?? '#000000')
      expect(hueDistance(primary, error)).toBeGreaterThanOrEqual(30)
      expect(hueDistance(secondary, error)).toBeGreaterThanOrEqual(30)
    }
  })
})
