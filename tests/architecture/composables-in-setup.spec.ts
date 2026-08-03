import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * A composable resolves the component instance it belongs to via
 * `getCurrentInstance()`, which is only set during setup. Called from inside a
 * `computed` getter it works by accident: Vue's implementation is
 * `currentInstance || currentRenderingInstance`, so while the getter is being
 * evaluated *as part of a render* the rendering instance stands in.
 *
 * The accident holds only as long as nothing ever evaluates that computed
 * outside a render pass — a watcher, a pre-flush job, a unit test that reads
 * `.value`. vue-i18n throws `MUST_BE_CALL_SETUP_TOP` the moment it does not.
 *
 * `ProseHeading.vue` shows the shape this should have: `const { t, te } =
 * useI18n()` beside `defineProps`, with the computed closing over it. Hoisting
 * also stops the lookup repeating on every re-evaluation.
 *
 * Two files had it, not the one the finding names — `ProsePre` with
 * `useI18n()` and `ProseImg` with `useRuntimeConfig()`.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts',
  'composables']

/** The body of a `computed(() => { … })` block. */
const COMPUTED_BODY = /computed(?:<[^>]*>)?\(\(\) => \{(.*?)\n\}\)/gs
/** A composable call: `useX(`. */
const COMPOSABLE_CALL = /\b(use[A-Z]\w*)\s*\(/g

function callsInsideComputed(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    COMPUTED_BODY.lastIndex = 0
    for (const [, body] of text.matchAll(COMPUTED_BODY)) {
      COMPOSABLE_CALL.lastIndex = 0
      for (const [, name] of body!.matchAll(COMPOSABLE_CALL)) {
        found.push(`${relativeToRepo(file)} — ${name}() inside a computed`)
      }
    }
  }
  return found
}

describe('composable call sites', () => {
  it('recognises a computed body and a composable call', () => {
    // Without this the check could pass by matching nothing at all.
    const sample = 'const a = computed(() => {\n  const { t } = useI18n()\n  return t("x")\n})'
    COMPUTED_BODY.lastIndex = 0
    const bodies = [...sample.matchAll(COMPUTED_BODY)]
    expect(bodies).toHaveLength(1)
    COMPOSABLE_CALL.lastIndex = 0
    expect([...bodies[0]![1]!.matchAll(COMPOSABLE_CALL)].map(([, n]) => n)).toEqual(['useI18n'])

    // A composable hoisted above the computed is the correct shape.
    const hoisted = 'const { t } = useI18n()\nconst a = computed(() => {\n  return t("x")\n})'
    COMPUTED_BODY.lastIndex = 0
    const body = [...hoisted.matchAll(COMPUTED_BODY)][0]![1]!
    COMPOSABLE_CALL.lastIndex = 0
    expect([...body.matchAll(COMPOSABLE_CALL)]).toHaveLength(0)
  })

  it('are all outside computed getters', () => {
    expect(callsInsideComputed()).toEqual([])
  })
})
