import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * WAI-ARIA APG carousel: a named region with aria-roledescription "carousel",
 * slides as groups with roledescription "slide" and an "n of m" name. The slide
 * frame used to carry tabindex="0" with no role or name; the arrow keys are
 * handled on the section and reach it from every button, so the stop was
 * redundant and announced nothing.
 */
const source = readFileSync(`${repoRoot}/layers/home/components/Carousel.vue`, 'utf8')
const template = source.slice(source.indexOf('<template>'))
const section = /<section\b[^>]*>/.exec(template)?.[0] ?? ''

function messages(locale: string) {
  return JSON.parse(readFileSync(`${repoRoot}/i18n/locales/${locale}.json`, 'utf8')).carousel
}

describe('carousel semantics', () => {
  it('is a region (a named section) with the carousel role description', () => {
    // An explicit role="region" is flagged as redundant by the a11y lint.
    expect(section.startsWith('<section')).toBe(true)
    expect(section).toContain(':aria-label=')
    expect(section).toContain('aria-roledescription="carousel"')
  })

  it('takes its name from i18n', () => {
    expect(section).toContain(':aria-label="resolvedAriaLabel"')
    expect(source).toContain("t('carousel.label')")
  })

  it('renders each slide as a group named "n of m"', () => {
    const slide = /<div\b[^>]*role="group"[^>]*>/.exec(template)?.[0] ?? ''
    expect(slide).toContain('aria-roledescription="slide"')
    expect(slide).toContain(':aria-label="getSlideAriaText(s, i, slidesCount, t)"')
  })

  it('has no unnamed tab stop', () => {
    expect(template).not.toMatch(/tabindex="0"/)
  })

  it.each(['en', 'de'])('has the label strings in %s', (locale) => {
    const c = messages(locale)
    expect(c.label, 'carousel.label').toBeTruthy()
    expect(c.slide_position, 'carousel.slide_position').toMatch(/\{index\}.*\{total\}/)
  })
})
