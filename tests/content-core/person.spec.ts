import { describe, expect, it } from 'vitest'
import { resolvePersonFrom } from '../../layers/content-core/utils/content/person'

const team = {
  members: [
    { id: 'a', name: 'TheMeinerLP', slug: 'themeinerlp', mcName: 'themeinerlp', role: ['Dev', 'Ops'] },
    { id: 'b', name: 'Shared', slug: 'shared', avatarUrl: 'https://example.com/shared.png' },
    { id: 'c', name: 'Join us', slug: 'open-slot', openPosition: true },
  ],
}

const authors = [
  { slug: 'gast', name: 'Gast', role: 'Guest', avatar: '/gast.png', bio: 'Hi', links: { website: 'https://example.com' } }, { slug: 'shared', name: 'Shared External' },
]

describe('resolvePersonFrom', () => {
  it('resolves a roster slug to a team person with the locale profile path', () => {
    const person = resolvePersonFrom('themeinerlp', 'de', { team, authors })
    expect(person?.kind, 'kind').toBe('team')
    expect(person?.name, 'name').toBe('TheMeinerLP')
    expect(person?.profilePath, 'profilePath').toBe('/de/team/themeinerlp')
  })

  it('builds the team avatar from the minecraft name', () => {
    const person = resolvePersonFrom('themeinerlp', 'de', { team, authors })
    expect(person?.avatar).toBe('https://mc-heads.net/avatar/themeinerlp/128')
  })

  it('prefers an explicit avatar url of a team member', () => {
    const person = resolvePersonFrom('shared', 'en', { team, authors })
    expect(person?.avatar).toBe('https://example.com/shared.png')
  })

  it('joins several team roles into one string', () => {
    const person = resolvePersonFrom('themeinerlp', 'de', { team, authors })
    expect(person?.role).toBe('Dev, Ops')
  })

  it('resolves an author-only slug to an external person on the blog author path', () => {
    const person = resolvePersonFrom('gast', 'en', { team, authors })
    expect(person).toMatchObject({
      kind: 'external',
      name: 'Gast',
      role: 'Guest',
      avatar: '/gast.png',
      bio: 'Hi',
      profilePath: '/en/blog/author/gast',
    })
  })

  it('lets the team member win when both sources hold the slug', () => {
    const person = resolvePersonFrom('shared', 'de', { team, authors })
    expect(person?.kind).toBe('team')
    expect(person?.name).toBe('Shared')
  })

  it('returns null for an unknown slug without throwing', () => {
    expect(resolvePersonFrom('niemand', 'de', { team, authors })).toBeNull()
  })

  it('ignores open position entries', () => {
    expect(resolvePersonFrom('open-slot', 'de', { team, authors })).toBeNull()
  })

  it('resolves against the authors alone when there is no team document', () => {
    expect(resolvePersonFrom('gast', 'de', { team: null, authors })?.kind).toBe('external')
  })
})
