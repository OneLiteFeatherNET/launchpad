import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The carousel schema in content.config.ts described `{ title, image }`.
 * Every slide in the content files is one of a discriminated union keyed on
 * `type` — `{ type: 'image', src, alt, note }` or `{ type: 'blog', title,
 * href, … }`. Not a single slide matched.
 *
 * @nuxt/content v3 does not validate against the schema; it uses it to derive
 * columns. `slides` is an array, so it lands in one JSON column whatever its
 * contents, and the mismatch never surfaced at runtime — only in the generated
 * type, which claimed `{ title, image }[]`. useHomeContent papered over that
 * with `as HomeCarouselSlide[]`, and the cast is the only reason the code
 * compiles.
 *
 * So the schema has to describe reality. This test compares it against the
 * actual content files, which is the thing that would have caught it.
 */

const LOCALES = ['de', 'en']

interface Slide {
  type?: string
  [key: string]: unknown
}

function slidesFrom(locale: string): Slide[] {
  const file = join(repoRoot, `content/carousel/${locale}/home.json`)
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as { slides?: Slide[] }
  return parsed.slides ?? []
}

/** Field names the schema declares for each slide variant. */
function schemaVariants(): Map<string, Set<string>> {
  const text = readFileSync(join(repoRoot, 'content.config.ts'), 'utf8')
  const block = /const carouselSchema = z\.object\(\{([\s\S]*?)\n\}\)/.exec(text)?.[1]
  if (block === undefined) throw new Error('carouselSchema not found')
  const variants = new Map<string, Set<string>>()
  // Each variant is a z.object({...}) carrying a z.literal('<type>').
  for (const match of block.matchAll(/z\.object\(\{([\s\S]*?)\}\)/g)) {
    const body = match[1] ?? ''
    const type = /z\.literal\('([a-z]+)'\)/.exec(body)?.[1]
    if (type === undefined) continue
    const fields = [...body.matchAll(/^\s*(\w+):/gm)]
      .map((field) => field[1])
      .filter((name): name is string => name !== undefined)
    variants.set(type, new Set(fields))
  }
  return variants
}

describe('carousel content', () => {
  it('every slide declares a type', () => {
    // The union is keyed on `type`; a slide without one cannot be validated
    // or rendered by the matching component.
    for (const locale of LOCALES) {
      const untyped = slidesFrom(locale).filter((slide) => slide.type === undefined)
      expect(untyped, `${locale} has slides without a type`).toEqual([])
    }
  })

  it('finds slides to check', () => {
    expect(LOCALES.flatMap(slidesFrom).length).toBeGreaterThan(3)
  })
})

describe('carousel schema', () => {
  const variants = schemaVariants()

  it('describes the slide variants as a discriminated union', () => {
    // A single flat object cannot describe both an image slide and a blog
    // slide, which is how the original `{ title, image }` shape went wrong.
    expect(variants.size).toBeGreaterThan(1)
  })

  it('covers every type present in the content', () => {
    const used = new Set(LOCALES.flatMap(slidesFrom).map((slide) => slide.type))
    const uncovered = [...used].filter((type) => type !== undefined && !variants.has(type)).sort()
    expect(uncovered).toEqual([])
  })

  it('declares every field the content actually uses', () => {
    const missing: string[] = []
    for (const locale of LOCALES) {
      for (const slide of slidesFrom(locale)) {
        const declared = variants.get(slide.type ?? '')
        if (declared === undefined) continue
        for (const field of Object.keys(slide)) {
          if (!declared.has(field)) missing.push(`${locale} ${slide.type}.${field}`)
        }
      }
    }
    expect([...new Set(missing)].sort()).toEqual([])
  })
})
