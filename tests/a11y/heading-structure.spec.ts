import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Every page needs exactly one level-1 heading. Screen-reader users navigate
 * by heading, and the h1 is what tells them which page they landed on; without
 * one, the first thing announced is a section of unknown context. It is also
 * what "skip to heading" and reading-mode features anchor to.
 *
 * Three pages had none: the home page, the blog index and the imprint. All
 * three open straight into content — a carousel, a card grid, an address block.
 *
 * Two spellings count, and checking only the literal one produces false
 * alarms: components/base/typography/SectionHeading.vue renders through
 * `<component :is>`, so a section titled with `<SectionHeading :level="1">`
 * emits an h1 that no grep for `<h1` will find. That is exactly how the
 * ServerConcept section was misread as starting at h3 when it in fact renders
 * an h2 via that component.
 */

const LITERAL_H1 = /<h1[\s>]/
const COMPONENT_H1 = /<SectionHeading[^>]*:level="1"/

function hasH1(text: string): boolean {
  return LITERAL_H1.test(text) || COMPONENT_H1.test(text)
}

describe('page headings', () => {
  const pages = collectSourceFiles(['pages'], ['.vue'])

  it('finds pages to check', () => {
    expect(pages.length).toBeGreaterThan(5)
  })

  it('recognises both ways of emitting an h1', () => {
    // Without this, a change to SectionHeading's API would turn every page
    // using it into a false positive — and the natural "fix" for a false
    // positive is a second h1, which is its own violation.
    expect(hasH1('<h1 class="x">Title</h1>')).toBe(true)
    expect(hasH1('<SectionHeading :level="1" :id="x">Title</SectionHeading>')).toBe(true)
    expect(hasH1('<SectionHeading :level="2" :id="x">Title</SectionHeading>')).toBe(false)
    expect(hasH1('<h2>Not a top-level heading</h2>')).toBe(false)
  })

  it('every page declares a level-1 heading', () => {
    const missing = pages
      .filter((file) => !hasH1(readFileSync(file, 'utf8')))
      .map(relativeToRepo)
    expect(missing).toEqual([])
  })

  it('no page declares more than one', () => {
    // Two h1s are as ambiguous as none: the document outline gains a second
    // root and assistive tech cannot tell which names the page.
    const duplicates = pages
      .map((file) => ({
        file: relativeToRepo(file),
        count: (readFileSync(file, 'utf8').match(/<h1[\s>]/g) ?? []).length,
      }))
      .filter((entry) => entry.count > 1)
      .map((entry) => `${entry.file} (${entry.count})`)
    expect(duplicates).toEqual([])
  })
})
