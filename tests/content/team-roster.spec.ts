import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

type Member = {
  id: string
  name: string
  slug?: string
  mcName?: string
  href?: string
  openPosition?: boolean
}

const locales = ['de', 'en'] as const
const renamed: Record<string, string> = {
  'selenretterin': 'seelenretterin',
  'alex-m': 'mrs_sunday',
  'joltra': 'joltras',
  'random': '3s1',
  'pega': 'pegasusfieber17',
  'saynax-jonas': 'saynax',
  'b3nny': 'blndr2',
}
const kept = ['mcmdev', 'bavariankingdom']

function members(locale: string): Member[] {
  const raw = readFileSync(`${repoRoot}/content/team/${locale}/home.json`, 'utf8')
  return (JSON.parse(raw) as { members: Member[] }).members.filter((m) => !m.openPosition)
}

const config = readFileSync(`${repoRoot}/nuxt.config.ts`, 'utf8')

describe('team roster', () => {
  it('lists the same members in both locales', () => {
    expect(members('de').map((m) => m.id)).toEqual(members('en').map((m) => m.id))
  })

  it.each(locales)('uses the minecraft name as slug, id and mcName in %s', (locale) => {
    for (const m of members(locale).filter((x) => x.id !== 'bavariankingdom')) {
      expect(m.slug, m.id).toBe(m.id)
      expect(m.mcName, m.id).toBe(m.id)
      expect(m.name.toLowerCase(), m.id).toBe(m.id)
      expect(m.href, m.id).toBe(`/${locale}/team/${m.id}`)
    }
  })

  it.each(locales)('keeps active members in %s', (locale) => {
    const ids = members(locale).map((m) => m.id)
    for (const id of kept) expect(ids).toContain(id)
  })

  it.each(locales)('keeps no renamed slug as a member in %s', (locale) => {
    const ids = members(locale).map((m) => m.id)
    for (const [oldSlug, newSlug] of Object.entries(renamed)) {
      expect(ids).not.toContain(oldSlug)
      expect(ids).toContain(newSlug)
    }
  })

  it.each(locales)('redirects every renamed slug permanently in %s', (locale) => {
    for (const [oldSlug, newSlug] of Object.entries(renamed)) {
      const rule = `'/${locale}/team/${oldSlug}': { redirect: { to: '/${locale}/team/${newSlug}', statusCode: 301 } }`
      expect(config, `${locale}/${oldSlug}`).toContain(rule)
    }
  })

  it('does not redirect active members', () => {
    for (const id of kept) expect(config).not.toContain(`/team/${id}'`)
  })
})
