import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

type Tree = Record<string, unknown>

const messages = (locale: string): Tree => JSON.parse(readFileSync(`${repoRoot}/i18n/locales/${locale}.json`, 'utf8'))
const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')
function lookup(tree: Tree, dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((node, part) => (node as Tree | undefined)?.[part], tree)
}

const LOCALES = ['de', 'en'] as const

const KEYS = [
  'join.title',
  'join.description',
  'join.heading',
  'join.intro',
  'join.java.heading',
  'join.java.step_1',
  'join.java.step_2',
  'join.java.step_3',
  'join.java.step_4',
  'join.bedrock.heading',
  'join.bedrock.step_1',
  'join.bedrock.step_2',
  'join.bedrock.step_3',
  'join.bedrock.step_4',
  'join.help.heading',
  'join.help.text',
  'join.help.discord',
  'join.help.faq',
  'navigation.join',
  'server.connect.more_link'
]

describe('join page messages', () => {
  it.each(LOCALES)('has every join key filled in %s', (locale) => {
    const tree = messages(locale)
    for (const key of KEYS) {
      const value = lookup(tree, key)
      expect(typeof value, `${locale}: ${key}`).toBe('string')
      expect((value as string).trim(), `${locale}: ${key}`).not.toBe('')
    }
  })

  it.each(LOCALES)('keeps the address placeholders in the steps in %s', (locale) => {
    const tree = messages(locale)
    expect(lookup(tree, 'join.java.step_3')).toContain('{address}')
    expect(lookup(tree, 'join.bedrock.step_3')).toContain('{host}')
    expect(lookup(tree, 'join.bedrock.step_3')).toContain('{port}')
  })

  it.each(LOCALES)('keeps the title short enough for a search result in %s', (locale) => {
    const title = lookup(messages(locale), 'join.title') as string
    expect(title.length).toBeLessThanOrEqual(39)
  })

  it.each(LOCALES)('writes a meta description of 120 to 155 characters in %s', (locale) => {
    const description = lookup(messages(locale), 'join.description') as string
    expect(description.length).toBeGreaterThanOrEqual(120)
    expect(description.length).toBeLessThanOrEqual(155)
  })

  it('uses umlauts and the du-form in the German copy', () => {
    const copy = JSON.stringify(messages('de').join)
    expect(copy).toMatch(/[äöüß]/)
    expect(copy).toMatch(/\b(du|dir|deine|deinen|dein)\b/)
  })
})

describe('name and language of the network', () => {
  const LANGUAGE = {
    de: { intro: 'deutschsprachiges Minecraft-Netzwerk', description: 'deutschsprachigen' },
    en: { intro: 'German-speaking Minecraft network', description: 'German-speaking' }
  } as const

  it.each(LOCALES)('names the server in the heading and the title in %s', (locale) => {
    const tree = messages(locale)
    expect(lookup(tree, 'join.heading') as string).toMatch(/server/i)
    expect(lookup(tree, 'join.title') as string).toMatch(/server/i)
  })

  it.each(LOCALES)('says the network is German-speaking in the intro in %s', (locale) => {
    expect(lookup(messages(locale), 'join.intro') as string).toContain(LANGUAGE[locale].intro)
  })

  it.each(LOCALES)('says the network is German-speaking in the meta description in %s', (locale) => {
    expect(lookup(messages(locale), 'join.description') as string).toContain(LANGUAGE[locale].description)
  })

  it.each(LOCALES)('states the founding year in the intro in %s', (locale) => {
    expect(lookup(messages(locale), 'join.intro') as string).toContain('2019')
  })
})

describe('entry points to the join page', () => {
  it('links the German editions FAQ answer to /de/join', () => {
    expect(read('content/faq/de/editions.md')).toContain('](/de/join)')
  })

  it('links the English editions FAQ answer to /en/join', () => {
    expect(read('content/faq/en/editions.md')).toContain('](/en/join)')
  })

  it('links the home server addresses section to the join page in the current locale', () => {
    const addresses = read('layers/home/components/ServerAddresses.vue')
    expect(addresses).toMatch(/:to="`\/\$\{locale\}\/join`"/)
    expect(addresses).toContain("t('server.connect.more_link')")
  })

  it('points the join page FAQ link at the heading the FAQ section renders', () => {
    expect(read('layers/home/components/FaqSection.vue')).toContain('id="faq-heading"')
    expect(read('pages/join.vue')).toContain('#faq-heading')
  })
})
