import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * What every page ships before it can paint. Each budget is the measured size
 * of the production build plus at most 10 %, so growth fails here instead of
 * showing up as a slower First Contentful Paint.
 *
 * - Entry chunk: 477 KB with posthog-js inside it, 136 KB without, 104 KB once
 *   the Font Awesome runtime went (icons are plain `<svg>` now).
 * - Preloaded scripts: the entry chunk plus every chunk it `modulepreload`s on
 *   each page, 493 KB before and 394 KB after dropping Font Awesome.
 * - Inline CSS: the global stylesheet that `features.inlineStyles` writes into
 *   every HTML response; 114 KB before and 84 KB after dropping the Font
 *   Awesome stylesheet and keeping tests and docs out of Tailwind's scan.
 */
const ENTRY_CHUNK_BUDGET_BYTES = 115_000
const PRELOADED_SCRIPTS_BUDGET_BYTES = 434_000
const INLINE_CSS_BUDGET_BYTES = 92_000

// Reads the production build when one exists. Never builds: CI runs
// `pnpm build` before the tests, and a local run without it skips this.
const virtualDir = join(repoRoot, '.output/server/chunks/virtual')
const precomputed = join(virtualDir, 'precomputed.mjs')
const styles = join(virtualDir, 'styles.mjs')

interface Precomputed {
  entrypoints: string[]
  modules: Record<string, { file: string }>
  dependencies: Record<string, { preload: Record<string, { file: string }> }>
}

const loadBuild = async () => (await import(pathToFileURL(precomputed).href)).default as Precomputed
const publicSize = (file: string) => statSync(join(repoRoot, '.output/public/_nuxt', file)).size

describe.skipIf(!existsSync(precomputed))('production build', () => {
  it(`keeps the entry chunk under ${ENTRY_CHUNK_BUDGET_BYTES} bytes`, async () => {
    const built = await loadBuild()
    const file = built.modules[built.entrypoints[0]!]!.file
    expect(publicSize(file), `size of ${file}`).toBeLessThanOrEqual(ENTRY_CHUNK_BUDGET_BYTES)
  })

  it(`keeps the preloaded scripts under ${PRELOADED_SCRIPTS_BUDGET_BYTES} bytes together`, async () => {
    const built = await loadBuild()
    const preload = built.dependencies[built.entrypoints[0]!]!.preload
    const files = Object.values(preload).map((entry) => entry.file)
    const total = files.reduce((sum, file) => sum + publicSize(file), 0)
    expect(total, `${files.length} preloaded scripts`).toBeLessThanOrEqual(PRELOADED_SCRIPTS_BUDGET_BYTES)
  })

  it(`keeps the inline css under ${INLINE_CSS_BUDGET_BYTES} bytes`, async () => {
    const built = await loadBuild()
    const loaders = (await import(pathToFileURL(styles).href)).default as
      Record<string, () => Promise<string[]>>
    const css = await loaders[built.entrypoints[0]!]!()
    const total = css.reduce((sum, sheet) => sum + Buffer.byteLength(sheet), 0)
    expect(total, `${css.length} stylesheets`).toBeLessThanOrEqual(INLINE_CSS_BUDGET_BYTES)
  })
})
