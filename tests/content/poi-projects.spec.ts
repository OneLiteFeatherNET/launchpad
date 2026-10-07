import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * A community POI names the projects it shows in use with `projects`. The
 * schema types the field as plain strings, so a typo or a one-sided
 * translation would only show up as a missing card.
 */

type Frontmatter = Record<string, unknown>
interface Doc { file: string, locale: string, data: Frontmatter }

const slugList = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : [])

export function unresolvedProjectProblems(pois: Doc[], projectSlugs: Record<string, Set<string>>): string[] {
  return pois.flatMap((poi) => slugList(poi.data.projects)
    .filter((slug) => !projectSlugs[poi.locale]?.has(slug))
    .map((slug) => `${poi.file}: projects "${slug}" does not resolve in ${poi.locale}`))
}

export function poiProjectTranslationProblems(pois: Doc[]): string[] {
  const byKey = new Map<string, Doc[]>()
  for (const poi of pois) {
    const key = poi.data.translationKey
    if (typeof key !== 'string' || key === '') continue
    byKey.set(key, [...(byKey.get(key) ?? []), poi])
  }
  const problems: string[] = []
  for (const [key, group] of byKey) {
    const values = new Set(group.map((poi) => JSON.stringify([...slugList(poi.data.projects)].sort())))
    if (values.size > 1) {
      problems.push(`${group.map((poi) => poi.file).join(', ')}: projects differ between translations sharing translationKey "${key}"`)
    }
  }
  return problems
}

function documents(dir: string): Doc[] {
  return collectSourceFiles([dir], ['.md']).map((file) => {
    const text = readFileSync(file, 'utf8')
    return {
      file: relativeToRepo(file),
      locale: relativeToRepo(file).split('/')[2] ?? '',
      data: (parse(text.slice(3, text.indexOf('\n---', 3))) ?? {}) as Frontmatter,
    }
  })
}

const poi = (file: string, locale: string, data: Frontmatter): Doc => ({ file, locale, data })

describe('poi project references', () => {
  it('names file, slug and language of an unknown project', () => {
    const problems = unresolvedProjectProblems(
      [poi('content/community-poi/de/a.md', 'de', { projects: ['arcr', 'tippfehler'] })],
      { de: new Set(['arcr']) }
    )
    expect(problems).toEqual(['content/community-poi/de/a.md: projects "tippfehler" does not resolve in de'])
  })

  it('resolves per language, so a project missing in one language fails there only', () => {
    const problems = unresolvedProjectProblems(
      [poi('de.md', 'de', { projects: ['arcr'] }), poi('en.md', 'en', { projects: ['arcr'] })],
      { de: new Set(['arcr']), en: new Set() }
    )
    expect(problems).toEqual(['en.md: projects "arcr" does not resolve in en'])
  })

  it('accepts a poi without projects', () => {
    expect(unresolvedProjectProblems([poi('a.md', 'de', {})], {})).toEqual([])
  })

  it('names both files when translations differ in projects', () => {
    const problems = poiProjectTranslationProblems([
      poi('de.md', 'de', { translationKey: 'maze', projects: ['arcr'] }),
      poi('en.md', 'en', { translationKey: 'maze' }),
    ])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('de.md, en.md')
  })

  it('ignores the order of the projects', () => {
    expect(poiProjectTranslationProblems([
      poi('de.md', 'de', { translationKey: 'k', projects: ['a', 'b'] }),
      poi('en.md', 'en', { translationKey: 'k', projects: ['b', 'a'] }),
    ])).toEqual([])
  })
})

describe('poi project references in the content files', () => {
  const pois = documents('content/community-poi')
  const projects = documents('content/projects')

  it('resolves every project slug in the language of the poi', () => {
    const slugs: Record<string, Set<string>> = {}
    for (const project of projects) {
      slugs[project.locale] ??= new Set()
      slugs[project.locale]!.add(String(project.data.slug))
    }
    expect(unresolvedProjectProblems(pois, slugs)).toEqual([])
  })

  it('carries the same projects in every translation', () => {
    expect(poiProjectTranslationProblems(pois)).toEqual([])
  })
})
