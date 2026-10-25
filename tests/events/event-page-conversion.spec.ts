import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The event detail page must wire the join block's `address-copied` emit to
 * the conversion tracker, with the event and phase it already holds. A full
 * mount is out of reach here (see tests/seo/event-noindex.spec.ts), so this
 * reads the source instead.
 */
const PAGE_FILE = 'pages/events/[...slug].vue'

function pageSource(): string {
  return readFileSync(join(repoRoot, PAGE_FILE), 'utf8')
}

describe('event detail page server address conversion wiring', () => {
  it('binds the join block address-copied emit to trackServerAddressCopied', () => {
    expect(pageSource()).toContain('@address-copied="trackServerAddressCopied({ event, phase }, locale)"')
  })

  it('takes the tracker from useEventConversions', () => {
    expect(pageSource()).toMatch(/const \{ trackServerAddressCopied \} = useEventConversions\(\)/)
  })
})
