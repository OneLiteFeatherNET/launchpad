import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SEASONS } from '../../layers/season/utils/seasons'
import { repoRoot } from '../helpers/sources'

/**
 * A season's logo and favicon replace the year-round ones for everyone who
 * visits during it, so they may not cost more than those do: at most the size
 * of their base asset, and SVG so they stay sharp at every size.
 */

const publicFile = (path: string) => join(repoRoot, 'public', path.replace(/^\//, ''))

const ASSETS = SEASONS.flatMap((season) => [
  [`${season.id} logo`,
season.logo,
'images/logo.svg'],
[`${season.id} favicon`,
season.favicon,
'favicon.svg'],
] as const)

describe.each(ASSETS)('%s', (_name, path, base) => {
  it('exists as an SVG document', () => {
    expect(existsSync(publicFile(path))).toBe(true)
    expect(readFileSync(publicFile(path), 'utf8')).toMatch(/^<svg[\s>][\s\S]*<\/svg>\s*$/)
  })

  it('is no larger than the year-round asset it replaces', () => {
    expect(statSync(publicFile(path)).size).toBeLessThanOrEqual(statSync(publicFile(base)).size)
  })
})
