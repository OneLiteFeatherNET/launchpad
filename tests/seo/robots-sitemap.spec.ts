import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `robots.txt` announced two sitemaps where there is one.
 *
 * `nuxt.config.ts` declared `robots: { sitemap: ['/sitemap.xml'] }`, and
 * @nuxtjs/sitemap independently pushes its own entry — `/sitemap_index.xml`,
 * because the i18n prefix strategy makes this a multi-sitemap setup.
 * @nuxtjs/robots deduplicates identical strings, and those two are not
 * identical, so both survived:
 *
 *   Sitemap: https://onelitefeather.net/sitemap.xml
 *   Sitemap: https://onelitefeather.net/sitemap_index.xml
 *
 * The first is not a second sitemap. It is a **redirect** to the second —
 * measured as `307 → /sitemap_index.xml`. (The finding said 301; the installed
 * @nuxtjs/sitemap 8.3.2 issues a 307.) So a crawler is handed one real URL and
 * one hop to the same place.
 *
 * The module supplies the correct directive on its own, which is why the fix
 * is a deletion rather than a correction.
 */

const CONFIG = 'nuxt.config.ts'
const GATE = 'scripts/seo-check.mjs'

function read(file: string): string {
  return readFileSync(`${repoRoot}/${file}`, 'utf8')
}

describe('robots sitemap directives', () => {
  it('are left to the sitemap module', () => {
    const robots = /robots:\s*\{([\s\S]*?)\n\s{4}\}/.exec(read(CONFIG))?.[1]
    expect(robots).toBeDefined()
    // Hand-declaring one only adds a line the module did not ask for.
    expect(robots).not.toMatch(/sitemap:\s*\[/)
  })

  it('are checked for real by the SEO gate', () => {
    const gate = read(GATE)
    expect(gate).toMatch(/checkRobotsSitemaps/)

    const check = /const checkRobotsSitemaps[\s\S]*?\n\}/.exec(gate)?.[0]
    expect(check).toBeDefined()
    // A declared sitemap must resolve directly — a redirect is the defect.
    expect(check).toContain('Sitemap:')
    expect(check).toMatch(/status !== 200/)
  })
})
