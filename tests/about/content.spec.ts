import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

interface Pillar { icon: string, title: string, text: string, to: string }
interface AboutDoc { who: string, pillars: Pillar[], work: string, join: string }

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')
const load = (locale: string): AboutDoc => JSON.parse(read(`content/about/${locale}/home.json`))
const PILLAR_TARGETS = ['/community-poi',
'/projects',
'/events',
'/blog']
const registeredIcons = read('plugins/fontawesome.ts')
const camel = (icon: string) => `fa${icon.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}`

describe.each(['de', 'en'])('about content (%s)', (locale) => {
  const doc = load(locale)

  it('states who we are, how we work and how to join', () => {
    for (const key of ['who',
'work',
'join'] as const) {
      expect(doc[key]?.length, key).toBeGreaterThan(40)
    }
  })

  it('has four pillars pointing at the overview pages in order', () => {
    expect(doc.pillars.map(pillar => pillar.to)).toEqual(PILLAR_TARGETS)
  })

  it('gives every pillar an icon, title and text', () => {
    for (const pillar of doc.pillars) {
      expect(pillar.title, pillar.to).toBeTruthy()
      expect(pillar.text, pillar.to).toBeTruthy()
      expect(registeredIcons, `icon ${pillar.icon}`).toContain(camel(pillar.icon))
    }
  })

  it('names the founding year', () => {
    expect(doc.who).toContain('2019')
  })

  it('keeps the analysis-only project out', () => {
    expect(JSON.stringify(doc)).not.toMatch(/ethanol/i)
  })

  it('says supporters get no gameplay advantage', () => {
    expect(doc.work).toMatch(locale === 'de' ? /keinen spielerischen Vorteil/ : /no gameplay advantage/)
  })
})

describe('about content across locales', () => {
  it('uses the same icons in the same order', () => {
    expect(load('de').pillars.map(p => p.icon)).toEqual(load('en').pillars.map(p => p.icon))
  })
})
