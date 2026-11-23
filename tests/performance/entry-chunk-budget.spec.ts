import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/** The entry chunk was 477 KB with posthog-js inside it and is 136 KB without. */
const ENTRY_CHUNK_BUDGET_BYTES = 160_000

// Reads the production build when one exists. Never builds: CI runs
// `pnpm build` before the tests, and a local run without it skips this.
const precomputed = join(repoRoot, '.output/server/chunks/virtual/precomputed.mjs')

interface Precomputed {
  entrypoints: string[]
  modules: Record<string, { file: string }>
}

describe.skipIf(!existsSync(precomputed))('production build', () => {
  it(`keeps the entry chunk under ${ENTRY_CHUNK_BUDGET_BYTES} bytes`, async () => {
    const built = (await import(pathToFileURL(precomputed).href)).default as Precomputed
    const file = built.modules[built.entrypoints[0]!]!.file
    const size = statSync(join(repoRoot, '.output/public/_nuxt', file)).size
    expect(size, `size of ${file}`).toBeLessThanOrEqual(ENTRY_CHUNK_BUDGET_BYTES)
  })
})
