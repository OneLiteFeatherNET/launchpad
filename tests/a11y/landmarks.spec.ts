import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * `layouts/default.vue` wraps the page slot in `<main id="main-content">`, and
 * it is the only layout in the repository. A page that opens its own `<main>`
 * therefore nests one inside the other — not a risk, a certainty.
 *
 * Measured on the running server before the change:
 *
 *   /de/team              <main> × 2
 *   /de/team/themeinerlp  <main> × 2
 *   /de/community-poi     <main> × 2
 *   /de/community-poi/…   <main> × 2
 *   /de/blog              <main> × 1   ← the correct shape
 *
 * HTML permits exactly one non-hidden `main` per document. Two means a
 * landmark rotor lists two "main" regions with nothing to tell them apart, and
 * the skip link — which targets `#main-content`, the outer one — drops the
 * user above a landmark boundary rather than at the content.
 *
 * The rule is one-way: pages must not open a `main`, because the layout
 * already did. Nothing here stops a second layout from being added with a
 * second `main`; the first assertion at least fails loudly if the one layout
 * this assumes ever stops providing one.
 */

const PAGE_DIRS = ['pages']
const OPENS_MAIN = /<main[\s>]/

function pagesOpeningMain(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(PAGE_DIRS, ['.vue'])) {
    const relative = relativeToRepo(file)
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      if (OPENS_MAIN.test(line)) found.push(`${relative}:${index + 1}`)
    })
  }
  return found
}

describe('main landmark', () => {
  it('is provided exactly once by the layout', () => {
    // The rule below only holds because of this. If the layout stops opening a
    // main, removing it from pages would leave the document without one.
    const layout = readFileSync(`${repoRoot}/layouts/default.vue`, 'utf8')
    expect(layout.match(/<main[\s>]/g)).toHaveLength(1)
    expect(layout).toContain('id="main-content"')

    // Without this the page check could pass by matching nothing at all.
    expect(OPENS_MAIN.test('  <main class="mx-auto max-w-6xl">')).toBe(true)
    expect(OPENS_MAIN.test('  <main>')).toBe(true)
    expect(OPENS_MAIN.test('  </main>')).toBe(false)
    // A component whose name merely starts the same way is not the element.
    expect(OPENS_MAIN.test('  <MainContent />')).toBe(false)
  })

  it('is not opened a second time by a page', () => {
    expect(pagesOpeningMain()).toEqual([])
  })
})
