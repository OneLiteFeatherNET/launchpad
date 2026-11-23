import { describe, expect, it } from 'vitest'
import { formatCalendarDate, formatInstant } from '../../layers/base/utils/formatDate'

// A publication date as @nuxt/content parses it: UTC midnight. Local-time
// formatting would show the 14th west of UTC.
const PUB_DATE = new Date('2026-01-15T00:00:00Z')

describe('formatCalendarDate', () => {
  it('shows the calendar day of a UTC-midnight date in English', () => {
    expect(formatCalendarDate(PUB_DATE, 'en')).toBe('1/15/2026')
  })

  it('shows the calendar day of a UTC-midnight date in German', () => {
    expect(formatCalendarDate(PUB_DATE, 'de')).toBe('15.1.2026')
  })

  it('accepts an ISO string like the date came from frontmatter', () => {
    expect(formatCalendarDate('2026-01-15T00:00:00.000Z', 'en')).toBe('1/15/2026')
  })

  it('applies intl options without losing the zone', () => {
    expect(formatCalendarDate(PUB_DATE, 'en', { year: 'numeric', month: 'short', day: '2-digit' })).toBe('Jan 15, 2026')
  })

  it('returns an empty string for an invalid or missing value', () => {
    expect(formatCalendarDate('not a date', 'en')).toBe('')
    expect(formatCalendarDate(undefined, 'en')).toBe('')
  })
})

describe('formatInstant', () => {
  it('formats a real instant in Europe/Berlin, not UTC', () => {
    // 23:30 UTC on the 14th is already the 15th in Berlin.
    expect(formatInstant('2026-01-14T23:30:00Z', 'en')).toBe('1/15/2026')
  })

  it('returns an empty string for an invalid value', () => {
    expect(formatInstant('nope', 'de')).toBe('')
  })
})
