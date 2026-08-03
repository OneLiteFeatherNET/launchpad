import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * A listener registered in a component's setup outlives the component unless
 * something removes it. On a client-side navigation the component unmounts,
 * the listener stays subscribed, and its closure keeps the whole component
 * scope — refs, computeds, props — reachable. Return to the page and a second
 * listener joins the first.
 *
 * @vueuse/core is already a dependency and its composables unregister on
 * scope disposal, so `useMediaQuery`, `useEventListener` and friends are the
 * answer here rather than a hand-written onUnmounted.
 *
 * Scope note: this only looks at .vue files, and only for the listener APIs
 * that attach to a long-lived target. A listener on an element inside the
 * component's own template dies with the element; one on `window`,
 * `document` or a MediaQueryList does not.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

/** Registrations on a target that outlives the component. */
const LONG_LIVED_TARGET = /\b(?:window|document|m|mql|mediaQuery)(?:\?\.|\.)addEventListener(?:\?\.)?\(/g
const ANY_REMOVE = /removeEventListener/
/** @vueuse composables tear down with the effect scope. */
const VUEUSE_MANAGED = /\buse(?:EventListener|MediaQuery|WindowSize|Scroll|Intersection\w*)\s*\(/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue'])) {
    const text = readFileSync(file, 'utf8')
    const registrations = [...text.matchAll(LONG_LIVED_TARGET)]
    if (registrations.length === 0) continue
    if (ANY_REMOVE.test(text)) continue
    if (VUEUSE_MANAGED.test(text)) continue
    found.push(`${relativeToRepo(file)} (${registrations.length})`)
  }
  return found
}

describe('event listeners', () => {
  it('distinguishes managed from unmanaged registrations', () => {
    // Without this the check could pass by matching nothing at all.
    expect(LONG_LIVED_TARGET.test('window.addEventListener("resize", fn)')).toBe(true)
    LONG_LIVED_TARGET.lastIndex = 0
    // Optional-call form: `?.` is two characters, and missing that is why an
    // earlier version of this pattern reported a clean tree.
    expect(LONG_LIVED_TARGET.test("m.addEventListener?.('change', set)")).toBe(true)
    LONG_LIVED_TARGET.lastIndex = 0
    expect(VUEUSE_MANAGED.test('const reduced = useMediaQuery("(prefers-reduced-motion)")')).toBe(true)
    expect(VUEUSE_MANAGED.test('el.addEventListener("click", fn)')).toBe(false)
  })

  it('every long-lived listener is removed or managed', () => {
    expect(offenders()).toEqual([])
  })
})
