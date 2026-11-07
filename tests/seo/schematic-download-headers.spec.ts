import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * Static assets are served by Cloudflare without Nitro routeRules, so the
 * schematic downloads under public/community-poi/ get their headers from
 * public/_headers. Without X-Robots-Tag they were crawled as pages.
 *
 * Rules are per file: a splat would also reach the .webp images that the POI
 * pages embed, and octet-stream plus attachment would break those.
 */

const publicDir = join(repoRoot, 'public')
const headersFile = join(publicDir, '_headers')
const poiDir = join(publicDir, 'community-poi')
const SCHEMATIC = /\.(schem|litematic)$/

/** Every line that starts a rule (a path, not an indented header). */
function rulePaths(): string[] {
  return readFileSync(headersFile, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('/'))
}

/** Indented header lines of the rule for `path`, or [] if there is no such rule. */
function headersFor(path: string): string[] {
  const lines = readFileSync(headersFile, 'utf8').split('\n')
  const start = lines.findIndex((line) => line === path)
  if (start === -1) return []
  const block: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (!/^\s/.test(line)) break
    block.push(line.trim())
  }
  return block
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? filesUnder(full) : [full]
  })
}

describe('schematic download headers', () => {
  const schematics = filesUnder(poiDir)
    .filter((file) => SCHEMATIC.test(file))
    .map((file) => `/${relative(publicDir, file)}`)
    .sort()

  it('finds the schematic downloads to check', () => {
    expect(schematics.length).toBeGreaterThan(0)
  })

  it.each(schematics)('marks %s noindex in its own rule', (path) => {
    expect(headersFor(path), `no rule for ${path}`).toContain('X-Robots-Tag: noindex')
  })

  it('has no splat rule that would also match image files', () => {
    expect(rulePaths().filter((p) => p.includes('*'))).toEqual([])
  })
})
