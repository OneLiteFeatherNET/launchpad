import { describe, expect, it } from 'vitest'
import { eventDetailPath, visibleEventSitemapEntries } from '../../shared/utils/eventRoutes'

const now = new Date('2026-10-05T12:00:00+02:00')

type Schedule = { announceAt?: string, startsAt: string, endsAt?: string }
const fixture = (slug: string, event: Schedule, unlisted?: boolean) => ({ slug, event, unlisted })

describe('visibleEventSitemapEntries', () => {
  it('lists announced, running and past events and nothing hidden', () => {
    const entries = visibleEventSitemapEntries({
      de: [
        fixture('verborgen', { startsAt: '2026-11-01T18:00:00+01:00' }),
        fixture('angekuendigt', { announceAt: '2026-10-01T12:00:00+02:00', startsAt: '2026-11-01T18:00:00+01:00' }),
        fixture('laeuft', { startsAt: '2026-10-01T18:00:00+02:00', endsAt: '2026-10-14T23:59:00+02:00' }),
        fixture('vorbei', { startsAt: '2026-09-01T18:00:00+02:00', endsAt: '2026-09-14T23:59:00+02:00' }),
      ],
    }, now)
    expect(entries).toEqual([
      { loc: '/de/events/angekuendigt' },
      { loc: '/de/events/laeuft' },
      { loc: '/de/events/vorbei' },
    ])
  })

  it('keeps each locale on its own prefix', () => {
    const running = { startsAt: '2026-10-01T18:00:00+02:00' }
    expect(visibleEventSitemapEntries({ de: [fixture('bau', running)], en: [fixture('build', running)] }, now))
      .toEqual([{ loc: '/de/events/bau' }, { loc: '/en/events/build' }])
  })

  it('leaves a running, unlisted event out of the sitemap entries', () => {
    const running = { startsAt: '2026-10-01T18:00:00+02:00', endsAt: '2026-10-14T23:59:00+02:00' }
    const entries = visibleEventSitemapEntries({
      de: [
        fixture('laeuft', running), fixture('geheim', running, true),
      ],
    }, now)
    expect(entries).toEqual([{ loc: '/de/events/laeuft' }])
  })
})

describe('eventDetailPath', () => {
  it('builds the localized route', () => {
    expect(eventDetailPath('en', 'autumn-build')).toBe('/en/events/autumn-build')
  })
})
