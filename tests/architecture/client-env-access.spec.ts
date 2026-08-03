import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Code under these directories runs in the browser as well as on the server,
 * and `process.env` does not survive the trip.
 *
 * The Vite client build replaces the expression with an empty object literal.
 * Read straight out of the shipped bundle:
 *
 *     var m={};const f=()=>{ … const n=m?.NUXT_PUBLIC_BLUEMAP_URL; … }
 *     wt={} … b=r.public?.discordUrl||wt?.NUXT_PUBLIC_DISCORD_URL
 *
 * So the lookup is not merely unreliable — it is `undefined` by construction,
 * every time, and the `?.` that makes it look defensive is what hides that.
 *
 * There is nothing to fall back *to*, either. `NUXT_PUBLIC_BLUEMAP_URL` and
 * `NUXT_PUBLIC_DISCORD_URL` are exactly the environment variables Nuxt already
 * folds into `runtimeConfig.public.bluemapUrl` / `.discordUrl`, and both keys
 * carry non-empty defaults in `nuxt.config.ts`. The first operand is therefore
 * always truthy and the fallback unreachable on the server too.
 *
 * `runtimeConfig` is the mechanism that works in both places. Build-time
 * configuration files and `server/` are a different matter and stay out of
 * scope — there `process.env` is the correct thing to read.
 */

const CLIENT_DIRS = ['components',
  'pages',
  'layouts',
  'composables',
  'utils',
  'plugins']

/** `process.env.X`, `process?.env?.X`, `process["env"]` — any of the spellings. */
const PROCESS_ENV = /\bprocess\s*\??\.\s*env\b|\bprocess\s*\??\.\s*\[\s*['"]env['"]/

/**
 * A comment naming the thing is not a use of it — and this rule is one whose
 * fix wants explaining at the call site, so the explanation must not trip it.
 */
const COMMENT_LINE = /^\s*(?:\/\/|\/\*|\*|<!--)/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(CLIENT_DIRS, ['.vue',
'.ts',
'.js'])) {
    const relative = relativeToRepo(file)
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      if (COMMENT_LINE.test(line)) return
      if (PROCESS_ENV.test(line)) found.push(`${relative}:${index + 1}`)
    })
  }
  return found
}

describe('client-side environment access', () => {
  it('recognises the spellings', () => {
    // Without this the check could pass by matching nothing at all.
    expect(PROCESS_ENV.test('const url = process.env.NUXT_PUBLIC_BLUEMAP_URL')).toBe(true)
    expect(PROCESS_ENV.test('const url = (process?.env?.NUXT_PUBLIC_DISCORD_URL as string)')).toBe(true)
    // `import.meta.server` and friends are compile-time flags Vite does replace.
    expect(PROCESS_ENV.test('if (import.meta.server) return')).toBe(false)
    // The supported mechanism.
    expect(PROCESS_ENV.test('const config = useRuntimeConfig().public')).toBe(false)
    // A different `process`-shaped identifier is not the global.
    expect(PROCESS_ENV.test('const processed = items.map(process)')).toBe(false)

    // Comments are skipped, but only comments — a trailing one must not
    // launder the code in front of it.
    expect(COMMENT_LINE.test('// the former fallback read process.env')).toBe(true)
    expect(COMMENT_LINE.test(' * it could only ever produce undefined')).toBe(true)
    expect(COMMENT_LINE.test('const url = process.env.X // still a read')).toBe(false)
  })

  it('no browser-bound module reads process.env', () => {
    expect(offenders()).toEqual([])
  })
})
