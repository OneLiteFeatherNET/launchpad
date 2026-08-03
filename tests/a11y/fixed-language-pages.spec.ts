import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * A page that renders literal prose and never calls `t()` serves the same
 * language whatever the route prefix says. `pages/privacy.vue` is the case:
 * 236 literal text nodes, zero `t()` calls, all of it German — and under
 * `strategy: 'prefix'` it is served at `/en/privacy` too, where the layout
 * sets `<html lang="en-US">`.
 *
 * Measured before the change:
 *
 *   /en/privacy   <html lang="en-US">   <h1>Datenschutzerklärung</h1>
 *   /en/imprint   <html lang="en-US">   <h1>Imprint</h1>          ← translated, fine
 *
 * A screen reader takes the document language at its word and reads several
 * thousand words of German legal text with an English pronunciation engine.
 * That is WCAG 3.1.2, and it is the whole of what this fixes.
 *
 * Declaring the language is **not** the same as deciding to translate the
 * text. Whether the privacy policy should exist in English is a legal-content
 * question (`SEC-05`, `PR-03`) and is untouched here — a `lang` attribute
 * states a fact about the bytes already being served.
 */

const PAGE_DIRS = ['pages']

/** Literal text between tags, long enough not to be punctuation or a symbol. */
const TEXT_NODE = />([^<>{}]*\p{L}[^<>{}]{11,})</gu
/** A translation call anywhere in the template. */
const TRANSLATION = /\{\{[^}]*\bt\(|:[\w-]+="[^"]*\bt\(/g
const LANG_ATTRIBUTE = /\blang="[a-z]{2}(-[A-Z]{2})?"/

/** Pages whose template is prose in one fixed language. */
function fixedLanguagePages(): Array<{ file: string, nodes: number, declaresLang: boolean }> {
  const found: Array<{ file: string, nodes: number, declaresLang: boolean }> = []
  for (const file of collectSourceFiles(PAGE_DIRS, ['.vue'])) {
    const source = readFileSync(file, 'utf8')
    const template = /<template>([\s\S]*)<\/template>/.exec(source)?.[1]
    if (!template) continue

    const nodes = [...template.matchAll(TEXT_NODE)].length
    TRANSLATION.lastIndex = 0
    const translated = [...template.matchAll(TRANSLATION)].length
    // A handful of literal nodes is normal even on a translated page.
    if (nodes < 20 || translated > 0) continue

    found.push({ file: relativeToRepo(file), nodes, declaresLang: LANG_ATTRIBUTE.test(template) })
  }
  return found
}

describe('pages with fixed-language prose', () => {
  it('recognises prose and translation calls', () => {
    // Without this the rule could pass by classifying nothing.
    const pages = fixedLanguagePages()
    expect(pages.map((p) => p.file)).toContain('pages/privacy.vue')
    expect(pages.find((p) => p.file === 'pages/privacy.vue')!.nodes).toBeGreaterThan(100)

    // A translated page must not be classified as fixed-language.
    expect(pages.map((p) => p.file)).not.toContain('pages/imprint.vue')

    expect(LANG_ATTRIBUTE.test('<div lang="de" class="x">')).toBe(true)
    expect(LANG_ATTRIBUTE.test('<div class="x">')).toBe(false)
    TRANSLATION.lastIndex = 0
    expect([...'<h1>{{ t(\'a.b\') }}</h1>'.matchAll(TRANSLATION)]).toHaveLength(1)
  })

  it('declare which language they are in', () => {
    const undeclared = fixedLanguagePages()
      .filter((page) => !page.declaresLang)
      .map((page) => `${page.file} (${page.nodes} literal text nodes, no t())`)
    expect(undeclared).toEqual([])
  })
})
