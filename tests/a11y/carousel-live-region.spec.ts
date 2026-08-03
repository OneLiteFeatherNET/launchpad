import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The carousel had two live regions competing for the same event.
 *
 * The slide track carried `aria-live="polite"` and contains every slide —
 * headings, excerpts, dates, buttons. A sibling `<span class="sr-only"
 * aria-live="polite">` carried a purpose-built announcement. Both react to the
 * same slide change, and the track is not a summary of anything: what changes
 * inside it is `aria-hidden`, `inert` and a transform across a subtree holding
 * the full text of five slides.
 *
 * The second half is the one a listener actually notices. Autoplay advances
 * every 5000 ms, so the announcement fired unprompted, twelve times a minute,
 * over whatever the user was doing. The WAI-ARIA APG is explicit that a
 * carousel should announce slide changes the *user* asked for — rotation is
 * ambient, and ambient changes are what `aria-live` is meant not to be used
 * for.
 *
 * So: one region, and it stays silent while the carousel rotates on its own.
 */

const CAROUSEL = 'components/features/home/carousel/Carousel.vue'

function carousel(): string {
  return readFileSync(`${repoRoot}/${CAROUSEL}`, 'utf8')
}

describe('carousel live region', () => {
  it('has exactly one', () => {
    const regions = carousel().match(/aria-live=/g) ?? []
    expect(regions).toHaveLength(1)
  })

  it('is the dedicated sr-only one, not the slide track', () => {
    const source = carousel()
    expect(source).toMatch(/<span class="sr-only" aria-live="polite">/)

    // The track is the element carrying the sliding transform; it must not
    // also be announcing.
    const track = /<div\b[^>]*:style="trackStyle"[^>]*>/.exec(source)?.[0]
    expect(track).toBeDefined()
    expect(track).not.toContain('aria-live')
  })

  it('stays silent while autoplay is driving', () => {
    const source = carousel()

    // The interval must advance without claiming the user asked for it, and
    // the announcement must be conditioned on that distinction.
    expect(source).toMatch(/setInterval\([\s\S]{0,120}next\(false\)/)
    expect(source).toMatch(/const liveText = computed\(\(\) => \{[\s\S]*?userInitiated/)
  })
})
