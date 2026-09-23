// Material Design 3 colour roles, generated from the brand's core colours.
//
// The HCT maths behind MD3 schemes cannot be reproduced by hand, so the
// values are computed here once and written, as static `light-dark()` pairs,
// into the `@theme` block of assets/css/tailwind.css. Nothing from
// @material/material-color-utilities reaches a bundle: only this script and
// tests/design-system/md3-tokens.spec.ts import it.
//
//   node scripts/md3-tokens.mjs          rewrite the generated block
//   node scripts/md3-tokens.mjs --check  exit 1 if the block is out of date
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  customColor,
  DynamicScheme,
  Hct,
  hexFromArgb,
  SchemeFidelity,
  TonalPalette,
  argbFromHex,
} from '@material/material-color-utilities'

export const CORE_COLORS = {
  primary: '#2A388F',
  secondary: '#27A9E1',
  tertiary: '#EC008B',
}

/** Brand colours kept as they are: not harmonised towards primary. */
export const CUSTOM_COLORS = {
  'brand-orange': '#F7931D',
  'brand-purple': '#91268F',
}

/** Token name → DynamicScheme getter, in the order they are written. */
export const SCHEME_ROLES = {
  'primary': 'primary',
  'on-primary': 'onPrimary',
  'primary-container': 'primaryContainer',
  'on-primary-container': 'onPrimaryContainer',
  'secondary': 'secondary',
  'on-secondary': 'onSecondary',
  'secondary-container': 'secondaryContainer',
  'on-secondary-container': 'onSecondaryContainer',
  'tertiary': 'tertiary',
  'on-tertiary': 'onTertiary',
  'tertiary-container': 'tertiaryContainer',
  'on-tertiary-container': 'onTertiaryContainer',
  'error': 'error',
  'on-error': 'onError',
  'error-container': 'errorContainer',
  'on-error-container': 'onErrorContainer',
  'surface': 'surface',
  'on-surface': 'onSurface',
  'on-surface-variant': 'onSurfaceVariant',
  'surface-dim': 'surfaceDim',
  'surface-bright': 'surfaceBright',
  'surface-container-lowest': 'surfaceContainerLowest',
  'surface-container-low': 'surfaceContainerLow',
  'surface-container': 'surfaceContainer',
  'surface-container-high': 'surfaceContainerHigh',
  'surface-container-highest': 'surfaceContainerHighest',
  'outline': 'outline',
  'outline-variant': 'outlineVariant',
  'inverse-surface': 'inverseSurface',
  'inverse-on-surface': 'inverseOnSurface',
  'inverse-primary': 'inversePrimary',
  'scrim': 'scrim',
  'shadow': 'shadow',
}

export const START_MARKER = '/* md3:generated:start */'
export const END_MARKER = '/* md3:generated:end */'

const THEME_FILE = fileURLToPath(new URL('../assets/css/tailwind.css', import.meta.url))

function scheme(isDark) {
  const source = Hct.fromInt(argbFromHex(CORE_COLORS.primary))
  // Fidelity keeps primary-container close to the seed, so the brand blue
  // survives instead of being desaturated as Tonal Spot would. Its neutral
  // palettes are reused; the three accent palettes each come from their own
  // core colour, as Material Theme Builder does with custom core colours.
  const base = new SchemeFidelity(source, isDark, 0)
  return new DynamicScheme({
    sourceColorArgb: source.toInt(),
    variant: base.variant,
    contrastLevel: 0,
    isDark,
    primaryPalette: TonalPalette.fromInt(argbFromHex(CORE_COLORS.primary)),
    secondaryPalette: TonalPalette.fromInt(argbFromHex(CORE_COLORS.secondary)),
    tertiaryPalette: TonalPalette.fromInt(argbFromHex(CORE_COLORS.tertiary)),
    neutralPalette: base.neutralPalette,
    neutralVariantPalette: base.neutralVariantPalette,
  })
}

/** Every generated token as `{ light, dark }` lowercase hex. */
export function generateTokens() {
  const light = scheme(false)
  const dark = scheme(true)
  const tokens = {}
  for (const [name, getter] of Object.entries(SCHEME_ROLES)) {
    tokens[name] = { light: hexFromArgb(light[getter]), dark: hexFromArgb(dark[getter]) }
  }
  const sourceArgb = argbFromHex(CORE_COLORS.primary)
  for (const [name, hex] of Object.entries(CUSTOM_COLORS)) {
    const group = customColor(sourceArgb, { name, value: argbFromHex(hex), blend: false })
    const roles = {
      [name]: 'color',
      [`on-${name}`]: 'onColor',
      [`${name}-container`]: 'colorContainer',
      [`on-${name}-container`]: 'onColorContainer',
    }
    for (const [token, key] of Object.entries(roles)) {
      tokens[token] = { light: hexFromArgb(group.light[key]), dark: hexFromArgb(group.dark[key]) }
    }
  }
  return tokens
}

/** The block between the markers, markers included, indented for @theme. */
export function renderBlock(tokens = generateTokens()) {
  const lines = [
    `    ${START_MARKER}`, '    /* Written by scripts/md3-tokens.mjs — do not edit by hand. */',
  ]
  for (const [name, { light, dark }] of Object.entries(tokens)) {
    lines.push(`    --color-${name}: light-dark(${light}, ${dark});`)
  }
  lines.push(`    ${END_MARKER}`)
  return lines.join('\n')
}

/** The generated block as it currently stands in tailwind.css, or null. */
export function currentBlock(css = readFileSync(THEME_FILE, 'utf8')) {
  const start = css.indexOf(START_MARKER)
  const end = css.indexOf(END_MARKER)
  if (start === -1 || end === -1) return null
  const lineStart = css.lastIndexOf('\n', start) + 1
  return css.slice(lineStart, end + END_MARKER.length)
}

function main() {
  const css = readFileSync(THEME_FILE, 'utf8')
  const existing = currentBlock(css)
  const next = renderBlock()
  if (process.argv.includes('--check')) {
    if (existing !== next) {
      console.error('MD3 colour tokens in assets/css/tailwind.css are out of date.')
      console.error('Run: node scripts/md3-tokens.mjs')
      process.exit(1)
    }
    return
  }
  if (existing === null) {
    console.error(`Markers ${START_MARKER} / ${END_MARKER} not found in ${THEME_FILE}.`)
    process.exit(1)
  }
  writeFileSync(THEME_FILE, css.replace(existing, next))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
