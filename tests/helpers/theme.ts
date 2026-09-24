import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot } from './sources'

export const THEME_FILE = join(repoRoot, 'assets/css/tailwind.css')

export function themeCss(): string {
  return readFileSync(THEME_FILE, 'utf8')
}

export const SEASONS_FILE = join(repoRoot, 'assets/css/seasons.css')

export function seasonsCss(): string {
  return readFileSync(SEASONS_FILE, 'utf8')
}

/**
 * The declarations of one season's `html[data-season="<id>"]` block, or null
 * when seasons.css has none. Feed it to `schemeColors()` to read the season's
 * roles the way the base scheme's are read.
 */
export function seasonCss(id: string, css = seasonsCss()): string | null {
  const match = new RegExp(`html\\[data-season="${id}"\\]\\s*\\{([^}]*)\\}`).exec(css)
  return match?.[1] ?? null
}

/** Ids of every season block in seasons.css, in file order. */
export function seasonIds(css = seasonsCss()): string[] {
  return [...css.matchAll(/html\[data-season="([a-z0-9-]+)"\]/g)].map((m) => m[1] ?? '')
}

/** Colour values of one scheme pair, lowercase `#rrggbb`. */
export interface SchemeColor {
  light: string
  dark: string
}

/**
 * Every `--color-*` token in the theme resolved to its light and dark value.
 * A plain hex applies to both schemes; a `light-dark(a, b)` pair is split.
 * Tokens whose value is neither (a gradient, a var()) are left out.
 */
export function schemeColors(css = themeCss()): Map<string, SchemeColor> {
  const colors = new Map<string, SchemeColor>()
  const declaration = /--color-([a-z0-9-]+)\s*:\s*([^;]+);/g
  for (const [, name,
raw] of css.matchAll(declaration)) {
    if (name === undefined || raw === undefined) continue
    const value = raw.trim().toLowerCase()
    const pair = /^light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)$/.exec(value)
    if (pair?.[1] && pair[2]) {
      colors.set(name, { light: pair[1], dark: pair[2] })
    } else if (/^#[0-9a-f]{6}$/.test(value)) {
      colors.set(name, { light: value, dark: value })
    }
  }
  return colors
}

/** Relative luminance per WCAG 2.x, from `#rrggbb`. */
export function luminance(hex: string): number {
  const channels = [1,
3,
5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
  const [r = 0,
g = 0,
b = 0] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two `#rrggbb` colours. */
export function contrastRatio(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05)
}

/**
 * Compiles the real `tailwind.css` for the given candidate classes and
 * returns the generated CSS. Much faster than a Nuxt build and enough to show
 * whether a utility resolves and what it emits.
 */
export async function compileUtilities(candidates: string[]): Promise<string> {
  const { compile } = await import('tailwindcss')
  const compiler = await compile(themeCss(), compileOptions())
  return compiler.build(candidates)
}

/**
 * For each candidate, the CSS Tailwind would emit for it, or null when the
 * class resolves to nothing — the same answer the build gives, without one.
 */
export async function resolveCandidates(
  candidates: string[],
  css = themeCss(),
): Promise<(string | null)[]> {
  const { __unstable__loadDesignSystem } = await import('tailwindcss')
  const system = await __unstable__loadDesignSystem(css, compileOptions())
  return system.candidatesToCss(candidates)
}

function compileOptions() {
  const tailwindDir = join(repoRoot, 'node_modules/tailwindcss')
  const cssDir = join(repoRoot, 'assets/css')
  return {
    base: cssDir,
    loadStylesheet: async (id: string) => {
      // The project's own imports (./seasons.css) sit next to tailwind.css.
      if (id.startsWith('./')) {
        const path = join(cssDir, id)
        return { path, base: cssDir, content: readFileSync(path, 'utf8') }
      }
      const file = id === 'tailwindcss' ? 'index.css' : id.replace(/^tailwindcss\//, '')
      return {
        path: join(tailwindDir, file),
        base: tailwindDir,
        content: readFileSync(join(tailwindDir, file), 'utf8'),
      }
    },
  }
}

/** The body of the first rule whose selector is exactly `.<className>`. */
export function ruleFor(css: string, className: string): string | null {
  const escaped = className.replace(/[/:.[\]()]/g, (c) => `\\\\${c}`)
  const match = new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`).exec(css)
  return match?.[1]?.trim() ?? null
}
