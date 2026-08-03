import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * WCAG 2.5.3 "Label in Name" (Level A): when a control has visible text, its
 * accessible name must contain that text. Speech-input users say what they
 * read — "click copy address" — and the tool matches the spoken words against
 * the accessible name. If the visible label is not in there, the control
 * cannot be operated by voice at all.
 *
 * The failure is invisible in review because both strings look fine on their
 * own. The server address card said "Adresse kopieren" on the button and
 * "Serveradresse {address} in die Zwischenablage kopieren" in aria-label: the
 * same words, rearranged, which does not satisfy the criterion. The success
 * criterion wants the visible label as a contiguous substring.
 *
 * These pairs are declared rather than discovered: matching a `label-key` prop
 * to an `aria-label` expression across component boundaries needs a real
 * parser, and a wrong guess here would either pass silently or block unrelated
 * work. Add a pair when you add a control that carries both.
 */

/** [visible label key, accessible name key] — both must exist in each locale. */
const LABEL_PAIRS: [string, string][] = [
  ['server.connect.copy_address', 'server.connect.copy_aria'], ['server.connect.copy_port', 'server.connect.copy_port_aria'],
]

const LOCALES = [
  'de', 'en',
]

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(repoRoot, `i18n/locales/${locale}.json`), 'utf8'))
}

function lookup(tree: Record<string, unknown>, dotted: string): string | undefined {
  let node: unknown = tree
  for (const segment of dotted.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[segment]
  }
  return typeof node === 'string' ? node : undefined
}

/** Interpolation placeholders stand in for runtime values; drop them. */
function withoutPlaceholders(message: string): string {
  return message.replace(/\{\w+\}/g, ' ').replace(/\s+/g, ' ').trim()
}

describe('WCAG 2.5.3 label in name', () => {
  it('has pairs to check', () => {
    expect(LABEL_PAIRS.length).toBeGreaterThan(0)
  })

  for (const locale of LOCALES) {
    describe(locale, () => {
      const tree = messages(locale)

      for (const [visibleKey, ariaKey] of LABEL_PAIRS) {
        it(`${visibleKey} appears in ${ariaKey}`, () => {
          const visible = lookup(tree, visibleKey)
          const accessible = lookup(tree, ariaKey)
          expect(visible, `${visibleKey} missing in ${locale}`).toBeDefined()
          expect(accessible, `${ariaKey} missing in ${locale}`).toBeDefined()

          // Case-insensitive: assistive tech matches without regard to case,
          // and the criterion is about the words, not their capitalisation.
          const haystack = withoutPlaceholders(accessible as string).toLowerCase()
          const needle = withoutPlaceholders(visible as string).toLowerCase()
          expect(haystack).toContain(needle)
        })
      }
    })
  }
})
