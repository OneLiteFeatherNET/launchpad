import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'
import { teamProfileDescription } from '../../layers/team/utils/teamDescription'

/**
 * Search results cut a description at about 155 characters and a title at
 * about 60. Every text that becomes a meta description or a <title> stays
 * inside that, in both languages.
 */
const DESCRIPTION_MIN = 50
const DESCRIPTION_MAX = 155
const TITLE_MAX = 60
const TITLE_SUFFIX = ' | OneLiteFeather'
const LOCALES = ['de', 'en']

type Tree = Record<string, unknown>
const readJson = (file: string) => JSON.parse(readFileSync(join(repoRoot, file), 'utf8')) as Tree
const lookup = (tree: Tree, key: string) => key.split('.').reduce<unknown>((node, part) => (node as Tree | undefined)?.[part], tree) as string | undefined
const fill = (text: string) => text.replace(/\{\w+\}/g, 'ExampleName')

const pageFiles = collectSourceFiles(['pages'], ['.vue'])
const keysFor = (field: 'title' | 'description') => {
  const keys = new Set<string>()
  for (const file of pageFiles) {
    for (const match of readFileSync(file, 'utf8').matchAll(new RegExp(`^\\s*${field}: t\\('([\\w.]+)'`, 'gm'))) keys.add(match[1]!)
  }
  return [...keys].sort()
}

const unquote = (raw: string): string => {
  const value = raw.trim()
  if (value.startsWith('\'')) return value.slice(1, -1).replace(/''/g, '\'')
  if (value.startsWith('"')) return value.slice(1, -1).replace(/\\"/g, '"')
  return value
}

/** Top-level `summary`/`description` and `seo.description` of a content file's frontmatter. */
function frontmatterTexts(file: string, keys: string[]): Array<{ key: string, text: string }> {
  const front = readFileSync(file, 'utf8').split(/^---$/m)[1] ?? ''
  const found: Array<{ key: string, text: string }> = []
  let inSeo = false
  for (const line of front.split('\n')) {
    if (/^seo:\s*$/.test(line)) inSeo = true
    else if (/^\S/.test(line)) inSeo = false
    const top = /^(\w+):\s*(\S.*)$/.exec(line)
    if (top && keys.includes(top[1]!)) found.push({ key: top[1]!, text: unquote(top[2]!) })
    const nested = /^ {2}description:\s*(\S.*)$/.exec(line)
    if (inSeo && nested) found.push({ key: 'seo.description', text: unquote(nested[1]!) })
  }
  return found
}

const inRange = (text: string) => text.length >= DESCRIPTION_MIN && text.length <= DESCRIPTION_MAX

describe.each(LOCALES)('meta descriptions in %s', (locale) => {
  const messages = readJson(`i18n/locales/${locale}.json`)

  it.each(['index.description', ...keysFor('description')])('i18n key %s fits', (key) => {
    const text = fill(lookup(messages, key) ?? '')
    expect(inRange(text), `${locale}.json ${key} is ${text.length} characters, allowed ${DESCRIPTION_MIN}-${DESCRIPTION_MAX}`).toBe(true)
  })

  it('keeps every blog article description in range', () => {
    const bad: string[] = []
    for (const file of collectSourceFiles([`content/blog/${locale}`], ['.md'])) {
      const texts = frontmatterTexts(file, ['description'])
      const own = texts.find(entry => entry.key === 'seo.description') ?? texts.find(entry => entry.key === 'description')
      if (own && !inRange(own.text)) bad.push(`${relativeToRepo(file)}: ${own.text.length}`)
    }
    expect(bad, 'blog descriptions outside range').toEqual([])
  })

  it('keeps every project, event and POI summary in range', () => {
    const bad: string[] = []
    for (const dir of ['projects',
'events',
'community-poi']) {
      for (const file of collectSourceFiles([`content/${dir}/${locale}`], ['.md'])) {
        for (const { text } of frontmatterTexts(file, ['summary'])) {
          if (!inRange(text)) bad.push(`${relativeToRepo(file)}: ${text.length}`)
        }
      }
    }
    expect(bad, 'summaries outside range').toEqual([])
  })

  it('keeps every team profile description in range', () => {
    const copy = {
      withArea: (name: string, area: string) => (lookup(messages, 'team.profile_description_in_area') ?? '').replace('{name}', name).replace('{area}', area),
      plain: (name: string) => (lookup(messages, 'team.profile_description_plain') ?? '').replace('{name}', name)
    }
    const members = (readJson(`content/team/${locale}/home.json`).members ?? []) as Array<{ name: string, rank?: string, role?: string | string[], bio?: string, slogan?: string }>
    const bad = members
      .map(member => ({ name: member.name, text: teamProfileDescription(member, copy, member.rank ? lookup(messages, `team.ranks.${member.rank}`) : null) }))
      .filter(({ text }) => text.length > DESCRIPTION_MAX)
      .map(({ name, text }) => `${name}: ${text.length}`)
    expect(bad, 'team profile descriptions over the maximum').toEqual([])
  })
})

describe.each(LOCALES)('rendered titles in %s', (locale) => {
  const messages = readJson(`i18n/locales/${locale}.json`)

  it('keeps the home title within the limit, without the suffix', () => {
    const text = lookup(messages, 'index.title') ?? ''
    expect(text.length, `${locale}.json index.title is ${text.length} characters`).toBeLessThanOrEqual(TITLE_MAX)
  })

  it.each(keysFor('title'))('%s plus the site suffix fits', (key) => {
    const text = fill(lookup(messages, key) ?? '') + TITLE_SUFFIX
    expect(text.length, `${locale}.json ${key} renders ${text.length} characters`).toBeLessThanOrEqual(TITLE_MAX)
  })
})
