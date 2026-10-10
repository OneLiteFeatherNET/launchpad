import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The `posthog` block in nuxt.config.ts is passed to nuxt-posthog, which
 * forwards `clientOptions` to posthog.init. Read as text, as the other config
 * specs do, so the test needs no Nuxt boot.
 */
function posthogBlock(): string {
  const source = readFileSync(`${repoRoot}/nuxt.config.ts`, 'utf8')
  const start = source.indexOf('    posthog: {')
  const end = source.indexOf('    content: {', start)
  expect(start, 'posthog block not found').toBeGreaterThan(0)
  expect(end, 'block end not found').toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('posthog client options', () => {
  it('turns surveys off, because no survey is used in the app', () => {
    expect(posthogBlock()).toMatch(/disable_surveys:\s*true/)
  })

  it('turns dead-click autocapture off, because nothing consumes its events', () => {
    expect(posthogBlock()).toMatch(/capture_dead_clicks:\s*false/)
  })

  it('does not start session recording at init, so the recorder loads after idle time', () => {
    expect(posthogBlock()).toMatch(/disable_session_recording:\s*true/)
  })

  it('keeps pageview capture on', () => {
    const block = posthogBlock()
    expect(block).not.toMatch(/capturePageViews:\s*false/)
    expect(block).not.toMatch(/capture_pageview:\s*false/)
  })
})
