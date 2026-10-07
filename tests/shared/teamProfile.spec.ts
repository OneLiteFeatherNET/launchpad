import { describe, expect, it } from 'vitest'
import { isThinTeamProfile } from '../../shared/utils/teamProfile'

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
