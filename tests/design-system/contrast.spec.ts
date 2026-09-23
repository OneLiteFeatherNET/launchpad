import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'
import { schemeColors, themeCss, type SchemeColor } from '../helpers/theme'

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
  'layers',
]

/** Byte offsets of r, g and b inside a #rrggbb string. */
const CHANNEL_OFFSETS = [
  1,
  3,
  5,
]

/** Relative luminance per WCAG, from a #rrggbb string. */
function luminance(hex: string): number {
  const channels = CHANNEL_OFFSETS
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
  const parse = (hex: string) => CHANNEL_OFFSETS.map((o) => parseInt(hex.slice(o, o + 2), 16))
  const front = parse(fg)
  const back = parse(bg)
  const mixed = front.map((channel, index) => {
    const behind = back[index] ?? 0
    return Math.round(channel * alpha + behind * (1 - alpha))
  })
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`
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

/**
 * MD3 promises contrast between every role and its on-role; the algorithm
 * picks tones for exactly that. Checked here against the values actually
 * checked in, in both schemes, because the generator's promise is only as
 * good as the file it wrote.
 */
/** A foreground role, the background it sits on, and the ratio it needs. */
interface Pair { fg: string, bg: string, min: number }

const ACCENT_ROLES = [
  'primary',
  'secondary',
  'tertiary',
  'error',
  'brand-orange',
  'brand-purple',
]

const SURFACES = [
  'surface',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
]

/** Every pair the spec names. */
const REQUIRED_CONTRAST: Pair[] = [
  ...ACCENT_ROLES.flatMap((role) => {
    const container = `${role}-container`
    return [{ fg: `on-${role}`, bg: role, min: 4.5 }, { fg: `on-${container}`, bg: container, min: 4.5 }]
  }),
  { fg: 'inverse-on-surface', bg: 'inverse-surface', min: 4.5 },
  // M3LinearProgress: the primary indicator against its track (1.4.11).
  { fg: 'primary', bg: 'surface-container-highest', min: 3 },
  ...SURFACES.flatMap((surface) => [
    { fg: 'on-surface', bg: surface, min: 4.5 },
    { fg: 'on-surface-variant', bg: surface, min: 4.5 },
    { fg: 'outline', bg: surface, min: 3 },
    // The focus ring is drawn in `secondary`; 1.4.11 asks 3:1 of it.
    { fg: 'secondary', bg: surface, min: 3 },
  ]),
]

/** Every pair below its minimum, as `fg on bg (scheme): ratio < min`. */
function contrastFailures(colors: Map<string, SchemeColor>): string[] {
  const failures: string[] = []
  for (const { fg, bg, min: minimum } of REQUIRED_CONTRAST) {
    const front = colors.get(fg)
    const back = colors.get(bg)
    if (!front || !back) {
      failures.push(`${fg} on ${bg}: token missing`)
      continue
    }
    for (const scheme of ['light', 'dark'] as const) {
      const ratio = contrastRatio(front[scheme], back[scheme])
      if (ratio < minimum) {
        failures.push(`${fg} on ${bg} (${scheme}): ${ratio.toFixed(2)} < ${minimum}`)
      }
    }
  }
  return failures
}

describe('MD3 colour roles', () => {
  it('meet their contrast minimum in both schemes', () => {
    expect(contrastFailures(schemeColors())).toEqual([])
  })

  it('name the pair, scheme and ratio of a failing value', () => {
    const tampered = themeCss().replace(
      /--color-on-primary: light-dark\(#[0-9a-f]{6}/,
      '--color-on-primary: light-dark(#1a2a80',
    )
    const failures = contrastFailures(schemeColors(tampered))
    expect(failures).toHaveLength(1)
    expect(failures[0]).toMatch(/^on-primary on primary \(light\): \d\.\d{2} < 4\.5$/)
  })
})

describe('interactive elements', () => {
  const files = collectSourceFiles(SOURCE_DIRS, ['.vue'])

  it('finds files to check', () => {
    expect(files.length).toBeGreaterThan(30)
  })

  it('never dim an active muted control below the contrast floor', () => {
    // `opacity-70` on the old muted token rendered at 2.76:1 in light mode.
    // The roles clear their contrast at full opacity only, so dimming
    // secondary text with opacity stays off the table.
    //
    // 1.4.11 exempts inactive components explicitly, and the footer has two
    // genuine ones — `aria-disabled="true"` with `@click.prevent` on a
    // "coming soon" placeholder. Dimming those is the correct way to show
    // they do nothing, so they are skipped rather than "fixed".
    const offenders: string[] = []
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      for (const line of text.split('\n')) {
        if (/aria-disabled="true"/.test(line)) continue
        if (/on-surface-variant/.test(line) && /\bopacity-(?:[1-8]?\d)\b/.test(line)) {
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
