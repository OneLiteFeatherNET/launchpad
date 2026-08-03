import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * One handler function, several event types. `click` delivers a MouseEvent,
 * `touchstart` a TouchEvent — so a handler bound to both can only be typed to
 * what they share, which is `Event`.
 *
 * Annotating it as the mouse variant compiles today as long as the body only
 * touches `e.target`, which both events have. It stops being true the moment
 * someone reaches for `e.button`, `e.clientX` or `e.ctrlKey`: TypeScript
 * accepts all three, and on the touch path each one is `undefined` at runtime.
 * The compiler has been told a fact about mobile that isn't so.
 *
 * The `as any` clause is the same defect wearing a different hat — it is what
 * a mistyped handler needs in order to pass the registration call, so a cast
 * inside `addEventListener`/`removeEventListener` marks the spot rather than
 * fixing it. Worse for removal specifically: the cast changes the identity
 * TypeScript reasons about, and an un-removed document listener outlives the
 * component that registered it.
 */

const SOURCE_DIRS = ['components', 'pages', 'layouts', 'composables']

const REGISTRATION = /(?:add|remove)EventListener\(\s*['"]([a-z]+)['"]\s*,\s*([A-Za-z_$][\w$]*)/g
/** A cast anywhere inside a listener call — on the handler or on the options. */
const CAST_IN_CALL = /(?:add|remove)EventListener\([^;]*?\bas any\b/g

/** The parameter type a handler declares, or null if it declares none. */
function parameterType(text: string, name: string): string | null {
  const arrow = new RegExp(`\\b(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s+)?\\(\\s*\\w+\\s*:\\s*(\\w+)`)
  const fn = new RegExp(`\\bfunction\\s+${name}\\s*\\(\\s*\\w+\\s*:\\s*(\\w+)`)
  return (arrow.exec(text)?.[1] ?? fn.exec(text)?.[1]) ?? null
}

/** Handlers bound to more than one event type while typed to one of them. */
function overNarrowHandlers(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    const events = new Map<string, Set<string>>()
    for (const [, event, handler] of text.matchAll(REGISTRATION)) {
      if (!events.has(handler!)) events.set(handler!, new Set())
      events.get(handler!)!.add(event!)
    }
    for (const [handler, types] of events) {
      if (types.size < 2) continue
      const declared = parameterType(text, handler)
      if (declared === null || declared === 'Event') continue
      found.push(`${relativeToRepo(file)} — ${handler}(${declared}) on ${[...types].sort().join(', ')}`)
    }
  }
  return found
}

function castsInListenerCalls(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(SOURCE_DIRS, ['.vue', '.ts'])) {
    const text = readFileSync(file, 'utf8')
    text.split('\n').forEach((line, index) => {
      CAST_IN_CALL.lastIndex = 0
      if (CAST_IN_CALL.test(line)) found.push(`${relativeToRepo(file)}:${index + 1}`)
    })
  }
  return found
}

describe('event handler parameter types', () => {
  it('reads registrations and declarations', () => {
    // Without this the checks below could pass by matching nothing at all.
    const sample = [
      'const onDocumentClick = (e: MouseEvent) => {}',
      "document.addEventListener('click', onDocumentClick)",
      "document.addEventListener('touchstart', onDocumentClick, { passive: true as any })",
    ].join('\n')

    const pairs = [...sample.matchAll(REGISTRATION)].map(([, event, handler]) => `${event}:${handler}`)
    expect(pairs).toEqual(['click:onDocumentClick', 'touchstart:onDocumentClick'])
    expect(parameterType(sample, 'onDocumentClick')).toBe('MouseEvent')
    expect(parameterType('function onKey(e: KeyboardEvent) {}', 'onKey')).toBe('KeyboardEvent')
    expect(parameterType('const onAny = (e: Event) => {}', 'onAny')).toBe('Event')

    // The cast sits in the options object here, not on the handler.
    CAST_IN_CALL.lastIndex = 0
    expect(CAST_IN_CALL.test("document.addEventListener('touchstart', fn, { passive: true as any })")).toBe(true)
    CAST_IN_CALL.lastIndex = 0
    expect(CAST_IN_CALL.test("document.removeEventListener('touchstart', fn)")).toBe(false)
  })

  it('handlers shared across event types are typed to Event', () => {
    expect(overNarrowHandlers()).toEqual([])
  })

  it('no listener call needs an any-cast to compile', () => {
    expect(castsInListenerCalls()).toEqual([])
  })
})
