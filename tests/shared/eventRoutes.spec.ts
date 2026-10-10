import { describe, expect, it } from 'vitest'
import { eventDetailPath, visibleEventSitemapEntries } from '../../shared/utils/eventRoutes'

const now = new Date('2026-10-05T12:00:00+02:00')

type Schedule = { announceAt?: string, startsAt: string, endsAt?: string }
const fixture = (slug: string, event: Schedule, unlisted?: boolean, translationKey?: string) => ({
  slug, event, unlisted, translationKey,
})

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

  it('pairs translations by translationKey even when the slugs differ', () => {
    const running = { startsAt: '2026-10-01T18:00:00+02:00' }
    const [de] = visibleEventSitemapEntries({
      de: [fixture('herbst-bauevent', running, false, 'bau-2026')],
      en: [fixture('autumn-build', running, false, 'bau-2026')],
    }, now)
    const own = { hreflang: 'de-DE', href: '/de/events/herbst-bauevent' }
    expect(de?.alternatives).toEqual([own, { hreflang: 'en-US', href: '/en/events/autumn-build' }])
  })

  it('leaves a translation out of the alternates when it is not listed', () => {
    const running = { startsAt: '2026-10-01T18:00:00+02:00' }
    const [de] = visibleEventSitemapEntries({
      de: [fixture('herbst-bauevent', running, false, 'bau-2026')],
      en: [fixture('autumn-build', running, true, 'bau-2026')],
    }, now)
    expect(de).toEqual({ loc: '/de/events/herbst-bauevent' })
  })

  it('adds no alternates to an event without a translationKey', () => {
    const running = { startsAt: '2026-10-01T18:00:00+02:00' }
    const [de] = visibleEventSitemapEntries({
      de: [fixture('bau', running)],
      en: [fixture('bau', running)],
    }, now)
    expect(de).not.toHaveProperty('alternatives')
  })
})

describe('eventDetailPath', () => {
  it('builds the localized route', () => {
    expect(eventDetailPath('en', 'autumn-build')).toBe('/en/events/autumn-build')
  })
})
