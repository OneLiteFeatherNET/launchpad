import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Asking the image pipeline to re-encode an SVG does nothing. Measured against
 * the live proxy:
 *
 *   /images/logo.svg                                     image/svg+xml, 27106 B
 *   /cdn-cgi/image/w=40,h=40,f=webp/images/logo.svg      image/svg+xml, 27047 B
 *
 * Cloudflare passes vector sources through untouched, so `format="webp"` adds
 * a parameter that changes nothing — and, more usefully, would be wrong if it
 * ever did work: rasterising a vector at 40px throws away the resolution
 * independence that is the reason to ship an SVG.
 *
 * The same goes for `quality`, which has no meaning for a vector.
 */

const SOURCE_DIRS = [
  'components',
  'pages',
  'layouts',
]

/** `<NuxtImg …>` and `<NuxtPicture …>` opening tags, attributes included. */
const IMAGE_COMPONENT = /<Nuxt(?:Img|Picture)\b[^>]*>/gs
const SVG_SOURCE = /src="[^"]*\.svg"/
const RASTER_ONLY_MODIFIER = /\b(?:format|quality)="/

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue'])) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(IMAGE_COMPONENT)) {
      const element = match[0]
      if (!SVG_SOURCE.test(element)) continue
      if (!RASTER_ONLY_MODIFIER.test(element)) continue
      const line = text.slice(0, match.index).split('\n').length
      found.push(`${relativeToRepo(file)}:${line}`)
    }
  }
  return found
}

describe('vector sources', () => {
  it('distinguishes vector from raster sources', () => {
    // Guards the matcher itself: a broken SVG_SOURCE would silently exempt
    // everything and this suite would pass on any tree.
    expect(SVG_SOURCE.test('<NuxtImg src="images/logo.svg" format="webp" />')).toBe(true)
    expect(SVG_SOURCE.test('<NuxtImg src="images/photo.png" format="webp" />')).toBe(false)
    expect(RASTER_ONLY_MODIFIER.test('format="webp"')).toBe(true)
    expect(RASTER_ONLY_MODIFIER.test('width="40" height="40"')).toBe(false)
  })

  it('carry no raster-only modifiers', () => {
    expect(offenders()).toEqual([])
  })
})
