import { describe, expect, it } from 'vitest'
import {
  buildCommunityOverview,
  type CommunityOverviewInput
} from '../../layers/community/utils/contributors'

const NOW = new Date('2026-10-07T12:00:00Z')
const PAST = { startsAt: '2026-01-01T10:00:00Z', endsAt: '2026-01-10T10:00:00Z' }
const AVATAR = 'https://opencollective-production.s3.us-west-1.amazonaws.com/account-avatar/x/a.png'

const supporter = (name: string, image: string | null = null) => ({
  name,
  image,
  profile: `https://opencollective.com/${name.toLowerCase().replace(/\W+/g, '-')}`
})

const overview = (input: Partial<CommunityOverviewInput> = {}) => buildCommunityOverview({
  pois: [],
  events: [],
  teamSize: 0,
  locale: 'de',
  now: NOW,
  ...input
})

describe('buildCommunityOverview with supporters', () => {
  it('turns a supporter into a contributor with a supporter badge to the profile', () => {
    const [person] = overview({ supporters: [supporter('Marc')] }).contributors
    expect(person!.name).toBe('Marc')
    expect(person!.contributions).toEqual([
      { kind: 'supporter', path: 'https://opencollective.com/marc' }
    ])
  })

  it('merges a supporter into the builder whose mcName matches, ignoring case', () => {
    const result = overview({
      pois: [{ slug: 'maze', title: 'Maze', builders: [{ name: 'Blndr2', mcName: 'blndr2' }] }],
      supporters: [supporter('BLNDR2')]
    })
    expect(result.contributors, 'one card for one person').toHaveLength(1)
    expect(result.contributors[0]!.contributions.map((c) => c.kind)).toEqual(['build', 'supporter'])
    expect(result.contributors[0]!.name).toBe('Blndr2')
  })

  it('merges a supporter into the person whose name matches when the mcName differs', () => {
    const result = overview({
      pois: [{ slug: 'maze', title: 'Maze', builders: [{ name: 'Foo Bar', mcName: 'foobar' }] }],
      supporters: [supporter('foo bar')]
    })
    expect(result.contributors).toHaveLength(1)
    expect(result.contributors[0]!.anchor, 'anchor follows the supporter name').toBe('person-foo-bar')
  })

  it('merges a supporter into an event placement as well', () => {
    const result = overview({
      events: [{
        slug: 'e',
        title: 'E',
        event: PAST,
        results: { placements: [{ place: 1, name: 'Ada', mcName: 'ada' }] }
      }],
      supporters: [supporter('Ada')]
    })
    expect(result.contributors[0]!.contributions.map((c) => c.kind)).toEqual(['event', 'supporter'])
  })

  it('lists a supporter once even when the profile repeats', () => {
    const result = overview({ supporters: [supporter('Marc'), supporter('Marc')] })
    expect(result.contributors).toHaveLength(1)
    expect(result.contributors[0]!.contributions).toHaveLength(1)
  })

  it('counts supporters among the contributors', () => {
    const result = overview({
      pois: [{ slug: 'a', title: 'A', builders: [{ name: 'Ada' }] }],
      supporters: [supporter('Ada'),
supporter('Bo'),
supporter('Cy')]
    })
    expect(result.contributors.map((c) => c.name).sort()).toEqual(['Ada',
'Bo',
'Cy'])
  })

  it('carries the avatar of a supporter and nothing else of the source', () => {
    const [person] = overview({ supporters: [supporter('Marc', AVATAR)] }).contributors
    expect(person!.avatarUrl).toBe(AVATAR)
    expect(Object.keys(person!).sort()).toEqual(['anchor',
'avatarUrl',
'contributions',
'key',
'name'])
  })

  it('anchors every person, from the key unless they are a supporter', () => {
    const result = overview({
      pois: [{ slug: 'a', title: 'A', builders: [{ name: 'Ada', mcName: 'Ada_1' }] }]
    })
    expect(result.contributors[0]!.anchor).toBe('person-ada-1')
  })

  it('works without a supporter list', () => {
    expect(overview({ supporters: undefined }).contributors).toEqual([])
  })
})
