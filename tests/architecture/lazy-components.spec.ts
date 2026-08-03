import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * A hand-rolled `defineAsyncComponent(() => import('…'))` in a page buys less
 * than it looks like.
 *
 * Vue awaits async components during SSR, so the markup is in the HTML either
 * way — measured on this page, all five sections render server-side with the
 * wrapper in place. What changes is the client: each one becomes a separate
 * chunk that has to arrive before its subtree can hydrate, and Vue hydrates it
 * as soon as it does. Five extra requests, and not one unit of hydration work
 * saved.
 *
 * Nuxt's `Lazy` prefix produces the same code-splitting and additionally
 * accepts a hydration strategy — `hydrate-on-visible` and friends — which is
 * the part that actually defers work. Reaching for the Vue primitive inside a
 * page skips the mechanism that makes the split worth making.
 *
 * Not guarded here: *which* strategy a given section should use, or whether it
 * should have one at all. `<LazyX v-if="…">` with no strategy is a reasonable
 * thing to write when the condition is often false, because then the chunk is
 * never fetched. That is a judgement per call site, not a rule.
 */

const SOURCE_DIRS = ['pages', 'layouts']

const HAND_ROLLED_ASYNC = /\bdefineAsyncComponent\s*\(/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue'])) {
    const relative = relativeToRepo(file)
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      if (HAND_ROLLED_ASYNC.test(line)) found.push(`${relative}:${index + 1}`)
    })
  }
  return found
}

describe('lazy components in pages', () => {
  it('recognises the call', () => {
    // Without this the check could pass by matching nothing at all.
    expect(HAND_ROLLED_ASYNC.test("const X = defineAsyncComponent(() => import('~/c.vue'))")).toBe(true)
    // The import of the helper is not a use of it; only the call is.
    expect(HAND_ROLLED_ASYNC.test("import { computed } from 'vue'")).toBe(false)
    expect(HAND_ROLLED_ASYNC.test('<LazyFeaturesHomeFaqSection hydrate-on-visible />')).toBe(false)
  })

  it('pages defer through the Lazy prefix, not the Vue primitive', () => {
    expect(offenders()).toEqual([])
  })
})
