import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * `tsconfig` here inherits `allowJs: true` from @nuxt/kit and never turns on
 * `checkJs`, so a `.js` file in the source tree compiles without ever being
 * type-checked. It looks like part of a TypeScript codebase and is exempt from
 * the rules that codebase runs on — the quietest way to lose coverage.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts',
  'composables',
  'utils',
  'plugins',
  'server',
  'middleware',
  'types']

function untypedSources(): string[] {
  return collectSourceFiles(SOURCE_DIRS, ['.js', '.jsx']).map(relativeToRepo)
}

describe('source files', () => {
  it('looks at directories that exist', () => {
    // Without this, a renamed directory would turn the check into a no-op.
    expect(collectSourceFiles(SOURCE_DIRS, ['.ts', '.vue']).length).toBeGreaterThan(50)
  })

  it('are all type-checked', () => {
    expect(untypedSources()).toEqual([])
  })
})
