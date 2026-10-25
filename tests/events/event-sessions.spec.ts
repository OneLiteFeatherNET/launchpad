import { describe, expect, it } from 'vitest'
import { countdownParts, nextSessionAt } from '../../layers/events/utils/eventSessions'

const iso = (value: string) => new Date(value).toISOString()
const slot = (startsAt: string, endsAt: string) => ({
  startsAt: iso(startsAt),
  endsAt: iso(endsAt)
})

const single = { first: '2026-10-31T21:00:00+01:00', durationMinutes: 180 }
const weekly = { ...single, repeat: 'weekly' as const }

describe('nextSessionAt without repeat', () => {
  it('returns the session before it starts', () => {
    expect(nextSessionAt(single, undefined, new Date('2026-10-25T12:00:00+01:00')))
      .toEqual(slot('2026-10-31T21:00:00+01:00', '2026-11-01T00:00:00+01:00'))
  })

  it('treats the session as running at exactly its start', () => {
    expect(nextSessionAt(single, undefined, new Date('2026-10-31T21:00:00+01:00')))
      .toEqual(slot('2026-10-31T21:00:00+01:00', '2026-11-01T00:00:00+01:00'))
  })

  it('returns the running session in the middle of it', () => {
    expect(nextSessionAt(single, undefined, new Date('2026-10-31T23:30:00+01:00')))
      .toEqual(slot('2026-10-31T21:00:00+01:00', '2026-11-01T00:00:00+01:00'))
  })

  it('treats the session as over at exactly its end', () => {
    expect(nextSessionAt(single, undefined, new Date('2026-11-01T00:00:00+01:00'))).toBeNull()
  })

  it('has no next session after the only one', () => {
    expect(nextSessionAt(single, undefined, new Date('2026-11-05T12:00:00+01:00'))).toBeNull()
  })

  it('has no session when the start is unparsable', () => {
    expect(nextSessionAt({ ...single, first: 'not a date' }, undefined, new Date('2026-10-25T12:00:00+01:00'))).toBeNull()
  })
})

describe('nextSessionAt with weekly repeat', () => {
  it('returns the first session before it starts', () => {
    expect(nextSessionAt(weekly, undefined, new Date('2026-10-25T12:00:00+01:00')))
      .toEqual(slot('2026-10-31T21:00:00+01:00', '2026-11-01T00:00:00+01:00'))
  })

  it('moves to the following week once a session is over', () => {
    expect(nextSessionAt(weekly, undefined, new Date('2026-11-01T12:00:00+01:00')))
      .toEqual(slot('2026-11-07T21:00:00+01:00', '2026-11-08T00:00:00+01:00'))
  })

  it('moves to the following week at exactly the end of a session', () => {
    expect(nextSessionAt(weekly, undefined, new Date('2026-11-01T00:00:00+01:00')))
      .toEqual(slot('2026-11-07T21:00:00+01:00', '2026-11-08T00:00:00+01:00'))
  })

  it('keeps the wall-clock hour across the change to summer time', () => {
    expect(nextSessionAt(weekly, undefined, new Date('2027-03-29T12:00:00+02:00'))?.startsAt)
      .toBe('2027-04-03T19:00:00.000Z')
  })

  it('keeps the wall-clock hour on the last session before summer time', () => {
    expect(nextSessionAt(weekly, undefined, new Date('2027-03-22T12:00:00+01:00'))?.startsAt)
      .toBe('2027-03-27T20:00:00.000Z')
  })

  it('finds the session many weeks after the first', () => {
    expect(nextSessionAt(weekly, undefined, new Date('2027-06-15T12:00:00+02:00')))
      .toEqual(slot('2027-06-19T21:00:00+02:00', '2027-06-20T00:00:00+02:00'))
  })

  it('returns the last session before the limit', () => {
    expect(nextSessionAt(weekly, '2026-12-31T23:59:00+01:00', new Date('2026-12-20T12:00:00+01:00'))?.startsAt)
      .toBe(iso('2026-12-26T21:00:00+01:00'))
  })

  it('has no session after the last one before the limit', () => {
    expect(nextSessionAt(weekly, '2026-12-31T23:59:00+01:00', new Date('2026-12-27T12:00:00+01:00'))).toBeNull()
  })

  it('has no session that starts exactly at the limit', () => {
    expect(nextSessionAt(weekly, '2026-11-07T21:00:00+01:00', new Date('2026-11-01T12:00:00+01:00'))).toBeNull()
  })

  it('has no first session when it starts at the limit', () => {
    expect(nextSessionAt(single, '2026-10-31T21:00:00+01:00', new Date('2026-10-25T12:00:00+01:00'))).toBeNull()
  })

  it('ignores an unparsable limit', () => {
    expect(nextSessionAt(weekly, 'soon', new Date('2026-11-01T12:00:00+01:00'))?.startsAt)
      .toBe(iso('2026-11-07T21:00:00+01:00'))
  })
})

describe('countdownParts', () => {
  const minutes = (value: number) => value * 60_000

  it('splits a span into days, hours and minutes', () => {
    expect(countdownParts(minutes(26 * 60 + 30))).toEqual({ days: 1, hours: 2, minutes: 30 })
  })

  it('rounds a fraction of a minute up so the countdown never shows zero before the start', () => {
    expect(countdownParts(59_000)).toEqual({ days: 0, hours: 0, minutes: 1 })
  })

  it('is zero at zero', () => {
    expect(countdownParts(0)).toEqual({ days: 0, hours: 0, minutes: 0 })
  })

  it('is zero for a negative span', () => {
    expect(countdownParts(-5000)).toEqual({ days: 0, hours: 0, minutes: 0 })
  })
})
