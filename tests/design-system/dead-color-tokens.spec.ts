import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Colour utilities naming a token that does not exist compile to nothing.
 * Tailwind does not warn, ESLint does not check class names, and the build
 * succeeds either way — the class simply ships invisible.
 *
 * That happened three times over in this repository: a bare
 * `--color-secondary` which was never declared (39 call sites, among them the
 * skip link's focus outline and the only way back from a 404), the
 * `primary`/`secondary`/`accent` names from a `tailwind.config.mts` that was
 * never loaded (30 call sites, one of them white text on a white button), and
 * a numeric `brand-<n>` scale that does not exist.
 *
 * Each of these tests fails on the state before its fix. They exist because
 * copying a neighbouring class is exactly how the pattern spread.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

const THEME_TOKEN = /--color-([a-z0-9-]+)\s*:/g

/** Colour token names declared in the `@theme` block. */
function themeTokens(): Set<string> {
  const css = readFileSync(join(repoRoot, 'assets/css/tailwind.css'), 'utf8')
  const names = [...css.matchAll(THEME_TOKEN)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined)
  return new Set(names)
}

/** Every Vue file that can carry a utility class, error.vue included. */
function templateFiles(): string[] {
  return collectSourceFiles(SOURCE_DIRS, ['.vue']).concat([join(repoRoot, 'error.vue')])
}

/** First 1-based matching line, or null. Reported so a failure points somewhere. */
function findLine(file: string, pattern: RegExp): number | null {
  const lines = readFileSync(file, 'utf8').split('\n')
  const index = lines.findIndex((line) => pattern.test(line))
  return index === -1 ? null : index + 1
}

/** Files matching `pattern`, as `path:line`, for a readable assertion diff. */
function offenders(pattern: RegExp): string[] {
  return templateFiles()
    .map((file) => ({ file, line: findLine(file, pattern) }))
    .filter((hit) => hit.line !== null)
    .map((hit) => `${relativeToRepo(hit.file)}:${hit.line}`)
}

describe('colour tokens', () => {
  it('declares the tokens the components rely on', () => {
    // Guards the rename target itself: if these disappeared, every class that
    // replaced a dead name would die the same silent death.
    const tokens = themeTokens()
    expect(tokens).toContain('brand-primary')
    expect(tokens).toContain('brand-secondary')
  })

  it('never declares a bare --color-secondary', () => {
    // Declaring it would "fix" the old call sites while activating the whole
    // discouraged bare `*-secondary` utility family. The call sites were
    // changed instead, so this token must stay absent.
    expect(themeTokens().has('secondary')).toBe(false)
  })
})

describe('dead colour utilities', () => {
  it('finds source files to check', () => {
    // Without this the suite would pass vacuously if the traversal ever broke.
    expect(templateFiles().length).toBeGreaterThan(30)
  })

  it('uses no bare primary/secondary colour classes', () => {
    // These only ever resolved through tailwind.config.mts, which was never
    // loaded and has since been deleted.
    expect(offenders(/\b(?:bg|text|ring|border|outline|from|via|to)-(?:primary|secondary)\b(?!-)/))
      .toEqual([])
  })

  // A check for the numeric `brand-<n>` scale belongs here too — `@theme` has
  // no such scale, so `bg-brand-500` renders nothing. It arrives together with
  // the change removing the remaining usages: landing a failing test ahead of
  // its fix would block every unrelated pull request behind a red check.

  it('references no undeclared custom property in an arbitrary value', () => {
    // `ring-[var(--color-secondary)]` is not validated against `@theme`; an
    // undeclared property silently resolves to nothing.
    const tokens = themeTokens()
    const found: string[] = []
    for (const file of templateFiles()) {
      const text = readFileSync(file, 'utf8')
      for (const match of text.matchAll(/var\(--color-([a-z0-9-]+)\)/g)) {
        const name = match[1]
        if (name !== undefined && !tokens.has(name)) {
          found.push(`${relativeToRepo(file)}: --color-${name}`)
        }
      }
    }
    expect(found).toEqual([])
  })
})

describe('focus rings', () => {
  it('never uses a bare focus: ring', () => {
    // `focus:` matches pointer input too, which is why it gets paired with
    // `focus:outline-none` and then flashes a ring on every mouse click.
    // `focus-visible:` is the keyboard-only variant.
    expect(offenders(/\bfocus:ring-/)).toEqual([])
  })
})
