import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `server/routes/__sitemap__/[sitemap].xml.ts` existed for one reason: on
 * @nuxtjs/sitemap 7.6.0 the child-sitemap handler bailed out on
 * `!e.path.endsWith(".xml")`, so any query string turned a sitemap into a
 * `204 No Content`. The shim stripped the query before delegating.
 *
 * The SEO gate, by design, never appends `?mockProductionEnv` to a sitemap
 * path — so the one condition the shim was built for was never exercised by
 * CI. It could rot into a no-op, or into a crash, without anything noticing.
 *
 * Measured on the dev server at @nuxtjs/sitemap 8.3.2, four requests each with
 * and without the shim present:
 *
 *   /sitemap_index.xml                        200, 2 <loc>
 *   /__sitemap__/de-DE.xml                    200, 29 <loc>
 *   /__sitemap__/de-DE.xml?mockProductionEnv  200, 29 <loc>
 *   /sitemap_index.xml?mockProductionEnv      200, 2 <loc>
 *
 * Byte-identical both ways: the upstream bug is gone two majors on, and the
 * shim was a pure passthrough reaching into h3 v1 internals (`event.node.req`,
 * a cast to `{ _path }`) that h3 v2 removes. It is deleted here.
 *
 * What replaces it is the assertion that was missing all along — the gate now
 * fetches a child sitemap *with* the query and requires a populated document.
 * If the upstream behaviour ever regresses, CI says so instead of a shim
 * silently absorbing it.
 */

const GATE = 'scripts/seo-check.mjs'
const SHIM = 'server/routes/__sitemap__/[sitemap].xml.ts'

function gate(): string {
  return readFileSync(`${repoRoot}/${GATE}`, 'utf8')
}

describe('sitemap query-string handling', () => {
  it('no longer carries a shim for it', () => {
    expect(existsSync(`${repoRoot}/${SHIM}`)).toBe(false)
  })

  it('is asserted by the SEO gate instead', () => {
    const source = gate()

    // The gate must request a sitemap *with* the query — the exact case its
    // own buildUrl() suppresses everywhere else.
    expect(source).toContain('mockProductionEnv')
    expect(source).toMatch(/checkSitemapAcceptsQueryString/)

    // And it must judge the response, not merely fetch it.
    const check = /const checkSitemapAcceptsQueryString[\s\S]*?\n\}/.exec(source)?.[0]
    expect(check).toBeDefined()
    expect(check).toMatch(/status !== 200|status === 200/)
    expect(check).toContain('<loc>')
  })
})
