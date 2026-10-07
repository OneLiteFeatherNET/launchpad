import { describe, expect, it } from 'vitest'
import {
  buildCommunityOverview,
  type CommunityEventSource,
  type CommunityPoiSource
} from '../../layers/community/utils/contributors'

const NOW = new Date('2026-10-07T12:00:00Z')

const poi = (slug: string, builders: CommunityPoiSource['builders']): CommunityPoiSource => ({
  slug,
  title: `POI ${slug}`,
  builders
})

const event = (
  slug: string,
  schedule: { startsAt: string, endsAt?: string, announceAt?: string },
  placements: { place: number, name: string, mcName?: string }[],
  unlisted?: boolean
): CommunityEventSource => ({
  slug,
  title: `Event ${slug}`,
  unlisted,
  event: schedule,
  results: { placements }
})

const PAST = { startsAt: '2026-01-01T10:00:00Z', endsAt: '2026-01-10T10:00:00Z' }

const overview = (
  input: Partial<Parameters<typeof buildCommunityOverview>[0]> = {}
) => buildCommunityOverview({ pois: [], events: [], teamSize: 0, locale: 'de', now: NOW, ...input })

describe('buildCommunityOverview', () => {
  it('passes the team size and the number of builds through', () => {
    const result = overview({ pois: [poi('a', []), poi('b', undefined)], teamSize: 7 })
    expect(result.teamSize, 'team size').toBe(7)
    expect(result.buildCount, 'every POI is a build').toBe(2)
  })

  it('merges one builder of two POIs into a single person with two contributions', () => {
    const result = overview({
      pois: [
        poi('a', [{ name: 'Blndr2', mcName: 'Blndr2' }]),
        poi('b', [{ name: 'blndr2', mcName: 'blndr2' }])
      ]
    })
    expect(result.contributors, 'spelling of mcName must not split a person').toHaveLength(1)
    expect(result.contributors[0]!.contributions.map((c) => c.title)).toEqual(['POI a', 'POI b'])
  })

  it('gives a person one contribution when a POI lists them twice', () => {
    const result = overview({ pois: [poi('a', [{ name: 'Ada', mcName: 'ada' }, { name: 'Ada', mcName: 'ADA' }])] })
    expect(result.contributors[0]!.contributions).toHaveLength(1)
  })

  it('shows the name of the first contribution', () => {
    const result = overview({
      pois: [
        poi('a', [{ name: 'Blndr2', mcName: 'BLNDR2' }]),
        poi('b', [{ name: 'blndr2', mcName: 'blndr2' }])
      ]
    })
    expect(result.contributors[0]!.name).toBe('Blndr2')
  })

  it('merges by name when there is no mcName', () => {
    const result = overview({
      pois: [poi('a', [{ name: 'Ada' }]), poi('b', [{ name: ' ada ' }])]
    })
    expect(result.contributors).toHaveLength(1)
  })

  it('keeps two people with different mcNames apart even when the names match', () => {
    const result = overview({
      pois: [poi('a', [{ name: 'Sam', mcName: 'sam1' }, { name: 'Sam', mcName: 'sam2' }])]
    })
    expect(result.contributors).toHaveLength(2)
  })

  it('counts a person once when they built and placed', () => {
    const result = overview({
      pois: [poi('a', [{ name: 'Ada', mcName: 'ada' }])],
      events: [event('e', PAST, [{ place: 1, name: 'Ada', mcName: 'ADA' }])]
    })
    expect(result.contributors).toHaveLength(1)
    expect(result.contributors[0]!.contributions.map((c) => c.kind)).toEqual(['build', 'event'])
  })

  it('records the placement and the path of an event contribution', () => {
    const result = overview({ events: [event('e', PAST, [{ place: 2, name: 'Ada' }])] })
    expect(result.contributors[0]!.contributions).toEqual([
      { kind: 'event', title: 'Event e', path: '/de/events/e', place: 2 }
    ])
  })

  it('links a build contribution to the POI page of the given locale', () => {
    const result = overview({ locale: 'en', pois: [poi('maze', [{ name: 'Ada' }])] })
    expect(result.contributors[0]!.contributions).toEqual([
      { kind: 'build', title: 'POI maze', path: '/en/community-poi/maze' }
    ])
  })

  it('ignores the placements of an event that is still hidden', () => {
    const hidden = { startsAt: '2027-01-01T10:00:00Z', endsAt: '2027-01-10T10:00:00Z' }
    expect(overview({ events: [event('e', hidden, [{ place: 1, name: 'Ada' }])] }).contributors).toEqual([])
  })

  it('ignores the placements of an event that is only announced', () => {
    const announced = { announceAt: '2026-10-01T00:00:00Z', startsAt: '2027-01-01T10:00:00Z', endsAt: '2027-01-10T10:00:00Z' }
    expect(overview({ events: [event('e', announced, [{ place: 1, name: 'Ada' }])] }).contributors).toEqual([])
  })

  it('ignores the placements of an event that is still running', () => {
    const running = { startsAt: '2026-10-01T10:00:00Z', endsAt: '2026-11-01T10:00:00Z' }
    expect(overview({ events: [event('e', running, [{ place: 1, name: 'Ada' }])] }).contributors).toEqual([])
  })

  it('ignores the placements of an unlisted event even when it is over', () => {
    expect(overview({ events: [event('e', PAST, [{ place: 1, name: 'Ada' }], true)] }).contributors).toEqual([])
  })

  it('sorts people by number of contributions, then by name', () => {
    const result = overview({
      pois: [
        poi('a', [{ name: 'Zed' }, { name: 'Amy' }]),
        poi('b', [{ name: 'Zed' }, { name: 'Bob' }])
      ]
    })
    expect(result.contributors.map((c) => c.name)).toEqual(['Zed', 'Amy', 'Bob'])
  })

  it('carries nothing of the source rows beyond what the wall shows', () => {
    const result = overview({
      pois: [{ ...poi('a', [{ name: 'Ada', mcName: 'ada' }]), path: '/community-poi/de/a', stem: 'x' } as CommunityPoiSource],
      events: [{ ...event('e', PAST, [{ place: 1, name: 'Bo' }]), path: '/events/de/e' } as CommunityEventSource]
    })
    const json = JSON.stringify(result)
    expect(json).not.toContain('/community-poi/de')
    expect(json).not.toContain('/events/de/e')
    expect(json).not.toContain('results')
  })
})
