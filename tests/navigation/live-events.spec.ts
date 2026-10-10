import { describe, expect, it } from 'vitest'
import { hasLiveListedEventAt } from '../../shared/utils/eventPhase'

const NOW = new Date('2026-10-07T12:00:00Z')

const event = (startsAt: string, extra: { announceAt?: string, endsAt?: string, unlisted?: boolean } = {}) => ({
  unlisted: extra.unlisted,
  event: { startsAt, announceAt: extra.announceAt, endsAt: extra.endsAt }
})

describe('hasLiveListedEventAt', () => {
  it('is false without events', () => {
    expect(hasLiveListedEventAt([], NOW)).toBe(false)
  })

  it('counts a running event', () => {
    expect(hasLiveListedEventAt([event('2026-10-01T10:00:00Z', { endsAt: '2026-10-10T10:00:00Z' })], NOW)).toBe(true)
  })

  it('counts an announced event', () => {
    expect(hasLiveListedEventAt([event('2026-11-01T10:00:00Z', { announceAt: '2026-10-01T00:00:00Z' })], NOW)).toBe(true)
  })

  it('does not count a hidden event, which is not announced yet', () => {
    expect(hasLiveListedEventAt([event('2026-11-01T10:00:00Z', { announceAt: '2026-10-20T00:00:00Z' })], NOW)).toBe(false)
    expect(hasLiveListedEventAt([event('2026-11-01T10:00:00Z')], NOW)).toBe(false)
  })

  it('does not count a past event', () => {
    expect(hasLiveListedEventAt([event('2026-09-01T10:00:00Z', { endsAt: '2026-09-02T10:00:00Z' })], NOW)).toBe(false)
  })

  it('does not count an unlisted event', () => {
    expect(hasLiveListedEventAt([event('2026-10-01T10:00:00Z', { unlisted: true })], NOW)).toBe(false)
  })

  it('is true as soon as one of several events counts', () => {
    const events = [
      event('2026-09-01T10:00:00Z', { endsAt: '2026-09-02T10:00:00Z' }),
      event('2026-10-01T10:00:00Z', { unlisted: true }),
      event('2026-10-05T10:00:00Z')
    ]
    expect(hasLiveListedEventAt(events, NOW)).toBe(true)
  })

  it('changes its answer when the moment passes the end of the last event', () => {
    const events = [event('2026-10-01T10:00:00Z', { endsAt: '2026-10-08T00:00:00Z' })]
    expect(hasLiveListedEventAt(events, NOW)).toBe(true)
    expect(hasLiveListedEventAt(events, new Date('2026-10-08T00:00:00Z'))).toBe(false)
  })
})
