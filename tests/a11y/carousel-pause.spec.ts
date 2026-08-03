import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * WCAG 2.2.2 (Pause, Stop, Hide — Level A): content that moves or auto-updates
 * for more than five seconds must offer a way to pause it. The carousel
 * auto-advances every 5000 ms and shipped only prev/next and dots.
 *
 * It did pause on `mouseenter` and `focusin`, and neither counts. Hovering is
 * not available on touch, and focus-pause requires already being in the
 * component — a user who cannot chase moving targets has no way to stop it
 * before reaching it. `prefers-reduced-motion` suppresses autoplay entirely
 * but only helps those who set it.
 *
 * Two placement rules follow from the same reasoning, and both are checked:
 *
 *  - The control cannot live in the `opacity-0 group-hover:opacity-100` bar
 *    with prev/next. A pause button that only appears on hover is unreachable
 *    on exactly the devices that need it most.
 *  - It needs a translated accessible name, like every other control here.
 */

const CAROUSEL = 'components/features/home/carousel/Carousel.vue'

function carousel(): string {
  return readFileSync(`${repoRoot}/${CAROUSEL}`, 'utf8')
}

/** The prev/next bar, which is revealed on hover. */
function hoverRevealedControls(): string {
  const source = carousel()
  const start = source.indexOf('group-hover:opacity-100')
  const open = source.lastIndexOf('<div', start)
  return source.slice(open, source.indexOf('</div>', start))
}

describe('carousel pause control', () => {
  it('exists and drives the interval', () => {
    const source = carousel()
    // A state the user controls, distinct from the hover pause.
    expect(source).toMatch(/const userPaused = ref\(false\)/)
    // The interval has to honour it, not just the hover flag.
    expect(source).toMatch(/setInterval\([\s\S]{0,160}!userPaused\.value/)
  })

  it('is reachable without hovering', () => {
    // The finding's sharpest point: a pause button inside the hover-revealed
    // bar is invisible on touch, which is the case it exists for.
    expect(hoverRevealedControls()).not.toContain('userPaused')
    // `@click.stop="…"` — the modifier and the quote sit between the two.
    expect(carousel()).toMatch(/@click[.\w]*="[^"]*userPaused/)
  })

  it('says what it does, in the language of the page', () => {
    const source = carousel()
    // A toggle names its next action, so the binding is a ternary over both
    // keys rather than a single call.
    expect(source).toMatch(/:aria-label="[^"]*t\('carousel\.pause'\)/)
    expect(source).toMatch(/:aria-label="[^"]*t\('carousel\.play'\)/)
    // A toggle should report its state, not just its action.
    expect(source).toMatch(/:aria-pressed=/)
  })

  it('is only offered when autoplay can actually run', () => {
    // No control for a carousel that never moves.
    expect(carousel()).toMatch(/v-if="canAutoPlay"/)
    expect(carousel()).toMatch(/const canAutoPlay = computed/)
  })
})
