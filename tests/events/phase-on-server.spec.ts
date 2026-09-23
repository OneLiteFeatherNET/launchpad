import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Design decision D4 of `add-events-section`: an event's phase is decided
 * once, inside a `useAsyncData` handler, and reaches the browser through the
 * payload. Anything that asks the clock outside such a handler — a component,
 * a page, a `computed` in a composable — would decide again during hydration
 * and could render a different section than the server did.
 *
 * This holds the events code to that: clock reads and the phase functions
 * from shared/utils may only appear inside the argument list of a
 * `useAsyncData(...)` call.
 */

const CLOCK_OR_PHASE = new RegExp([
  String.raw`\bnew Date\(\s*\)`,
  String.raw`\bDate\.now\(\)`,
  ...[
    'eventPhaseAt',
    'isPromotedAt',
    'isAccessOpenAt',
    'isEventVisibleAt',
    'groupEventsAt',
    'promotedEventsAt',
  ].map((name) => String.raw`\b${name}\(`),
].join('|'), 'g')

/** `text` with the full argument list of every `useAsyncData(` call blanked out. */
export function outsideAsyncData(text: string): string {
  let result = ''
  let index = 0
  const opener = /\buseAsyncData(?:<[^>]*>)?\(/g
  let match: RegExpExecArray | null
  while ((match = opener.exec(text))) {
    result += text.slice(index, match.index)
    let depth = 1
    let cursor = match.index + match[0].length
    while (cursor < text.length && depth > 0) {
      const char = text[cursor]
      if (char === '(') depth++
      else if (char === ')') depth--
      cursor++
    }
    index = cursor
    opener.lastIndex = cursor
  }
  return result + text.slice(index)
}

function offenders(): string[] {
  const files = [
    ...collectSourceFiles(['layers/events/composables',
'layers/events/components',
'pages/events'], ['.ts', '.vue']),
  ]
  return files.flatMap((file) => {
    const rest = outsideAsyncData(readFileSync(file, 'utf8'))
    return [...rest.matchAll(CLOCK_OR_PHASE)].map((hit) => `${relativeToRepo(file)}: ${hit[0]}`)
  })
}

describe('event phases are decided on the server', () => {
  it('blanks exactly the useAsyncData arguments', () => {
    const text = "a(); useAsyncData<X>('k', async () => new Date(f(1))); b(new Date())"
    expect(outsideAsyncData(text)).toBe('a(); ; b(new Date())')
  })

  it('reads the clock nowhere else in the events code', () => {
    expect(collectSourceFiles(['layers/events/composables'], ['.ts']).length).toBeGreaterThan(0)
    expect(offenders()).toEqual([])
  })
})
