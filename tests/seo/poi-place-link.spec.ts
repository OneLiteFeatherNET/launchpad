import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The POI page emits a CreativeWork (the build) and, when it has coordinates,
 * a Place (where it stands). Nothing tied them together, so the Place was an
 * orphan node. The CreativeWork now points at it through contentLocation, and
 * only when that Place is actually emitted.
 */
const PAGE_FILE = 'pages/community-poi/[...slug].vue'

const source = readFileSync(join(repoRoot, PAGE_FILE), 'utf8')

describe('community POI structured data', () => {
  it('defines the Place node under the id it links to', () => {
    expect(source).toContain("'@type': 'Place'")
    expect(source).toMatch(/const placeId = `\$\{detailUrl\}#place`/)
    expect(source).toMatch(/'@type': 'Place',\s*'@id': placeId/)
  })

  it('links the CreativeWork to that Place only when coordinates exist', () => {
    expect(source).toMatch(/contentLocation: coords \? \{ '@id': placeId \} : undefined/)
  })
})
