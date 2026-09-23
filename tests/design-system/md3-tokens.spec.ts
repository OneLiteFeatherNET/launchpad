import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  currentBlock,
  generateTokens,
  renderBlock,
} from '../../scripts/md3-tokens.mjs'
import { repoRoot } from '../helpers/sources'
import { resolveCandidates, schemeColors, themeCss } from '../helpers/theme'

/**
 * The MD3 colour roles are generated from the brand's core colours and then
 * checked in as static values, so the build never runs the colour maths.
 * That trade only holds while the checked-in values are exactly what the
 * generator produces: a hand-edited role would keep its name and silently
 * lose the contrast guarantee the algorithm gives every on-/container pair.
 */

/** Every role the design-tokens spec requires, in both schemes. */
const REQUIRED_ROLES = [
  'primary',
'on-primary',
'primary-container',
'on-primary-container',
  'secondary',
'on-secondary',
'secondary-container',
'on-secondary-container',
  'tertiary',
'on-tertiary',
'tertiary-container',
'on-tertiary-container',
  'error',
'on-error',
'error-container',
'on-error-container',
  'surface',
'on-surface',
'on-surface-variant',
'surface-dim',
'surface-bright',
  'surface-container-lowest',
'surface-container-low',
'surface-container',
  'surface-container-high',
'surface-container-highest',
  'outline',
'outline-variant',
  'inverse-surface',
'inverse-on-surface',
'inverse-primary',
  'scrim',
'shadow',
  'brand-orange',
'on-brand-orange',
'brand-orange-container',
'on-brand-orange-container',
  'brand-purple',
'on-brand-purple',
'brand-purple-container',
'on-brand-purple-container',
]

/** Generated token names whose checked-in value differs from the generator. */
function staleTokens(css: string): string[] {
  const checkedIn = schemeColors(css)
  return Object.entries(generateTokens())
    .filter(([name, expected]) => {
      const actual = checkedIn.get(name)
      return actual?.light !== expected.light || actual?.dark !== expected.dark
    })
    .map(([name]) => name)
}

describe('generated MD3 colour roles', () => {
  it('are up to date with the generator', () => {
    expect(currentBlock(themeCss())).toBe(renderBlock())
  })

  it('name the token that was edited by hand', () => {
    const tampered = themeCss().replace(
      /--color-primary: light-dark\(#[0-9a-f]{6}/,
      '--color-primary: light-dark(#123456',
    )
    expect(staleTokens(tampered)).toEqual(['primary'])
    expect(staleTokens(themeCss())).toEqual([])
  })

  it('define every required role with a light and a dark value', () => {
    const colors = schemeColors()
    const missing = REQUIRED_ROLES.filter((role) => !colors.has(role))
    expect(missing).toEqual([])
    const tokens = generateTokens()
    const notPaired = REQUIRED_ROLES.filter((role) => !tokens[role])
    expect(notPaired).toEqual([])
  })

  it('keep the brand blue as the primary container', () => {
    // Fidelity was chosen so the seed survives as a surface colour; if an
    // upgrade of the colour library changed that, the brand would drift.
    expect(schemeColors().get('primary-container')?.light).toBe('#2a388f')
  })
})

describe('browser chrome colour', () => {
  /** The theme-color meta for one colour scheme, as declared in app.vue. */
  function themeColor(scheme: 'light' | 'dark'): string | undefined {
    const app = readFileSync(join(repoRoot, 'app.vue'), 'utf8')
    const pattern = new RegExp(`name: 'theme-color', media: '\\(prefers-color-scheme: ${scheme}\\)', content: '(#[0-9a-f]{6})'`,)
    return pattern.exec(app)?.[1]
  }

  it('matches the surface role in both schemes', () => {
    const surface = schemeColors().get('surface')
    expect(themeColor('light')).toBe(surface?.light)
    expect(themeColor('dark')).toBe(surface?.dark)
  })
})

describe('legacy colour tokens', () => {
  it('are gone, so their classes resolve to nothing', async () => {
    // The pre-MD3 names: neutrals, the numeric brand ramp, the secondary-*
    // brand colours. A component still naming one would ship invisible, and
    // dead-color-tokens.spec.ts would catch it; this pins that they are gone.
    const legacy = [
      'text-muted',
      'bg-bg',
      'text-text',
      'border-border',
      'bg-brand-500',
      'text-brand-primary',
      'bg-secondary-cyan',
    ]
    const resolved = await resolveCandidates(legacy)
    expect(legacy.filter((_, index) => resolved[index] !== null)).toEqual([])
  })
})
