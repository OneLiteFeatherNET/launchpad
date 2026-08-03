import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The language switcher lists endonyms — "Deutsch", "English" — each written
 * in the language it names. On a German page, "English" is a passage of
 * English inside a `lang="de"` document, and vice versa.
 *
 * A screen reader picks its pronunciation rules from the nearest `lang`. With
 * none on these spans it applies the document's, so a German synthesiser reads
 * "English" as *Eng-lisch* and an English one reads "Deutsch" as *Doytsh*.
 * The one control on the page whose whole job is to be recognised by a speaker
 * of the other language is the one that gets mispronounced. That is WCAG 3.1.2,
 * Language of Parts.
 *
 * `hreflang` on the link is the same fact stated for the destination: it tells
 * assistive technology, and anything else reading the markup, what language
 * lies on the other side before following it.
 *
 * The locale `code` is used rather than `iso`. @nuxtjs/i18n v10 dropped `iso`
 * in favour of `language`, so the `iso: 'de-DE'` still written in nuxt.config
 * is not something to depend on here; `de` and `en` are valid BCP 47 tags on
 * their own.
 */

const SELECTOR = 'components/features/navigation/LanguageSelector.vue'

/** An element whose entire content is the locale endonym. */
const ENDONYM_ELEMENT = /<(\w+)([^>]*)>\{\{\s*loc\.name\s*\}\}<\/\1>/g
/** The locale-switching link, opening tag only. */
const LOCALE_LINK = /<SwitchLocalePathLink\b([^>]*)>/g

/**
 * The `<template>` block only.
 *
 * The script above it contains the line `// Navigation is handled by
 * <SwitchLocalePathLink>, which resolves the …` — prose that reads as markup
 * and was counted as a third, unmarked link on the first run. A comment
 * mentioning a component is not a use of it.
 */
function selector(): string {
  const source = readFileSync(`${repoRoot}/${SELECTOR}`, 'utf8')
  const template = /<template>([\s\S]*)<\/template>/.exec(source)
  if (!template) throw new Error(`no <template> block in ${SELECTOR}`)
  return template[1]!
}

describe('language of parts', () => {
  it('finds the elements it is meant to check', () => {
    // Without this, a renamed component would pass every rule below.
    const source = selector()
    expect([...source.matchAll(ENDONYM_ELEMENT)]).toHaveLength(2)
    expect([...source.matchAll(LOCALE_LINK)]).toHaveLength(2)

    // The regex must not match an element that merely contains other text.
    const other = '<span>{{ loc.code }}</span>'
    ENDONYM_ELEMENT.lastIndex = 0
    expect([...other.matchAll(ENDONYM_ELEMENT)]).toHaveLength(0)

    // And the script block is out of scope — see selector().
    expect(source).not.toContain('// Navigation is handled by')
  })

  it('marks each endonym with the language it is written in', () => {
    const unmarked = [...selector().matchAll(ENDONYM_ELEMENT)]
      .filter(([, , attributes]) => !/\blang="[^"]*loc\.code/.test(attributes!))
      .map(([match]) => match)
    expect(unmarked).toEqual([])
  })

  it('declares the language each locale link leads to', () => {
    const unmarked = [...selector().matchAll(LOCALE_LINK)]
      .filter(([, attributes]) => !/\bhreflang="[^"]*loc\.code/.test(attributes!))
      .map(([match]) => match.slice(0, 60))
    expect(unmarked).toEqual([])
  })
})
