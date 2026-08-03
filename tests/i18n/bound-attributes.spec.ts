import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'
import { getSlideAriaText } from '../../composables/useCarousel'

/**
 * The bound form of a text attribute is an expression, so a string literal
 * inside it looks like code and reads like content. `:aria-label="'Next
 * slide'"` is exactly as untranslated as `aria-label="Next slide"`, but it
 * survives a search for the static form.
 *
 * Accessible names are where this hurts most. Nothing on screen shows them, so
 * the page can look fully translated while a screen reader announces control
 * names in the wrong language — which is what the carousel did in both
 * directions at once: English chrome ("Previous slide", "Slide 1 of 5") and
 * German link names ("Zum Artikel: …") shipped together, so neither locale was
 * ever right.
 *
 * Not covered: prop defaults. `withDefaults(…, { ariaLabel: 'Image Carousel' })`
 * is user-visible text and no attribute rule reaches it.
 */

const SOURCE_DIRS = ['components',
  'pages',
  'layouts']

/** The bound form: `:aria-label="…"`, `:title="…"`. */
const BOUND_TEXT_ATTRIBUTE = /(?<![\w.@-]):(aria-label|title)="([^"]*)"/g

/**
 * Text left in an expression once every `t(…)` call is removed. Interpolated
 * `${…}` holes are stripped too — those carry data, not wording.
 */
function untranslatedText(expression: string): string[] {
  const withoutTranslations = expression.replace(/\bt\(\s*[^)]*\)/g, '')
  const remaining: string[] = []
  for (const literal of withoutTranslations.matchAll(/'([^']*)'|`([^`]*)`/g)) {
    const body = (literal[1] ?? literal[2] ?? '').replace(/\$\{[^}]*\}/g, '')
    if (/[A-Za-z]/.test(body)) remaining.push(body.trim())
  }
  return remaining
}

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue'])) {
    const relative = relativeToRepo(file)
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      BOUND_TEXT_ATTRIBUTE.lastIndex = 0
      for (const [, attribute,
expression] of line.matchAll(BOUND_TEXT_ATTRIBUTE)) {
        for (const raw of untranslatedText(expression!)) {
          found.push(`${relative}:${index + 1} — :${attribute} carries "${raw}"`)
        }
      }
    })
  }
  return found
}

describe('bound text attributes', () => {
  it('separates wording from data and from t() calls', () => {
    // Without this the check could pass by matching nothing at all.
    expect(untranslatedText("'Previous slide'")).toEqual(['Previous slide'])
    expect(untranslatedText('`Zum Artikel: ${item.title}`')).toEqual(['Zum Artikel:'])
    // Interpolation alone is data, not wording.
    expect(untranslatedText('`${item.title}`')).toEqual([])
    // Already translated, including a ternary over two calls.
    expect(untranslatedText("t('carousel.prev')")).toEqual([])
    expect(untranslatedText("copied ? t('article.copied') : t('article.copy_link')")).toEqual([])
    // A plain reference carries no wording of its own.
    expect(untranslatedText('rawValue')).toEqual([])

    const line = '<button :aria-label="\'Next slide\'" :title="t(\'x.y\')">'
    BOUND_TEXT_ATTRIBUTE.lastIndex = 0
    expect([...line.matchAll(BOUND_TEXT_ATTRIBUTE)].map(([, a]) => a)).toEqual(['aria-label', 'title'])
  })

  it('no bound title or aria-label carries untranslated wording', () => {
    expect(offenders()).toEqual([])
  })
})

describe('carousel slide announcements', () => {
  it('delegates its wording to the translator instead of formatting English', () => {
    const calls: Array<[string, Record<string, unknown> | undefined]> = []
    const t = (key: string, named?: Record<string, unknown>) => {
      calls.push([key, named])
      return `«${key}»`
    }

    const text = getSlideAriaText({ type: 'image', src: '/a.png', alt: 'Sonnenaufgang' }, 0, 5, t)

    // The live region reads this out on every rotation, so the position
    // wording has to come from the locale, not from a template literal.
    expect(calls).toEqual([['carousel.slide_position', { index: 1, total: 5, label: 'Sonnenaufgang' }]])
    expect(text).toBe('«carousel.slide_position»')
  })
})
