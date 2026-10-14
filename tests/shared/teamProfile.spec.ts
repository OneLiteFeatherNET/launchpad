import { describe, expect, it } from 'vitest'
import { isThinTeamProfile, teamSitemapEntries } from '../../shared/utils/teamProfile'

describe('teamSitemapEntries', () => {
  it('gives a member listed in both languages alternates for both and x-default on en', () => {
    const alternates = [
      { hreflang: 'de-DE', href: '/de/team/alice' },
      { hreflang: 'en-US', href: '/en/team/alice' },
      { hreflang: 'x-default', href: '/en/team/alice' },
    ]
    expect(teamSitemapEntries({ de: ['alice'], en: ['alice'] })).toEqual([
      { loc: '/de/team/alice', alternatives: alternates }, { loc: '/en/team/alice', alternatives: alternates },
    ])
  })

  it('gives a member listed in one language only that language as alternate', () => {
    expect(teamSitemapEntries({ de: ['bob'], en: [] })).toEqual([
      { loc: '/de/team/bob', alternatives: [{ hreflang: 'de-DE', href: '/de/team/bob' }] },
    ])
  })

  it('leaves a member out of the alternates of a language where its profile is not listed', () => {
    const entries = teamSitemapEntries({ de: ['carol'], en: ['carol', 'dave'] })
    const carolDe = entries.find((entry) => entry.loc === '/de/team/carol')
    expect(carolDe?.alternatives).toEqual([
      { hreflang: 'de-DE', href: '/de/team/carol' },
      { hreflang: 'en-US', href: '/en/team/carol' },
      { hreflang: 'x-default', href: '/en/team/carol' },
    ])
    expect(entries.find((entry) => entry.loc === '/en/team/dave')?.alternatives)
      .toEqual([{ hreflang: 'en-US', href: '/en/team/dave' }, { hreflang: 'x-default', href: '/en/team/dave' }])
  })
})

describe('isThinTeamProfile', () => {
  it('is not thin with a bio only', () => {
    expect(isThinTeamProfile({ bio: 'Builds things.' })).toBe(false)
  })

  it('is not thin with a slogan only', () => {
    expect(isThinTeamProfile({ slogan: 'Ship it' })).toBe(false)
  })

  it('is not thin with both', () => {
    expect(isThinTeamProfile({ bio: 'Builds things.', slogan: 'Ship it' })).toBe(false)
  })

  it('is thin when bio and slogan are empty strings', () => {
    expect(isThinTeamProfile({ bio: '', slogan: '' })).toBe(true)
  })

  it('is thin when bio and slogan are whitespace only', () => {
    expect(isThinTeamProfile({ bio: '  \n\t', slogan: ' ' })).toBe(true)
  })

  it('is thin when both fields are missing', () => {
    expect(isThinTeamProfile({})).toBe(true)
  })

  it('is not thin when the slogan is blank but the bio has text', () => {
    expect(isThinTeamProfile({ bio: 'Text', slogan: '  ' })).toBe(false)
  })
})
