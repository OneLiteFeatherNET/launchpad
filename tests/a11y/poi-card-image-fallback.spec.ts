import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The card already draws a placeholder when a POI has no thumbnail at all —
 * `v-if="poi.thumbnail"` / `v-else`. What it had no answer for is a thumbnail
 * that is *declared* and fails to load: the browser then shows its broken-image
 * glyph with the alt text spilled across the card, which reads as a rendering
 * fault rather than a missing picture.
 *
 * That is not hypothetical. `/community-poi/labyrinth/cover.webp` is declared,
 * exists in `public/`, and 404s on the image origin the Cloudflare provider
 * fetches from — see `tests/content/image-paths.spec.ts` for the measurements.
 *
 * So the same placeholder now covers both cases: nothing declared, and
 * something declared that did not arrive. The `@error` handler is what turns
 * the second into the first.
 *
 * Note this hides a broken reference behind a tidy placeholder, which is why
 * it ships alongside a check that fails on the reference itself. A fallback
 * without that check would make the next broken path invisible.
 */

const CARD = 'components/features/community-poi/CommunityPoiCard.vue'

function card(): string {
  return readFileSync(`${repoRoot}/${CARD}`, 'utf8')
}

describe('POI card image fallback', () => {
  it('tracks whether the thumbnail failed', () => {
    const source = card()
    expect(source).toMatch(/const thumbnailFailed = ref\(false\)/)
    // The picture element has to report the failure.
    expect(source).toMatch(/@error[^"]*="[^"]*thumbnailFailed/)
  })

  it('shows the placeholder for a failure, not just for an absent thumbnail', () => {
    const source = card()
    // The condition that decides between picture and placeholder must consider
    // both — a declared-but-broken thumbnail is a missing picture too.
    expect(source).toMatch(/v-if="poi\.thumbnail && !thumbnailFailed"/)
    expect(source).toMatch(/<div v-else/)
  })

  it('resets when the POI changes', () => {
    // Cards are reused across list renders; a stale failure flag would blank
    // the picture of the next POI shown in that slot.
    const source = card()
    expect(source).toMatch(/watch\(\s*\(\) => props\.poi\.thumbnail/)
  })
})
