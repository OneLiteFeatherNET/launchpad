import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * A sticky header covers whatever the browser scrolls to, unless
 * `scroll-padding-top` reserves room for it. Two things land underneath it:
 *
 *   - anchor targets. The privacy page alone has 13 in-page links; following
 *     one puts the heading behind the header, so the reader starts mid-section
 *     with no idea they are in the right place.
 *   - the focus ring when tabbing backwards. The browser scrolls the focused
 *     element just into view, which is exactly where the header sits — the
 *     element has focus and cannot be seen.
 *
 * The second is the accessibility failure: keyboard users lose track of focus
 * entirely, and there is no visual cue that anything is wrong.
 */

const TOKENS = join(repoRoot, 'assets/css/tokens.css')
const NAVBAR = join(repoRoot, 'components/features/navigation/NavigationBar.vue')

function tokens(): string {
  return readFileSync(TOKENS, 'utf8')
}

/** The Tailwind height class on the sticky header's inner row, in rem. */
function headerHeightRem(): number {
  const markup = readFileSync(NAVBAR, 'utf8')
  const match = /class="[^"]*\bh-(\d+)\b[^"]*"/.exec(markup)
  const steps = match?.[1]
  if (steps === undefined) throw new Error('no h-<n> class found on the navigation bar')
  // Tailwind's spacing scale is 0.25rem per step: h-16 is 4rem.
  return Number(steps) * 0.25
}

describe('sticky header and scrolling', () => {
  it('reads the header height from the markup', () => {
    // Pinned so the assertion below compares against the real header rather
    // than a number copied into this file once and forgotten.
    expect(headerHeightRem()).toBeGreaterThan(0)
  })

  it('reserves room for the header when scrolling to an anchor', () => {
    const declared = /scroll-padding-top:\s*([\d.]+)rem/.exec(tokens())?.[1]
    expect(declared, 'scroll-padding-top is not set on html').toBeDefined()
    expect(Number(declared)).toBeGreaterThanOrEqual(headerHeightRem())
  })

  it('still applies when smooth scrolling is disabled', () => {
    // scroll-padding is independent of scroll-behavior: the offset matters for
    // instant jumps too, including the reduced-motion path.
    const css = tokens()
    const paddingRule = /scroll-padding-top/.exec(css)?.index ?? -1
    const reducedMotionBlock = /@media\s*\(prefers-reduced-motion/.exec(css)?.index ?? Infinity
    expect(paddingRule).toBeGreaterThan(-1)
    expect(paddingRule).toBeLessThan(reducedMotionBlock)
  })
})
