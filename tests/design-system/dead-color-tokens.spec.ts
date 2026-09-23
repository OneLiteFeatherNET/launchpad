import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'
import { resolveCandidates } from '../helpers/theme'

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
 *
 * The first two were once guarded by forbidding the names outright. Material
 * Design 3 made `primary` and `secondary` real colour roles, so the rule is
 * now the one that was always meant: every colour class has to resolve.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
  'layers',
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
    for (const role of ['primary',
'secondary',
'surface',
'on-surface',
'outline']) {
      expect(tokens).toContain(role)
    }
  })
})

/** Utility prefixes that take a colour. */
const COLOUR_PREFIX = [
  'bg',
'text',
'border',
'border-[trblxy]',
'ring',
'ring-offset',
'outline',
'fill',
'stroke',
  'from',
'via',
'to',
'decoration',
'divide',
'accent',
'caret',
'placeholder',
'shadow',
].join('|')

/**
 * A class naming a colour: optional variants, a colour prefix, a name that
 * starts with a letter, an optional opacity. Arbitrary values in brackets are
 * checked separately below.
 */
const COLOUR_CLASS = new RegExp(`^(?:[a-z0-9-]+:)*!?(?:${COLOUR_PREFIX})-[a-z][a-z0-9-]*(?:/\\d+)?$`,)

/**
 * Every colour-shaped class in a template or script string, with where it
 * was found. Names that are not colours at all (`text-sm`, `border-2`,
 * `shadow-md`) still resolve, so over-matching costs nothing; a colour that
 * resolves to nothing is what this is after.
 */
function colourCandidates(): { utility: string, where: string }[] {
  const plainClasses = plainCssClasses()
  const found: { utility: string, where: string }[] = []
  for (const file of templateFiles()) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, index) => {
      for (const token of line.split(/[\s"'`{}(),]+/)) {
        if (COLOUR_CLASS.test(token) && !plainClasses.has(token)) {
          found.push({ utility: token, where: `${relativeToRepo(file)}:${index + 1}` })
        }
      }
    })
  }
  return found
}

/**
 * Class names defined as plain CSS rules rather than utilities, such as
 * `.text-gradient-brand` in tokens.css. They look like colour utilities and
 * Tailwind rightly knows nothing of them.
 */
function plainCssClasses(): Set<string> {
  const css = readFileSync(join(repoRoot, 'assets/css/tokens.css'), 'utf8')
  return new Set([...css.matchAll(/^\s*\.([a-z][a-z0-9-]*)\s*[{,]/gm)].map((m) => m[1] ?? ''))
}

describe('dead colour utilities', () => {
  it('finds source files to check', () => {
    // Without this the suite would pass vacuously if the traversal ever broke.
    expect(templateFiles().length).toBeGreaterThan(30)
  })

  it('uses only colour classes that resolve to a token', async () => {
    const candidates = colourCandidates()
    const resolved = await resolveCandidates(candidates.map((c) => c.utility))
    const unresolved = candidates
      .filter((_, index) => resolved[index] === null)
      .map((c) => `${c.where}: ${c.utility}`)
    expect(unresolved).toEqual([])
  })

  it('catches a typo in a role name', async () => {
    // Proves the check above can fail: without this, a broken extraction
    // would report a clean tree.
    const [typo, real] = await resolveCandidates(['bg-surface-contaner', 'bg-surface-container'])
    expect(typo).toBeNull()
    expect(real).not.toBeNull()
  })

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
