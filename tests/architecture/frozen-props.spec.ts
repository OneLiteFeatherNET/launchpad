import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * `const variant = props.variant ?? 'top'` reads the prop once, when setup
 * runs, and never again. It looks like the reactive destructuring the Vue
 * compiler rewrites, but that only applies *inside* `defineProps()` — this is
 * an ordinary property access, and the compiler leaves it alone.
 *
 * Everything downstream inherits the staleness. A `computed` that closes over
 * the constant has no reactive dependency to track, so it never recomputes; a
 * `v-if` on it never re-evaluates. The component renders whatever the parent
 * passed on the first render, forever.
 *
 * `withDefaults(defineProps<…>(), { … })` puts the fallback where the compiler
 * can see it and leaves `props.variant` reactive at every read.
 *
 * Worth stating plainly: no call site in this repository binds these props
 * dynamically today, so nothing is currently rendering stale. The rule earns
 * its keep by making sure the first one that does isn't the way this is found
 * out — a stale `v-if` fails silently, with no error and no wrong-looking
 * code at the call site.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts']

/** Top-level (unindented, so outside any function) reads of a prop. */
const FROZEN_PROP = /^const\s+(\w+)\s*=\s*props\.(\w+)/
/** Destructuring `props` outside `defineProps()` drops reactivity the same way. */
const DESTRUCTURED_PROPS = /^const\s*\{[^}]*\}\s*=\s*props\b/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue'])) {
    const relative = relativeToRepo(file)
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      const frozen = FROZEN_PROP.exec(line)
      if (frozen) found.push(`${relative}:${index + 1} — ${frozen[1]} frozen from props.${frozen[2]}`)
      else if (DESTRUCTURED_PROPS.test(line)) found.push(`${relative}:${index + 1} — props destructured`)
    })
  }
  return found
}

describe('prop reactivity', () => {
  it('tells a frozen read from a reactive one', () => {
    // Without this the check could pass by matching nothing at all.
    expect(FROZEN_PROP.exec("const variant = props.variant ?? 'top';")?.[2]).toBe('variant')
    expect(DESTRUCTURED_PROPS.test('const { slides, loop } = props')).toBe(true)

    // A computed re-reads the prop on every evaluation — the correct form, and
    // the one already used for `size` two lines below the frozen `variant`.
    expect(FROZEN_PROP.test("const size = computed(() => props.size ?? 'md');")).toBe(false)
    // Declaring the props is not reading them.
    expect(FROZEN_PROP.test('const props = defineProps<{ variant?: string }>();')).toBe(false)
    // Indented, so inside a function: evaluated per call, not once at setup.
    expect(FROZEN_PROP.test('  const target = props.path')).toBe(false)
  })

  it('no prop is frozen into a setup-time constant', () => {
    expect(offenders()).toEqual([])
  })
})
