import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'
import {
  SLOGAN_MIN_LENGTH,
  isDescriptiveSlogan,
  teamProfileDescription,
  teamProfileTitle,
  type TeamDescriptionCopy
} from '../../layers/team/utils/teamDescription'

const copy: TeamDescriptionCopy = {
  withArea: (name, area) => `${name} ist im Bereich ${area} bei OneLiteFeather.`,
  plain: name => `${name} ist Teil des Teams bei OneLiteFeather.`
}

const LONG_SLOGAN = 'Wir halten die Community fair, freundlich und im Gleichgewicht.'

describe('teamProfileDescription', () => {
  it('uses the bio when there is one', () => {
    const member = { name: 'saynax', bio: 'Kümmert sich um Infra, DevOps und Security.', role: 'Entwicklung' }
    expect(teamProfileDescription(member, copy)).toBe('Kümmert sich um Infra, DevOps und Security.')
  })

  it('uses a slogan that is a full sentence of reasonable length', () => {
    expect(LONG_SLOGAN.length).toBeGreaterThanOrEqual(SLOGAN_MIN_LENGTH)
    const member = { name: 'lycheesis', slogan: LONG_SLOGAN, role: 'Medien' }
    expect(teamProfileDescription(member, copy)).toBe(LONG_SLOGAN)
  })

  it('does not use a short slogan such as "Modrinth."', () => {
    const member = { name: 'blndr2', slogan: 'Modrinth.', role: 'Moderation' }
    expect(teamProfileDescription(member, copy)).toBe('blndr2 ist im Bereich Moderation bei OneLiteFeather.')
  })

  it('does not use a long slogan that is not a sentence', () => {
    const slogan = 'Wir halten die Community fair, freundlich und im Gleichgewicht ohne Punkt'
    const member = { name: 'mcmdev', slogan, role: 'Entwicklung' }
    expect(teamProfileDescription(member, copy)).toBe('mcmdev ist im Bereich Entwicklung bei OneLiteFeather.')
  })

  it('builds the sentence from the role', () => {
    const member = { name: 'joltras', role: 'Entwicklung' }
    expect(teamProfileDescription(member, copy)).toBe('joltras ist im Bereich Entwicklung bei OneLiteFeather.')
  })

  it('joins several roles into one area', () => {
    const member = { name: 'pegasusfieber17', role: ['Entwicklung', 'Bau-Team'] }
    expect(teamProfileDescription(member, copy)).toBe('pegasusfieber17 ist im Bereich Entwicklung · Bau-Team bei OneLiteFeather.')
  })

  it('falls back to the rank label when the member has no role', () => {
    const member = { name: 'blndr2' }
    expect(teamProfileDescription(member, copy, 'Moderation')).toBe('blndr2 ist im Bereich Moderation bei OneLiteFeather.')
  })

  it('uses the plain sentence when there is neither role nor rank', () => {
    const member = { name: 'someone' }
    expect(teamProfileDescription(member, copy)).toBe('someone ist Teil des Teams bei OneLiteFeather.')
  })
})

describe('teamProfileTitle', () => {
  it('appends the role to the name', () => {
    expect(teamProfileTitle({ name: 'joltras', role: 'Entwicklung' })).toBe('joltras – Entwicklung')
  })

  it('is the bare name when there is no role field', () => {
    expect(teamProfileTitle({ name: 'blndr2' })).toBe('blndr2')
  })
})

describe('real team members', () => {
  interface Raw {
    name: string
    slug?: string
    role?: string | string[]
    rank?: string
    bio?: string
    slogan?: string
    openPosition?: boolean
  }

  const messages = (locale: 'de' | 'en') => {
    const json = JSON.parse(readFileSync(`${repoRoot}/i18n/locales/${locale}.json`, 'utf8'))
    return json.team as Record<string, unknown> & { ranks: Record<string, string> }
  }

  function interpolate(template: unknown, values: Record<string, string>): string {
    return String(template).replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
  }

  const membersOf = (locale: 'de' | 'en') => {
    const json = JSON.parse(readFileSync(`${repoRoot}/content/team/${locale}/home.json`, 'utf8'))
    return (json.members as Raw[]).filter(m => m.slug && !m.openPosition)
  }

  it.each(['de', 'en'] as const)('gives every %s profile a description that says who the member is', (locale) => {
    const text = messages(locale)
    const localeCopy: TeamDescriptionCopy = {
      withArea: (name, area) => interpolate(text.profile_description_in_area, { name, area }),
      plain: name => interpolate(text.profile_description_plain, { name })
    }
    for (const member of membersOf(locale)) {
      const rankLabel = member.rank ? text.ranks[member.rank] : undefined
      const description = teamProfileDescription(member, localeCopy, rankLabel)
      const slogan = isDescriptiveSlogan(member.slogan) ? member.slogan : undefined
      const written = member.bio?.trim() || slogan
      if (written) {
        expect(description, member.name).toBe(written)
        continue
      }
      const label = `${member.name}: ${description}`
      expect(description, member.name).toContain(member.name)
      expect(description.length, label).toBeGreaterThanOrEqual(70)
      expect(description.length, label).toBeLessThanOrEqual(160)
    }
  })
})

describe('team profile page', () => {
  const page = readFileSync(`${repoRoot}/pages/team/[slug].vue`, 'utf8')

  it('takes its title and description from the shared helpers', () => {
    expect(page).toContain('teamProfileTitle(member.value)')
    expect(page).toContain('memberDescription.value')
  })

  it('no longer falls back to the raw slogan for meta tags', () => {
    expect(page).not.toMatch(/member\.value\??\.slogan\s*\|\|/)
  })
})
