import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const dir = join(__dirname, '../../layers/home/components')
const items = readdirSync(dir).filter((f) => /^CarouselItem.+\.vue$/.test(f))
const SIZES_LITERAL = /sizes="sm:/

describe('carousel image sizes', () => {
  it('matches a hand-written sizes literal', () => {
    expect(SIZES_LITERAL.test('      sizes="sm:100vw md:100vw lg:1280px"')).toBe(true)
  })

  it('finds the six carousel items', () => {
    expect(items).toHaveLength(6)
  })

  for (const file of items) {
    it(`${file} takes its sizes from CAROUSEL_IMAGE_SIZES`, () => {
      const src = readFileSync(join(dir, file), 'utf8')
      expect(src).toContain(':sizes="CAROUSEL_IMAGE_SIZES"')
      expect(SIZES_LITERAL.test(src.replace(/sizes="sm:320px md:384px"/, ''))).toBe(false)
    })
  }

  it('Carousel.vue no longer hand-writes a preload', () => {
    const src = readFileSync(join(dir, 'Carousel.vue'), 'utf8')
    expect(src).not.toContain("rel: 'preload'")
  })
})
