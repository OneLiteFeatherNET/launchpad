import { describe, expect, it } from 'vitest'
import type { Season } from '../../layers/season/types'
import { HALLOWEEN, previewSeason, resolveSeason } from '../../layers/season/utils/seasons'

/**
 * The season is decided once, on the server, from the current date — the
 * `data-season` attribute, the colour overrides, logo and decoration all hang
 * off that one decision, so the resolution rule is the part worth testing.
 *
 * Two traps drive most cases. Time zone: a Cloudflare Worker runs in UTC, and
 * reading its month and day would open and close the window an hour or two
 * off. Year-end windows: Halloween does not wrap, a Christmas season would,
 * and getting that wrong stays invisible until December.
 */

const WRAPPING: Season = {
  id: 'test-wrap',
  start: { month: 12, day: 20 },
  end: { month: 1, day: 6 },
  decor: false,
  themeColor: { light: '#ffffff', dark: '#000000' },
  logo: 'images/logo.svg',
  favicon: '/favicon.svg',
}

const at = (iso: string) => resolveSeason({ date: new Date(iso) })?.id ?? null

describe('resolveSeason — calendar', () => {
  it('runs Halloween from 20 October to 2 November', () => {
    expect(HALLOWEEN.start).toEqual({ month: 10, day: 20 })
    expect(HALLOWEEN.end).toEqual({ month: 11, day: 2 })
  })

  it('is active inside the window', () => {
    expect(at('2026-10-25T10:00:00Z')).toBe('halloween')
  })

  it('is inactive outside every window', () => {
    expect(at('2026-07-15T12:00:00Z')).toBeNull()
  })

  it('reads the day in Berlin: 19 October 22:30 UTC is 20 October 00:30', () => {
    expect(at('2026-10-19T22:30:00Z')).toBe('halloween')
    expect(at('2026-10-19T21:30:00Z')).toBeNull()
  })

  it('keeps the whole last day and closes right after it', () => {
    // 2 November 23:00 and 3 November 00:30 Berlin time (UTC+1 by then).
    expect(at('2026-11-02T22:00:00Z')).toBe('halloween')
    expect(at('2026-11-02T23:30:00Z')).toBeNull()
  })

  it('handles a window that wraps the year end', () => {
    const seasons = [WRAPPING]
    const wrap = (iso: string) => resolveSeason({ date: new Date(iso), seasons })?.id ?? null
    expect(wrap('2027-01-02T12:00:00Z')).toBe('test-wrap')
    expect(wrap('2026-12-24T12:00:00Z')).toBe('test-wrap')
    expect(wrap('2026-12-19T12:00:00Z')).toBeNull()
    expect(wrap('2027-01-07T12:00:00Z')).toBeNull()
  })
})

describe('resolveSeason — overrides', () => {
  const september = new Date('2026-09-01T12:00:00Z')
  const october = new Date('2026-10-25T12:00:00Z')

  it('previews a season out of its window', () => {
    expect(resolveSeason({ date: september, overrides: ['halloween'] })?.id).toBe('halloween')
  })

  it('switches the season off with `none`', () => {
    expect(resolveSeason({ date: october, overrides: [undefined, 'none'] })).toBeNull()
  })

  it('lets the query win over the environment', () => {
    expect(resolveSeason({ date: october, overrides: ['halloween', 'none'] })?.id).toBe('halloween')
    expect(resolveSeason({ date: september, overrides: ['none', 'halloween'] })).toBeNull()
  })

  it('ignores a typo instead of undressing the site', () => {
    expect(resolveSeason({ date: october, overrides: ['halloweeen'] })?.id).toBe('halloween')
  })

  it('falls through an unknown query to the environment', () => {
    expect(resolveSeason({ date: october, overrides: ['halloweeen', 'none'] })).toBeNull()
  })

  it('treats empty values as absent', () => {
    expect(resolveSeason({
 date: september, overrides: ['',
null,
'']
})).toBeNull()
  })
})

describe('previewSeason — the ?season= preview, applied in the browser', () => {
  it('asks for the named season', () => {
    expect(previewSeason('?season=halloween')?.id).toBe('halloween')
  })

  it('asks for no season with `none`', () => {
    expect(previewSeason('?season=none')).toBeNull()
  })

  it('takes the first value of a repeated parameter', () => {
    expect(previewSeason('?season=halloween&season=none')?.id).toBe('halloween')
  })

  it('leaves the server\'s decision alone without a parameter or on a typo', () => {
    expect(previewSeason('')).toBeUndefined()
    expect(previewSeason('?utm_source=x')).toBeUndefined()
    expect(previewSeason('?season=halloweeen')).toBeUndefined()
  })
})
