import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `sizes` is a promise to the browser about how wide the image will be drawn.
 * Get it wrong upward and every candidate width is inflated: @nuxt/image
 * multiplies each entry by the device pixel ratio, so a card claiming 1920px
 * ends up offering a 3840px source for a slot a few hundred pixels wide.
 *
 * Measured before the change, on the real blog overview with the Cloudflare
 * provider active:
 *
 *   widths offered   300 500 600 700 1000 1200 1400 1920 2400 3840
 *   card width       ~373px at 1440px viewport
 *   loading="lazy"   0 of 9 images
 *
 * The promise and the layout live in different files, which is how they drift.
 * So this reads the grid out of the overview page and requires the card's
 * `sizes` to describe it: one column, then two, then three — expressed as
 * viewport fractions, which stay true at every width instead of only at the
 * one someone measured.
 */

const CARD = 'components/features/blog/page/card/ArticleCard.vue'
const OVERVIEW = 'pages/blog/index.vue'

/** `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` → { xs: 1, sm: 2, md: 3 } */
const GRID_COLUMNS = /(?:(xs|sm|md|lg|xl):)?grid-cols-(\d+)/g
/** `xs:100vw sm:50vw md:33vw` → [['xs', 100], ['sm', 50], ['md', 33]] */
const SIZE_ENTRY = /(xs|sm|md|lg|xl|2xl):(\d+)(vw|px)/g

function read(file: string): string {
  return readFileSync(`${repoRoot}/${file}`, 'utf8')
}

function gridColumns(): Record<string, number> {
  const columns: Record<string, number> = {}
  for (const [, breakpoint,
count] of read(OVERVIEW).matchAll(GRID_COLUMNS)) {
    columns[breakpoint ?? 'xs'] = Number(count)
  }
  return columns
}

function cardSizes(): Array<{ breakpoint: string, value: number, unit: string }> {
  const attribute = /sizes="([^"]+)"/.exec(read(CARD))
  if (!attribute) return []
  return [...attribute[1]!.matchAll(SIZE_ENTRY)]
    .map(([, breakpoint,
value,
unit]) => ({ breakpoint: breakpoint!, value: Number(value), unit: unit! }))
}

describe('article card image', () => {
  it('reads the grid and the sizes attribute', () => {
    // Without this, an empty grid and empty sizes would agree on everything.
    expect(gridColumns()).toEqual({ xs: 1, sm: 2, md: 3 })
    expect(cardSizes().length).toBeGreaterThan(2)
  })

  it('promises a width the grid actually gives it', () => {
    const columns = gridColumns()
    const mismatched = cardSizes()
      .filter((size) => columns[size.breakpoint] !== undefined)
      .filter((size) => {
        // A fixed pixel width cannot track a fluid column.
        if (size.unit !== 'vw') return true
        const expected = Math.round(100 / columns[size.breakpoint]!)
        // Gutters and container padding make the column slightly narrower, so
        // rounding down is fine; over-promising is what this is about.
        return size.value > expected + 1 || size.value < expected - 8
      })
      .map((size) => `${size.breakpoint}:${size.value}${size.unit} for ${columns[size.breakpoint]} columns`)

    expect(mismatched).toEqual([])
  })

  it('does not offer a source wider than any column can be', () => {
    // The widest container in this layout is 1536px (2xl); a third of it is
    // ~460px. Anything above 640 describes a card that cannot exist.
    const oversized = cardSizes().filter((size) => size.unit === 'px' && size.value > 640)
    expect(oversized).toEqual([])
  })

  it('leaves the hero to load first', () => {
    // The overview's LCP is Top1's header image. The cards below it are the
    // eight that can wait — none of them was deferred.
    expect(read(CARD)).toMatch(/loading="lazy"/)
  })
})
