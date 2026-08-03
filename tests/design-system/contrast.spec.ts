import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * WCAG 1.4.11 (Non-text Contrast, AA) asks for 3:1 between an interactive
 * element and its background. Icon links carry no text, so the icon colour
 * itself is what has to clear the bar.
 *
 * The footer's social icons used `text-[var(--color-muted)] opacity-70`. Muted
 * on white is 4.83:1 and fine; at 70% opacity it composites to #979ca6, which
 * is 2.76:1 — below the threshold. Dark mode stayed at 4.20:1, so the defect
 * only ever appeared in one theme, which is why reviewing the token was not
 * enough to catch it.
 *
 * Alongside that, those links carried `cursor-not-allowed` while pointing at
 * real external URLs. The two together read as "disabled" to a sighted user
 * and as a working link to everyone else.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

/** Relative luminance per WCAG, from a #rrggbb string. */
function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0)
}

export function contrastRatio(a: string, b: string): number {
  const first = luminance(a)
  const second = luminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/** Composites `fg` over `bg` at `alpha`, the way opacity renders. */
function blend(fg: string, bg: string, alpha: number): string {
  const parse = (hex: string) => [1, 3, 5].map((o) => parseInt(hex.slice(o, o + 2), 16))
  const front = parse(fg)
  const back = parse(bg)
  const mixed = front.map((channel, index) =>
    Math.round(channel * alpha + (back[index] ?? 0) * (1 - alpha)))
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** Both sides of a `light-dark(a, b)` token declaration. */
function lightDarkToken(name: string): { light: string, dark: string } {
  const css = readFileSync(join(repoRoot, 'assets/css/tailwind.css'), 'utf8')
  const pattern = new RegExp(`--color-${name}:\\s*light-dark\\((#[0-9a-fA-F]{6}),\\s*(#[0-9a-fA-F]{6})\\)`)
  const match = pattern.exec(css)
  if (match?.[1] === undefined || match[2] === undefined) {
    throw new Error(`--color-${name} is not a light-dark() pair`)
  }
  return { light: match[1], dark: match[2] }
}

describe('contrast helper', () => {
  it('matches known WCAG values', () => {
    // Anchors the maths: black on white is exactly 21:1, white on white 1:1.
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('composites opacity the way the browser does', () => {
    // 70% of muted over white is what the footer actually rendered.
    expect(blend('#6b7280', '#ffffff', 0.7)).toBe('#979ca6')
  })
})

describe('muted foreground on the page background', () => {
  const muted = lightDarkToken('muted')
  const bg = lightDarkToken('bg')

  it('clears 3:1 in both themes at full opacity', () => {
    expect(contrastRatio(muted.light, bg.light)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(muted.dark, bg.dark)).toBeGreaterThanOrEqual(3)
  })

  it('drops below 3:1 in light mode at 70% opacity', () => {
    // Not a requirement — a recorded fact, so that anyone reaching for
    // `opacity-70` on a muted control sees why it is not available.
    expect(contrastRatio(blend(muted.light, bg.light, 0.7), bg.light)).toBeLessThan(3)
  })
})

describe('interactive elements', () => {
  const files = collectSourceFiles(SOURCE_DIRS, ['.vue'])

  it('finds files to check', () => {
    expect(files.length).toBeGreaterThan(30)
  })

  it('never dim a muted control below the contrast floor', () => {
    // `opacity-70` plus the muted token is the exact combination that renders
    // at 2.76:1 in light mode.
    const offenders: string[] = []
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      for (const line of text.split('\n')) {
        if (/--color-muted/.test(line) && /\bopacity-(?:[1-8]?\d)\b/.test(line)) {
          offenders.push(relativeToRepo(file))
          break
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('never mark a working link as not-allowed', () => {
    // `cursor-not-allowed` on an element with a real href tells sighted users
    // the control is dead while it still navigates for everyone else.
    const offenders: string[] = []
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      for (const line of text.split('\n')) {
        const isRealLink = /href="https?:\/\//.test(line) || /\bto="\/[^"]/.test(line)
        if (isRealLink && /cursor-not-allowed/.test(line)) {
          offenders.push(relativeToRepo(file))
          break
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
