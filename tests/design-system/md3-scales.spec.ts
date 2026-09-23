import { beforeAll, describe, expect, it } from 'vitest'
import { compileUtilities, ruleFor } from '../helpers/theme'

/**
 * The non-colour MD3 scales — type, shape, elevation, motion — and the three
 * utilities built on them. Compiled from the real tailwind.css, so a token
 * that Tailwind does not pick up (a wrong namespace, a typo in a sub-property)
 * fails here instead of rendering as if the class were absent.
 */

const TYPE_STYLES = ['display',
'headline',
'title',
'body',
'label']
  .flatMap((role) => ['large',
'medium',
'small'].map((size) => `text-${role}-${size}`))

const SHAPES = ['extra-small',
'small',
'medium',
'large',
'extra-large']
  .map((step) => `rounded-${step}`)

const ELEVATIONS = [0,
1,
2,
3,
4,
5].map((level) => `shadow-elevation-${level}`)

const EASINGS = ['standard', 'emphasized']
  .flatMap((curve) => ['',
'-accelerate',
'-decelerate'].map((suffix) => `ease-${curve}${suffix}`))

let css = ''

beforeAll(async () => {
  css = await compileUtilities([
    ...TYPE_STYLES,
    ...SHAPES,
    ...ELEVATIONS,
    ...EASINGS,
    'rounded-md',
    'rounded-lg',
    'state-layer',
    'focus-ring',
    'touch-target',
  ])
})

/** `--name: value;` as emitted into the theme layer. */
function themeValue(name: string): string | undefined {
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim()
}

describe('type scale', () => {
  it.each(TYPE_STYLES)('%s sets size, line height, weight and tracking', (style) => {
    const rule = ruleFor(css, style) ?? ''
    expect(rule).toMatch(/font-size:/)
    expect(rule).toMatch(/line-height:/)
    expect(rule).toMatch(/font-weight:/)
    expect(rule).toMatch(/letter-spacing:/)
  })

  it('uses the MD3 values for Title Medium', () => {
    expect(themeValue('text-title-medium')).toBe('1rem')
    expect(themeValue('text-title-medium--line-height')).toBe('1.5rem')
    expect(themeValue('text-title-medium--font-weight')).toBe('500')
    expect(themeValue('text-title-medium--letter-spacing')).toBe('0.009375rem')
  })
})

describe('shape scale', () => {
  it.each(SHAPES)('%s resolves', (shape) => {
    expect(ruleFor(css, shape)).toMatch(/border-radius:/)
  })

  it('makes a medium corner 12px', () => {
    expect(themeValue('radius-medium')).toBe('0.75rem')
  })

  it("leaves Tailwind's own steps untouched", () => {
    // Redefining them would silently resize every corner not yet migrated.
    expect(themeValue('radius-md')).toBe('0.375rem')
    expect(themeValue('radius-lg')).toBe('0.5rem')
  })
})

describe('elevation and motion', () => {
  it.each(ELEVATIONS)('%s resolves', (elevation) => {
    expect(ruleFor(css, elevation)).toMatch(/box-shadow:/)
  })

  it.each(EASINGS)('%s resolves', (easing) => {
    expect(ruleFor(css, easing)).toMatch(/transition-timing-function:/)
  })
})

describe('state layer', () => {
  const block = () => /\.state-layer\s*\{([\s\S]*?)\n {2}\}/.exec(css)?.[1] ?? ''

  it('is invisible at rest, 8% on hover and 10% on focus and press', () => {
    expect(block()).toMatch(/--state-layer-opacity:\s*0%/)
    expect(block()).toMatch(/&:hover\s*\{\s*--state-layer-opacity:\s*8%/)
    expect(block()).toMatch(/&:focus-visible\s*\{\s*--state-layer-opacity:\s*10%/)
    expect(block()).toMatch(/&:active\s*\{\s*--state-layer-opacity:\s*10%/)
  })

  it('shows nothing on a disabled element, whatever the pointer does', () => {
    // Declared after :hover with the same specificity, so it wins.
    const text = block()
    expect(text.indexOf('&:disabled')).toBeGreaterThan(text.indexOf('&:hover'))
    expect(text).toMatch(/&:disabled, &\[aria-disabled='true'\]\s*\{\s*--state-layer-opacity:\s*0%/)
  })

  it('never falls back to a solid currentColor fill', () => {
    // Tailwind's color-mix() polyfill turns an unguarded mix into
    // `currentColor`, which would paint the element in its text colour.
    expect(block()).not.toMatch(/linear-gradient\(\s*currentColor/)
  })
})

describe('focus ring and touch target', () => {
  it('draws a 3px secondary outline, 2px out, on keyboard focus only', () => {
    const rule = /\.focus-ring:focus-visible\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rule).toMatch(/outline:\s*3px solid var\(--color-secondary\)/)
    expect(rule).toMatch(/outline-offset:\s*2px/)
    expect(ruleFor(css, 'focus-ring')).toBeNull()
  })

  it('extends the hit area to at least 48px', () => {
    expect(css).toMatch(/width:\s*max\(100%,\s*48px\)/)
    expect(css).toMatch(/height:\s*max\(100%,\s*48px\)/)
  })
})
