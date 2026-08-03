import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Tailwind emits a rule only for a class it can resolve. A name that resolves
 * to nothing is not an error anywhere — not in the build, not in ESLint, not
 * in the type checker. It renders as if it were absent.
 *
 * Two shapes of that were in the tree, both looking entirely plausible:
 *
 *   md:size-xl              `size-*` takes a spacing step (`size-10`) or a
 *                           fraction, never a t-shirt size. The carousel
 *                           arrows were meant to grow on desktop and never did.
 *   animate-aura-breathe    an animation utility needs a keyframe, declared
 *   animate-blob-drift-1/2  as `--animate-*` in @theme or an @keyframes block.
 *                           Neither exists, so three decorative animations
 *                           never ran — while the `motion-reduce:animate-none`
 *                           beside them implies reduced motion was handled.
 *
 * Checked against the theme rather than a fixed list, so a keyframe added
 * later makes its utility legal without editing this file.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

/** Animation utilities Tailwind ships without any theme entry. */
const BUILTIN_ANIMATIONS = new Set([
  'none',
  'spin',
  'ping',
  'pulse',
  'bounce',
])

function themeAnimations(): Set<string> {
  const css = readFileSync(join(repoRoot, 'assets/css/tailwind.css'), 'utf8')
  const names = [...css.matchAll(/--animate-([a-z0-9-]+)\s*:/g)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined)
  const keyframes = [...css.matchAll(/@keyframes\s+([a-z0-9-]+)/g)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined)
  return new Set([...names, ...keyframes])
}

function templateFiles(): string[] {
  return collectSourceFiles(SOURCE_DIRS, ['.vue']).concat([join(repoRoot, 'error.vue')])
}

function usages(pattern: RegExp): { file: string, value: string }[] {
  const found: { file: string, value: string }[] = []
  for (const file of templateFiles()) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(pattern)) {
      const value = match[1]
      if (value !== undefined) found.push({ file: relativeToRepo(file), value })
    }
  }
  return found
}

describe('utility classes that resolve to nothing', () => {
  it('finds files to check', () => {
    expect(templateFiles().length).toBeGreaterThan(30)
  })

  it('every animate-* has a keyframe or is built in', () => {
    const known = themeAnimations()
    const dead = usages(/\banimate-([a-z][a-z0-9-]*)\b/g)
      .filter((use) => !BUILTIN_ANIMATIONS.has(use.value) && !known.has(use.value))
      .map((use) => `${use.file}: animate-${use.value}`)
    expect([...new Set(dead)].sort()).toEqual([])
  })

  it('size-* takes a numeric step, not a t-shirt size', () => {
    // `size-xl` is the shape of `text-xl` and `shadow-xl`, which is exactly
    // why it looks right; the size utility has no such scale.
    const dead = usages(/\bsize-(xs|sm|md|lg|xl|2xl|3xl|full|screen)\b/g)
      .map((use) => `${use.file}: size-${use.value}`)
    expect([...new Set(dead)].sort()).toEqual([])
  })
})
