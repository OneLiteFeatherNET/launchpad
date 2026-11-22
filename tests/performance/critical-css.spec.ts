import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/** Bytes a render-blocking entry stylesheet may still weigh; it was 113,717. */
const BLOCKING_CSS_BUDGET = 4096

// Read as text, like edge-cache-rules.spec.ts: importing the config would pull
// in every module it references.
const config = readFileSync(join(repoRoot, 'nuxt.config.ts'), 'utf8')

describe('nuxt.config.ts', () => {
  it('inlines the stylesheets of the rendered page instead of linking them', () => {
    expect(config).toMatch(/features:\s*\{[^}]*inlineStyles:\s*true/)
  })
})

// Reads the production build when one exists. Never builds: CI runs
// `pnpm build` before the tests, and a local run without it skips this.
const assets = join(repoRoot, '.output/public/_nuxt')

describe.skipIf(!existsSync(assets))('production build', () => {
  it(`ships no entry stylesheet above ${BLOCKING_CSS_BUDGET} bytes for the browser to wait on`, () => {
    const entryStylesheets = readdirSync(assets).filter((name) => /^entry\..+\.css$/.test(name))
    for (const name of entryStylesheets) {
      expect(statSync(join(assets, name)).size, name).toBeLessThanOrEqual(BLOCKING_CSS_BUDGET)
    }
  })
})
