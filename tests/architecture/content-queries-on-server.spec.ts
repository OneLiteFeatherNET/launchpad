import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Design: openspec change query-content-on-server. In the browser every
 * content query goes through `/api/content/<method>`; a direct
 * `queryCollection` call would make the browser load @nuxt/content's SQLite
 * WebAssembly and SQL dumps again. The only code that may call it is the
 * server adapter, and the composable must hand it out on the server only.
 */
const ADAPTER = 'layers/content-core/utils/content/nuxtContentAdapter.ts'
const CLIENT_REACHABLE = ['layers',
'pages',
'components',
'composables',
'layouts',
'plugins',
'utils',
'middleware']

const stripComments = (text: string) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\/.*$/gm, '')

const QUERY_CALL = /\bqueryCollection(?:Navigation|ItemSurroundings|SearchSections)?\s*\(/

describe('content queries in the browser', () => {
  it('calls queryCollection only in the server adapter', () => {
    const offenders = collectSourceFiles(CLIENT_REACHABLE, ['.ts',
'.vue',
'.js'])
      .filter((file) => QUERY_CALL.test(stripComments(readFileSync(file, 'utf8'))))
      .map(relativeToRepo)
      .filter((file) => file !== ADAPTER)
    expect(offenders).toEqual([])
  })

  it('hands the direct adapter out on the server only', () => {
    const file = `${repoRoot}/layers/content-core/composables/useContentRepository.ts`
    const source = readFileSync(file, 'utf8')
    const direct = 'import\\.meta\\.server\\s*\\?\\s*createNuxtContentAdapter\\(queryCollection\\)'
    const handsOutDirectAdapterOnServerOnly = new RegExp(`${direct}\\s*:\\s*createFetchContentAdapter\\(\\)`)
    expect(source).toMatch(handsOutDirectAdapterOnServerOnly)
  })
})
