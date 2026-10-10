import { describe, expect, it } from 'vitest'
import type { EventDocument } from '../../layers/events/types'
import { eventsByHostAt } from '../../layers/events/utils/eventLists'

const now = new Date('2026-10-05T12:00:00+02:00')

const RUNNING = { startsAt: '2026-10-01T18:00:00+02:00', endsAt: '2026-10-20T18:00:00+02:00' }
const ANNOUNCED = { announceAt: '2026-10-01T12:00:00+02:00', startsAt: '2026-11-01T18:00:00+01:00' }
const PAST = { startsAt: '2026-08-01T18:00:00+02:00', endsAt: '2026-08-10T18:00:00+02:00' }
const HIDDEN = { startsAt: '2026-12-01T18:00:00+01:00' }

function doc(
  slug: string,
  event: EventDocument['event'],
  extra: Partial<EventDocument> = {}
): EventDocument {
  return { slug, title: slug, summary: slug, type: 'build', event, ...extra } as EventDocument
}

const hosted = (slug: string, event: EventDocument['event'], hosts: string[] = ['tp']) => doc(slug, event, { hosts } as Partial<EventDocument>)

const slugs = (docs: EventDocument[]) => eventsByHostAt(docs, 'tp', 'de', now).map((card) => card.slug)

describe('eventsByHostAt', () => {
  it('lists the events the person hosts', () => {
    expect(slugs([hosted('mine', RUNNING), hosted('theirs', RUNNING, ['gast'])])).toEqual(['mine'])
  })

  it('finds the person among several hosts', () => {
    expect(slugs([hosted('shared', RUNNING, ['gast', 'tp'])])).toEqual(['shared'])
  })

  it('lists running events first, then announced, then past', () => {
    const docs = [hosted('past', PAST),
hosted('soon', ANNOUNCED),
hosted('now', RUNNING)]
    expect(slugs(docs)).toEqual(['now',
'soon',
'past'])
  })

  it('carries the phase and the detail path of each event', () => {
    const [card] = eventsByHostAt([hosted('now', RUNNING)], 'tp', 'de', now)
    expect(card).toMatchObject({ phase: 'running', path: '/de/events/now' })
  })

  it('leaves out an unlisted event', () => {
    const unlisted = doc('quiet', RUNNING, { hosts: ['tp'], unlisted: true } as Partial<EventDocument>)
    expect(slugs([unlisted])).toEqual([])
  })

  it('leaves out an event that is still hidden', () => {
    expect(slugs([hosted('later', HIDDEN)])).toEqual([])
  })

  it('ignores events without hosts', () => {
    expect(slugs([doc('plain', RUNNING)])).toEqual([])
  })
})
