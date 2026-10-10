// Material Design 3 colour roles, generated from the brand's core colours.
//
// The HCT maths behind MD3 schemes cannot be reproduced by hand, so the
// values are computed here once and written, as static `light-dark()` pairs,
// into the `@theme` block of assets/css/tailwind.css. Nothing from
// @material/material-color-utilities reaches a bundle: only this script and
// tests/design-system/md3-tokens.spec.ts import it.
//
// Seasons (see SEASONS) come out of the same maths from their own seeds and
// are written to assets/css/seasons.css, one `html[data-season="…"]` block
// each. They live in a file of their own because every token test parses
// tailwind.css as a whole, where a later declaration wins: a season written
// there would be read back as the base scheme.
//
//   node scripts/md3-tokens.mjs          rewrite the generated block and seasons.css
//   node scripts/md3-tokens.mjs --check  exit 1 if either is out of date
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

/**
 * Seasonal schemes, keyed by the id `data-season` carries on <html>. Each
 * replaces the three core colours and both custom colours; everything else —
 * variant, contrast level, neutral palettes from primary — is the base recipe.
 * The ids must match the registry in layers/season/utils/seasons.ts; a test
 * holds the two in step.
 */
export const SEASONS = {
  halloween: {
    core: {
      primary: '#5B2A86', // witch violet: structure and the surfaces' undertone
      secondary: '#FF7518', // pumpkin: everything interactive, focus ring included
      tertiary: '#7CB518', // poison green: the rare accent
    },
    custom: {
      'brand-orange': '#FF7518',
      'brand-purple': '#6A0DAD',
    },
  },
  winter: {
    core: {
      primary: '#3A7CA5', // frost blue: structure and the surfaces' undertone
      secondary: '#C9A227', // candle gold: everything interactive, focus ring included
      tertiary: '#9B8FC7', // frost lilac: the rare accent
    },
    custom: {
      'brand-orange': '#C9A227',
      'brand-purple': '#5B6FA8',
    },
  },
  'new-year': {
    core: {
      primary: '#2A1B5C', // midnight violet: structure and the surfaces' undertone
      // First calming pass (chroma ~24) overshot: the rendered `secondary`
      // role — used broadly for buttons, chips, pills — turned muddy khaki
      // rather than gold, because a dark tone at low chroma reads as
      // desaturated brown, not "dark gold". This keeps roughly the original
      // chroma (~43, close to winter's own gold at 48.6, which nobody
      // objected to) so `secondary` itself stays a clear gold; only the
      // *container* comes out a little calmer than the original #D4AF37's
      // screaming #fed65b, landing on a warm #fed268. Hue inside the spec's
      // 35-55° band either way.
      secondary: '#B8922E', // gold: everything interactive, focus ring included
      tertiary: '#C0C7D6', // silver: the rare accent
    },
    custom: {
      // Not harmonised (customColor blend:false), so this can glow brighter
      // than the UI role above without dragging text/background contrast
      // down with it — reserved for decoration (fireworks, stars).
      'brand-orange': '#E2B64A', // festive gold: fireworks and stars only
      'brand-purple': '#3B2F7A',
    },
    // Fidelity's own neutral palette flattens to near-zero chroma, so the
    // dark surface came out practically black instead of midnight violet.
    // Chroma 16 at the primary's hue reads as a clearly tinted, midnight
    // violet dark surface without turning muddy (design D3, "Nachtrag");
    // 8-12 stayed too close to neutral grey, 20+ started to compete with
    // on-surface's own tint.
    neutralChroma: 16,
  },
  spring: {
    core: {
      primary: '#3F8F3A', // spring green: structure and the surfaces' undertone
      // Calmed after the visual review: E86A9A made an eye-watering
      // secondary-container (bright pink active nav pill). Same HCT hue,
      // chroma roughly halved (~30) and a slightly lower tone — inside the
      // spec's 320-355° hue band.
      secondary: '#AF7286', // muted blossom pink: everything interactive, focus ring included
      tertiary: '#F2C94C', // daffodil yellow: the rare accent
    },
    custom: {
      'brand-orange': '#F2A541',
      'brand-purple': '#B565A7',
    },
  },
}

export const SEASONS_HEADER = '/* Written by scripts/md3-tokens.mjs — do not edit by hand. */'
/**
 * Colour values outside the roles: the raw brand colours in `:root` (the
 * connect box's glow) and the gradients in @theme. They are fixed brand hex,
 * so without a seasonal answer they keep glowing magenta and cyan in the
 * middle of a costume. A test fails as soon as tailwind.css gains one that
 * this section does not answer.
 */
export const BRIDGE_START = '/* decoration:start */'
export const BRIDGE_END = '/* decoration:end */'

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

/** Resolved on use, not on import: under a DOM test environment the module
    URL is not a file: URL and resolving it at load time throws. */
function themeFile() {
  return fileURLToPath(new URL('../assets/css/tailwind.css', import.meta.url))
}

function seasonsFile() {
  return fileURLToPath(new URL('../assets/css/seasons.css', import.meta.url))
}

/**
 * @param {boolean} isDark
 * @param {{ primary: string, secondary: string, tertiary: string }} core
 * @param {number} [neutralChroma] Overrides the neutral and neutral-variant
 *   palettes with `TonalPalette.fromHueAndChroma(primaryHue, …)` instead of
 *   Fidelity's own, near-grey neutrals. Fidelity derives its neutral palette
 *   from the primary seed too, but flattens its chroma almost to zero —
 *   fine for a brand blue, but it is why a near-black primary seed like
 *   new-year's midnight violet (#2A1B5C) still comes out neutral grey in the
 *   dark surface (design D3, "Nachtrag nach der Sichtprüfung"). Left
 *   unset, a season's output is unchanged from before this parameter existed.
 */
function scheme(isDark, core, neutralChroma) {
  const source = Hct.fromInt(argbFromHex(core.primary))
  // Fidelity keeps primary-container close to the seed, so the brand blue
  // survives instead of being desaturated as Tonal Spot would. Its neutral
  // palettes are reused unless neutralChroma overrides them; the three
  // accent palettes each come from their own core colour, as Material Theme
  // Builder does with custom core colours.
  const base = new SchemeFidelity(source, isDark, 0)
  // The neutral-variant palette (outline, surface-variant-derived roles)
  // reads a touch more tinted than plain neutral surfaces in Fidelity's own
  // output too, so the override keeps that relationship: +4 chroma, a small
  // additive step that stays legible instead of compounding a multiplier at
  // higher chroma values.
  const neutralPalette = neutralChroma === undefined
    ? base.neutralPalette
    : TonalPalette.fromHueAndChroma(source.hue, neutralChroma)
  const neutralVariantPalette = neutralChroma === undefined
    ? base.neutralVariantPalette
    : TonalPalette.fromHueAndChroma(source.hue, neutralChroma + 4)
  return new DynamicScheme({
    sourceColorArgb: source.toInt(),
    variant: base.variant,
    contrastLevel: 0,
    isDark,
    primaryPalette: TonalPalette.fromInt(argbFromHex(core.primary)),
    secondaryPalette: TonalPalette.fromInt(argbFromHex(core.secondary)),
    tertiaryPalette: TonalPalette.fromInt(argbFromHex(core.tertiary)),
    neutralPalette,
    neutralVariantPalette,
  })
}

/**
 * Every generated token as `{ light, dark }` lowercase hex. Without arguments
 * the base scheme; a season passes its own seeds and, optionally, its own
 * neutralChroma (see `scheme()`).
 */
export function generateTokens(core = CORE_COLORS, custom = CUSTOM_COLORS, neutralChroma) {
  const light = scheme(false, core, neutralChroma)
  const dark = scheme(true, core, neutralChroma)
  const tokens = {}
  for (const [name, getter] of Object.entries(SCHEME_ROLES)) {
    tokens[name] = { light: hexFromArgb(light[getter]), dark: hexFromArgb(dark[getter]) }
  }
  const sourceArgb = argbFromHex(core.primary)
  for (const [name, hex] of Object.entries(custom)) {
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
export function currentBlock(css = readFileSync(themeFile(), 'utf8')) {
  const start = css.indexOf(START_MARKER)
  const end = css.indexOf(END_MARKER)
  if (start === -1 || end === -1) return null
  const lineStart = css.lastIndexOf('\n', start) + 1
  return css.slice(lineStart, end + END_MARKER.length)
}

/**
 * Everything a season declares, in write order: every role and custom colour
 * as a light-dark() pair, then the decoration colours outside the roles —
 * raw brand colours and gradients. Values are the raw declaration text.
 */
export function seasonDeclarations(id) {
  const season = SEASONS[id]
  if (!season) throw new Error(`Unknown season "${id}"`)
  const roles = {}
  const tokens = generateTokens(season.core, season.custom, season.neutralChroma)
  for (const [name, { light, dark }] of Object.entries(tokens)) {
    roles[`--color-${name}`] = `light-dark(${light}, ${dark})`
  }
  const tone = (hex, t) => hexFromArgb(TonalPalette.fromInt(argbFromHex(hex)).tone(t))
  const { primary, secondary, tertiary } = season.core
  const purple = season.custom['brand-purple']
  const bridge = {}
  // The glow blends two raw colours with the orange custom colour; the season
  // swaps in its secondary and tertiary seeds.
  bridge['--brand-magenta'] = secondary.toLowerCase()
  bridge['--brand-cyan'] = tertiary.toLowerCase()
  // The main gradients sit on the page as text (GradientText), so they follow
  // the scheme through the roles and stay as legible as the roles are. The
  // -light variants are static, as in the base theme, at the tones the base
  // theme's own -light stops sit on.
  bridge['--gradient-brand'] = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
  bridge['--gradient-accent'] = 'linear-gradient(90deg, var(--color-brand-purple) 0%, '
    + 'var(--color-tertiary) 60%, var(--color-secondary) 100%)'
  bridge['--gradient-brand-light'] = `linear-gradient(90deg, ${tone(primary, 50)} 0%, ${tone(secondary, 75)} 100%)`
  bridge['--gradient-accent-light'] = `linear-gradient(90deg, ${tone(purple, 55)} 0%, `
    + `${tone(tertiary, 65)} 60%, ${tone(secondary, 80)} 100%)`
  return { roles, bridge }
}

/** The complete contents of assets/css/seasons.css. */
export function renderSeasons() {
  const out = [
    SEASONS_HEADER,
    '/* Seasonal overrides of the MD3 roles in tailwind.css, applied while',
    '   <html data-season="…"> is set (layers/season). `html[…]` outranks the',
    '   `:root` rule @theme writes, independent of bundle order. */',
  ]
  for (const id of Object.keys(SEASONS)) {
    const { roles, bridge } = seasonDeclarations(id)
    out.push('', `html[data-season="${id}"] {`)
    for (const [name, value] of Object.entries(roles)) out.push(`  ${name}: ${value};`)
    out.push('', `  ${BRIDGE_START}`)
    for (const [name, value] of Object.entries(bridge)) out.push(`  ${name}: ${value};`)
    out.push(`  ${BRIDGE_END}`, '}')
  }
  return `${out.join('\n')}\n`
}

function readIfExists(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

function main() {
  const css = readFileSync(themeFile(), 'utf8')
  const existing = currentBlock(css)
  const next = renderBlock()
  const seasons = renderSeasons()
  if (process.argv.includes('--check')) {
    let stale = false
    if (existing !== next) {
      console.error('MD3 colour tokens in assets/css/tailwind.css are out of date.')
      stale = true
    }
    if (readIfExists(seasonsFile()) !== seasons) {
      console.error('Seasonal colour tokens in assets/css/seasons.css are out of date.')
      stale = true
    }
    if (stale) {
      console.error('Run: node scripts/md3-tokens.mjs')
      process.exit(1)
    }
    return
  }
  if (existing === null) {
    console.error(`Markers ${START_MARKER} / ${END_MARKER} not found in ${themeFile()}.`)
    process.exit(1)
  }
  writeFileSync(themeFile(), css.replace(existing, next))
  writeFileSync(seasonsFile(), seasons)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
