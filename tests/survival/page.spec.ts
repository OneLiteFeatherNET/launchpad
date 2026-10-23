import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')
const RULE_COUNT = 8

describe('survival rules page', () => {
  const page = read('pages/survival-rules.vue')

  it('has exactly one h1', () => {
    expect(page.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('serves a German and an English slug through defineI18nRoute', () => {
    expect(page).toContain("de: '/survival-regeln'")
    expect(page).toContain("en: '/survival-rules'")
    expect(page).toContain('defineI18nRoute(')
  })

  it('titles itself and its description from the locale files', () => {
    expect(page).toMatch(/usePageSeo\(\{\s*title: t\('survival\.title'\)/)
    expect(page).toContain("description: t('survival.description')")
  })

  it('renders every numbered rule', () => {
    for (let n = 1; n <= RULE_COUNT; n++) {
      expect(page, `survival.rule_${n}`).toContain(`'survival.rule_${n}'`)
    }
  })

  it('reads no query, cookie or header', () => {
    expect(page).not.toMatch(/route\.query|useCookie|useRequestHeaders/)
  })

  it('renders no raw HTML', () => {
    expect(page).not.toMatch(/v-html/)
  })
})

describe('survival locale keys', () => {
  const keysOf = (locale: string) => JSON.parse(read(join('i18n/locales', `${locale}.json`))).survival as Record<string, string>

  for (const locale of ['de', 'en']) {
    it(`has every survival message in ${locale}`, () => {
      const survival = keysOf(locale)
      const required = [
        'title',
        'description',
        'heading',
        'intro',
        'closing',
        'questions',
        ...Array.from({ length: RULE_COUNT }, (_, i) => `rule_${i + 1}`),
      ]
      for (const key of required) {
        expect(survival[key], `survival.${key} in ${locale}`).toBeTruthy()
      }
    })
  }

  it('keeps the Discord placeholder in the questions line in both locales', () => {
    expect(keysOf('de').questions).toContain('{discord}')
    expect(keysOf('en').questions).toContain('{discord}')
  })
})
