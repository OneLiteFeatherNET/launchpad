import { describe, expect, it } from 'vitest'
import {
  eventPhaseAt,
  isAccessOpenAt,
  isEventListedAt,
  isEventReachableAt,
  isEventVisibleAt,
  isPromotedAt
} from '../../shared/utils/eventPhase'

const schedule = {
  announceAt: '2026-09-20T12:00:00+02:00',
  startsAt: '2026-10-01T18:00:00+02:00',
  endsAt: '2026-10-14T23:59:00+02:00',
}

const at = (iso: string) => new Date(iso)

describe('eventPhaseAt', () => {
  it.each([
    ['before the announcement',
'2026-09-20T11:59:59+02:00',
'hidden'],
    ['exactly at announceAt',
'2026-09-20T12:00:00+02:00',
'announced'],
    ['between announcement and start',
'2026-09-25T10:00:00+02:00',
'announced'],
    ['exactly at startsAt',
'2026-10-01T18:00:00+02:00',
'running'],
    ['during the run',
'2026-10-05T10:00:00+02:00',
'running'],
    ['exactly at endsAt',
'2026-10-14T23:59:00+02:00',
'past'],
    ['after the end',
'2027-01-01T00:00:00+01:00',
'past'],
  ])('%s', (_name, now, phase) => {
    expect(eventPhaseAt(schedule, at(now))).toBe(phase)
  })

  it('compares instants, not wall clocks', () => {
    // 16:00 UTC is 18:00 in Berlin summer time: the event has started.
    expect(eventPhaseAt(schedule, at('2026-10-01T16:00:00Z'))).toBe('running')
    expect(eventPhaseAt(schedule, at('2026-10-01T15:59:59Z'))).toBe('announced')
  })

  it('stays hidden until the start without announceAt', () => {
    const unannounced = { startsAt: schedule.startsAt, endsAt: schedule.endsAt }
    expect(eventPhaseAt(unannounced, at('2026-09-30T10:00:00+02:00'))).toBe('hidden')
    expect(eventPhaseAt(unannounced, at(schedule.startsAt))).toBe('running')
  })

  it('runs indefinitely without endsAt', () => {
    const open = { startsAt: schedule.startsAt }
    expect(eventPhaseAt(open, at('2030-01-01T00:00:00Z'))).toBe('running')
  })

  it('keeps an unreadable schedule hidden', () => {
    expect(eventPhaseAt({ startsAt: 'next friday' }, at('2030-01-01T00:00:00Z'))).toBe('hidden')
  })

  it('accepts epoch milliseconds', () => {
    expect(eventPhaseAt(schedule, Date.parse('2026-10-05T10:00:00+02:00'))).toBe('running')
    expect(isEventVisibleAt(schedule, Date.parse('2026-09-01T00:00:00Z'))).toBe(false)
  })
})

describe('isPromotedAt', () => {
  it('defaults to the run of the event', () => {
    expect(isPromotedAt(schedule, undefined, at('2026-09-25T10:00:00+02:00'))).toBe(false)
    expect(isPromotedAt(schedule, undefined, at(schedule.startsAt))).toBe(true)
    expect(isPromotedAt(schedule, undefined, at(schedule.endsAt))).toBe(false)
  })

  it('never promotes with promote: false', () => {
    expect(isPromotedAt(schedule, false, at('2026-10-05T10:00:00+02:00'))).toBe(false)
  })

  it('starts early with only `from` overridden, ending with the event', () => {
    const promote = { from: '2026-09-25T12:00:00+02:00' }
    expect(isPromotedAt(schedule, promote, at('2026-09-25T11:59:00+02:00'))).toBe(false)
    expect(isPromotedAt(schedule, promote, at('2026-09-25T12:00:00+02:00'))).toBe(true)
    expect(isPromotedAt(schedule, promote, at('2026-10-14T23:58:00+02:00'))).toBe(true)
    expect(isPromotedAt(schedule, promote, at(schedule.endsAt))).toBe(false)
  })

  it('stops early with only `until` overridden, starting with the event', () => {
    const promote = { until: '2026-10-04T23:59:00+02:00' }
    expect(isPromotedAt(schedule, promote, at(schedule.startsAt))).toBe(true)
    expect(isPromotedAt(schedule, promote, at('2026-10-05T00:00:00+02:00'))).toBe(false)
  })

  it('does not promote an event that is still hidden', () => {
    const promote = { from: '2026-09-01T00:00:00+02:00' }
    expect(isPromotedAt(schedule, promote, at('2026-09-10T00:00:00+02:00'))).toBe(false)
  })
})

describe('isEventListedAt and isEventReachableAt', () => {
  const moments: [phase: string, now: string][] = [
    ['hidden', '2026-09-20T11:59:59+02:00'],
    ['announced', '2026-09-25T10:00:00+02:00'],
    ['running', '2026-10-05T10:00:00+02:00'],
    ['past', '2027-01-01T00:00:00+01:00'],
  ]
  const unlistedValues: (boolean | undefined)[] = [true,
false,
undefined]

  it.each(moments.flatMap(([phase, now]) => unlistedValues.map((unlisted) => [phase,
now,
unlisted] as const)))('phase %s, unlisted=%s', (phase, now, unlisted) => {
    const listed = phase !== 'hidden' && !unlisted
    const reachable = Boolean(unlisted) || phase !== 'hidden'
    expect(isEventListedAt(schedule, unlisted, at(now))).toBe(listed)
    expect(isEventReachableAt(schedule, unlisted, at(now))).toBe(reachable)
  })

  it('a listed event is always reachable, but not vice versa', () => {
    // Running and public: both true.
    expect(isEventListedAt(schedule, false, at('2026-10-05T10:00:00+02:00'))).toBe(true)
    expect(isEventReachableAt(schedule, false, at('2026-10-05T10:00:00+02:00'))).toBe(true)
    // Hidden and unlisted: reachable by link, never listed.
    expect(isEventListedAt(schedule, true, at('2026-09-20T11:59:59+02:00'))).toBe(false)
    expect(isEventReachableAt(schedule, true, at('2026-09-20T11:59:59+02:00'))).toBe(true)
  })
})

describe('isAccessOpenAt', () => {
  const window = { opens: '2026-09-20T12:00:00+02:00', closes: '2026-09-28T23:59:00+02:00' }

  it('is open without a window', () => {
    expect(isAccessOpenAt(undefined, at('2030-01-01T00:00:00Z'))).toBe(true)
    expect(isAccessOpenAt({}, at('2030-01-01T00:00:00Z'))).toBe(true)
  })

  it('respects both ends, closing exactly at `closes`', () => {
    expect(isAccessOpenAt(window, at('2026-09-20T11:59:00+02:00'))).toBe(false)
    expect(isAccessOpenAt(window, at(window.opens))).toBe(true)
    expect(isAccessOpenAt(window, at(window.closes))).toBe(false)
  })

  it('accepts either end alone', () => {
    expect(isAccessOpenAt({ closes: window.closes }, at('2026-01-01T00:00:00Z'))).toBe(true)
    expect(isAccessOpenAt({ opens: window.opens }, at('2030-01-01T00:00:00Z'))).toBe(true)
  })
})
