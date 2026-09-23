import { describe, expect, it } from 'vitest'
import { countTypeErrors } from '../../scripts/count-type-errors.mjs'

describe('countTypeErrors', () => {
  it('counts an error reported by two projects once', () => {
    // `shared/` belongs to both the app and the shared project, so build mode
    // prints the same error twice.
    const line = 'shared/utils/eventPhase.ts(4,7): error TS2322: Type \'string\' is not assignable.'
    const output = [line, line].join('\n')
    expect(countTypeErrors(output)).toBe(1)
  })

  it('counts distinct locations and codes separately', () => {
    const output = [
      'pages/index.vue(73,6): error TS2322: Type \'number | null\' is not assignable.',
      'pages/index.vue(73,6): error TS2345: Argument of type \'x\' is not assignable.',
      'pages/index.vue(74,6): error TS2322: Type \'number | null\' is not assignable.',
      'layers/a/b.ts(73,6): error TS2322: Type \'number | null\' is not assignable.',
    ].join('\n')
    expect(countTypeErrors(output)).toBe(4)
  })

  it('ignores continuation lines and a clean run', () => {
    const error = 'eslint.config.mjs(9,15): error TS2339: Property \'rules\' does not exist.'
    const continuation = '  Property \'rules\' does not exist on type \'A\'.'
    const output = [error, continuation].join('\n')
    expect(countTypeErrors(output)).toBe(1)
    expect(countTypeErrors('')).toBe(0)
  })
})
