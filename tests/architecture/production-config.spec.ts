import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `$production` is merged over the base config by c12 using @nuxt/kit's
 * `createDefu` merger, and for two arrays that merger **concatenates**:
 * `obj[key] = obj[key].concat(value)`. Repeating a list in `$production` does
 * not override it, it doubles it.
 *
 * Loaded with `NODE_ENV=production` before the change:
 *
 *   schemaOrg.identity.sameAs   6 entries   (3 declared, twice)
 *   schemaOrg.identity.contactPoint  2      (one object, twice)
 *   i18n.locales                4           (de, en, de, en)
 *   image.format                ['avif','webp','avif','webp']
 *
 * The schema.org duplication ships to Google as fact about the organisation.
 * The doubled locale list is the one that could bite hardest — every consumer
 * of `i18n.locales` iterates it, and hreflang generation is one of them.
 *
 * The rule below is therefore about arrays specifically: a list that appears in
 * both blocks is never an override, only ever an append. Scalars are fine —
 * `site.url` and `schemaOrg.identity.url` *should* appear in both, because
 * that is what `$production` is for.
 */

const CONFIG = 'nuxt.config.ts'

/** Top-level `key: [` array literals inside a block, by key path. */
function arrayKeys(block: string): string[] {
  return [...block.matchAll(/^(\s+)([\w'"]+):\s*\[/gm)].map(([, , key]) => key!.replace(/['"]/g, ''))
}

function blocks(): { base: string, production: string } {
  const source = readFileSync(`${repoRoot}/${CONFIG}`, 'utf8')
  const start = source.indexOf('    $production: {')
  expect(start).toBeGreaterThan(0)
  return { base: source.slice(0, start), production: source.slice(start) }
}

describe('production config overrides', () => {
  it('finds both blocks', () => {
    // Without this, an empty production block would satisfy every rule.
    const { base, production } = blocks()
    expect(base.length).toBeGreaterThan(1000)
    expect(production.length).toBeGreaterThan(500)
    expect(arrayKeys(base)).toContain('sameAs')
  })

  it('declares no array that the base config already declares', () => {
    const { base, production } = blocks()
    const inBase = new Set(arrayKeys(base))
    const repeated = [...new Set(arrayKeys(production))]
      .filter((key) => inBase.has(key))
      .sort()

    // Concatenated, not replaced — see the note above.
    expect(repeated).toEqual([])
  })
})
