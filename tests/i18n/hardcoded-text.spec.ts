import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/**
 * Words written straight into a template ("Mehr", "Details") skip `t()`, so
 * they stay in one language while the rest of the page switches locale.
 * hardcoded-attributes and bound-attributes cover `title`/`aria-label`; this
 * covers the visible text nodes.
 *
 * Only plain text between tags is checked. Mustache output (`{{ … }}`) is
 * stripped first, so anything routed through `t()` or data is ignored.
 */

const SOURCE_DIRS = ['components',
'pages',
'layouts',
'layers']
const ROOT_FILES = ['app.vue', 'error.vue']

/** Legal texts are German-only on purpose; their wording is not ours to key. */
const EXEMPT_FILES = new Set(['pages/privacy.vue', 'pages/imprint.vue'])

/** Proper names that are the same in every locale. */
const PROPER_NAMES = new Set(['OneLiteFeather',
'OneLiteFeather.net',
'BlueMap',
'Discord',
'OL',
'MC'])

function untranslatedTextNodes(template: string): string[] {
  const withoutMustache = template.replace(/\{\{[\s\S]*?\}\}/g, ' ')
  const found: string[] = []
  for (const [, raw] of withoutMustache.matchAll(/>([^<>]*)</g)) {
    const text = raw!.trim()
    if (!/[A-Za-zÄÖÜäöüß]{2,}/.test(text) || PROPER_NAMES.has(text)) continue
    found.push(text)
  }
  return found
}

function templateOf(source: string): string {
  const start = source.indexOf('<template')
  const end = source.lastIndexOf('</template>')
  return start === -1 || end === -1 ? '' : source.slice(source.indexOf('>', start) + 1, end)
}

describe('visible text in templates', () => {
  it('finds literal words and ignores mustache output and proper names', () => {
    expect(untranslatedTextNodes('<a>Mehr <i /></a>')).toEqual(['Mehr'])
    expect(untranslatedTextNodes('<h2>{{ t(\'events.details\') }}</h2>')).toEqual([])
    expect(untranslatedTextNodes('<span>BlueMap</span>')).toEqual([])
    expect(untranslatedTextNodes('<span>·</span>')).toEqual([])
  })

  it('no template carries untranslated visible text', () => {
    const files = [
      ...collectSourceFiles(SOURCE_DIRS, ['.vue']), ...ROOT_FILES.map((file) => join(repoRoot, file)),
    ]
    const found: string[] = []
    for (const file of files) {
      const relative = relativeToRepo(file)
      if (EXEMPT_FILES.has(relative)) continue
      for (const text of untranslatedTextNodes(templateOf(readFileSync(file, 'utf8')))) {
        found.push(`${relative} — "${text}"`)
      }
    }
    expect(found).toEqual([])
  })
})
