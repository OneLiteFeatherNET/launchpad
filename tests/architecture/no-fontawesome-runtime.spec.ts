import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Icons are plain `<svg>` elements built from the icon definitions. The Font
 * Awesome runtime (`fontawesome-svg-core`, `vue-fontawesome`) and its global
 * stylesheet cost about 99 KB of script and 23 KB of inline CSS per page.
 */
const SOURCE_DIRS = ['components',
'pages',
'layouts',
'composables',
'plugins',
'layers',
'utils',
'types']
const FORBIDDEN = /fontawesome-svg-core|vue-fontawesome|font-awesome-icon|FontAwesomeIcon/

describe('no Font Awesome runtime', () => {
  it('is imported or used by no source file', () => {
    const offenders = collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])
      .filter((file) => FORBIDDEN.test(readFileSync(file, 'utf8')))
      .map(relativeToRepo)
    expect(offenders).toEqual([])
  })

  it('is not a dependency, nor loaded from the Nuxt config', () => {
    const pkg = JSON.parse(readFileSync(`${repoRoot}/package.json`, 'utf8')) as Record<string, Record<string, string>>
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
    expect(deps.filter((name) => FORBIDDEN.test(name))).toEqual([])
    expect(readFileSync(`${repoRoot}/nuxt.config.ts`, 'utf8')).not.toMatch(FORBIDDEN)
  })
})
