import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * An iframe without `sandbox` runs the embedded document with every capability
 * the browser offers. The one that matters here is top-level navigation: the
 * embedded page can replace the hosting tab, so a compromised or
 * misconfigured embed becomes a redirect off the site. `sandbox` also
 * withholds modals, downloads and pointer lock, none of which a map needs.
 *
 * The BlueMap embed is third-party by origin (bluemap.onelitefeather.dev) and
 * its URL comes from runtime config, so the page hosting it cannot assume the
 * content stays what it is today.
 *
 * `allow-scripts allow-same-origin` together do let a same-origin frame remove
 * its own sandbox — worth knowing, and not a problem here: the embed is
 * cross-origin, and both flags are required for a WebGL map that keeps state
 * in its own storage. What the attribute still withholds is the list above.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

const IFRAME = /<iframe\b[^>]*>/gs

function iframes(): { file: string, line: number, element: string }[] {
  const found: { file: string, line: number, element: string }[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue'])) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(IFRAME)) {
      found.push({
        file: relativeToRepo(file),
        line: text.slice(0, match.index).split('\n').length,
        element: match[0],
      })
    }
  }
  return found
}

describe('embedded frames', () => {
  it('finds iframes to check', () => {
    expect(iframes().length).toBeGreaterThan(0)
  })

  it('all carry a sandbox attribute', () => {
    const missing = iframes()
      .filter((frame) => !/\bsandbox=/.test(frame.element))
      .map((frame) => `${frame.file}:${frame.line}`)
    expect(missing).toEqual([])
  })

  it('none grant top-level navigation', () => {
    // The capability that turns an embed into a redirect off the site.
    const granted = iframes()
      .filter((frame) => /allow-top-navigation/.test(frame.element))
      .map((frame) => `${frame.file}:${frame.line}`)
    expect(granted).toEqual([])
  })

  it('all set a referrer policy', () => {
    // Without one the embedded origin receives the full hosting URL.
    const missing = iframes()
      .filter((frame) => !/\breferrerpolicy=/.test(frame.element))
      .map((frame) => `${frame.file}:${frame.line}`)
    expect(missing).toEqual([])
  })
})
