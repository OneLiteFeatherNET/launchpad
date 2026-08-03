import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Components address brand colours on a numeric scale — `text-brand-900`,
 * `bg-brand-100`, `from-brand-500`. Tailwind mints a utility per `--color-*`
 * entry in `@theme`, so every step used has to be declared there or the class
 * compiles to nothing and ships invisible.
 *
 * Rather than forbidding the scale (the usages range 50–900 and clearly want
 * gradations; collapsing them onto two tokens would flatten the design), this
 * asserts the weaker and more useful rule: whatever step the code names must
 * exist. That catches both a missing scale and a single typo'd step.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

/** Utility prefixes that resolve against the colour namespace. */
const COLOUR_PREFIX = 'bg|text|ring|ring-offset|border|outline|from|via|to|shadow|fill|stroke|decoration|divide|accent|caret'

const USED_STEP = new RegExp(`\\b(?:${COLOUR_PREFIX})-brand-(\\d+)\\b`, 'g')

function themeTokens(): Set<string> {
  const css = readFileSync(join(repoRoot, 'assets/css/tailwind.css'), 'utf8')
  const names = [...css.matchAll(/--color-([a-z0-9-]+)\s*:/g)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined)
  return new Set(names)
}

function templateFiles(): string[] {
  return collectSourceFiles(SOURCE_DIRS, ['.vue']).concat([join(repoRoot, 'error.vue')])
}

describe('numeric brand scale', () => {
  const usages = new Map<string, string[]>()
  for (const file of templateFiles()) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(USED_STEP)) {
      const step = match[1]
      if (step === undefined) continue
      const seen = usages.get(step) ?? []
      seen.push(relativeToRepo(file))
      usages.set(step, seen)
    }
  }

  it('declares every step the components use', () => {
    const tokens = themeTokens()
    const missing = [...usages.keys()]
      .filter((step) => !tokens.has(`brand-${step}`))
      .sort((a, b) => Number(a) - Number(b))
      .map((step) => `brand-${step} (used in ${usages.get(step)?.length} file(s))`)
    expect(missing).toEqual([])
  })

  it('keeps 500 as the base step, matching brand-primary', () => {
    // The scale is derived from --color-brand-primary. If 500 drifts away from
    // it, `from-brand-500` and `bg-brand-primary` stop matching where both are
    // used on the same surface.
    const css = readFileSync(join(repoRoot, 'assets/css/tailwind.css'), 'utf8')
    const primary = /--color-brand-primary:\s*([^;]+);/.exec(css)?.[1]?.trim().toLowerCase()
    const step500 = /--color-brand-500:\s*([^;]+);/.exec(css)?.[1]?.trim().toLowerCase()
    expect(step500).toBe(primary)
  })
})
