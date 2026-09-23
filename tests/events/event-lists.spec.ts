import { describe, expect, it } from 'vitest'
import type { EventDocument } from '../../layers/events/types'
import { groupEventsAt, MAX_PROMOTED_EVENTS, promotedEventsAt } from '../../layers/events/utils/eventLists'

const now = new Date('2026-10-05T12:00:00+02:00')

function doc(slug: string, event: EventDocument['event'], extra: Partial<EventDocument> = {}): EventDocument {
  return { slug, title: slug, summary: `${slug} summary`, type: 'build', event, ...extra } as EventDocument
}

const hidden = doc('hidden', { startsAt: '2026-12-01T18:00:00+01:00' })
const soon = doc('soon', { announceAt: '2026-10-01T12:00:00+02:00', startsAt: '2026-11-01T18:00:00+01:00' })
const sooner = doc('sooner', { announceAt: '2026-10-01T12:00:00+02:00', startsAt: '2026-10-20T18:00:00+02:00' })
const runningLate = doc('running-late', { startsAt: '2026-10-03T18:00:00+02:00', endsAt: '2026-10-20T18:00:00+02:00' })
const runningEarly = doc('running-early', { startsAt: '2026-10-01T18:00:00+02:00' }, { access: { mode: 'application', url: 'https://x' } } as Partial<EventDocument>)
const pastOld = doc('past-old', { startsAt: '2026-08-01T18:00:00+02:00', endsAt: '2026-08-10T18:00:00+02:00' })
const pastRecent = doc('past-recent', { startsAt: '2026-09-01T18:00:00+02:00', endsAt: '2026-09-30T18:00:00+02:00' })

describe('groupEventsAt', () => {
  const grouped = groupEventsAt([hidden,
soon,
pastOld,
runningLate,
sooner,
pastRecent,
runningEarly], 'de', now)

  it('sorts each section as the spec says and drops hidden events', () => {
    expect(grouped.current.map((card) => card.slug)).toEqual(['running-early', 'running-late'])
    expect(grouped.upcoming.map((card) => card.slug)).toEqual(['sooner', 'soon'])
    expect(grouped.past.map((card) => card.slug)).toEqual(['past-recent', 'past-old'])
    const all = [...grouped.current,
...grouped.upcoming,
...grouped.past]
    expect(all.some((card) => card.slug === 'hidden')).toBe(false)
  })

  it('records the moment it decided on and carries plain card data only', () => {
    expect(grouped.now).toBe('2026-10-05T10:00:00.000Z')
    const card = grouped.current[0]!
    expect(card).toMatchObject({ phase: 'running', accessMode: 'application', path: '/de/events/running-early' })
    expect(card).not.toHaveProperty('body')
  })

  it('is empty, not missing, when there are no events', () => {
    expect(groupEventsAt([], 'en', now)).toEqual({ now: now.toISOString(), current: [], upcoming: [], past: [] })
  })
})

describe('promotedEventsAt', () => {
  it('promotes running events for their run by default', () => {
    expect(promotedEventsAt([runningLate,
soon,
pastRecent], 'de', now).map((card) => card.slug)).toEqual(['running-late'])
  })

  it('promotes an announced event early when promote.from says so', () => {
    const early = doc('early', sooner.event, { promote: { from: '2026-10-04T00:00:00+02:00' } } as Partial<EventDocument>)
    expect(promotedEventsAt([early], 'de', now).map((card) => card.slug)).toEqual(['early'])
  })

  it('skips promote: false', () => {
    const quiet = doc('quiet', runningLate.event, { promote: false } as Partial<EventDocument>)
    expect(promotedEventsAt([quiet], 'de', now)).toEqual([])
  })

  it('keeps the two earliest starts of three', () => {
    const third = doc('third', { startsAt: '2026-10-04T18:00:00+02:00' })
    const slugs = promotedEventsAt([third,
runningLate,
runningEarly], 'de', now).map((card) => card.slug)
    expect(MAX_PROMOTED_EVENTS).toBe(2)
    expect(slugs).toEqual(['running-early', 'running-late'])
  })
})
