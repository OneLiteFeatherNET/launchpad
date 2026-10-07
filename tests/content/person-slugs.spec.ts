import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'
import { locales } from '../../layers/content-core/utils/content/locales'

/**
 * A person slug in content (`author` of a blog post, `hosts` of an event)
 * must resolve in every language the content exists in, and a slug must not
 * live in the team roster and in `content/authors/` at once. The schema
 * cannot say either: slugs are plain strings to it.
 */

interface SlugReference { file: string, locale: string, field: 'author' | 'hosts' | 'maintainers', slugs: string[] }
interface AuthorEntry { file: string, slug: string }

export function collisionProblems(teamSlugs: string[], authors: AuthorEntry[]): string[] {
  const team = new Set(teamSlugs)
  return authors
    .filter((author) => team.has(author.slug))
    .map((author) => `${author.file}: slug "${author.slug}" is also in the team roster`)
}

export function unresolvedProblems(
  references: SlugReference[],
  resolvable: Record<string, Set<string>>
): string[] {
  return references.flatMap((reference) => reference.slugs
    .filter((slug) => !resolvable[reference.locale]?.has(slug))
    .map((slug) => `${reference.file}: ${reference.field} "${slug}" does not resolve in ${reference.locale}`))
}

type Frontmatter = Record<string, unknown>

function frontmatterOf(file: string): Frontmatter {
  const text = readFileSync(file, 'utf8')
  return (parse(text.slice(3, text.indexOf('\n---', 3))) ?? {}) as Frontmatter
}

function slugList(value: unknown): string[] {
  if (value === undefined || value === null) return []
  return (Array.isArray(value) ? value : [value]).map(String)
}

function rosterSlugs(locale: string): string[] {
  const raw = readFileSync(`${repoRoot}/content/team/${locale}/home.json`, 'utf8')
  const { members } = JSON.parse(raw) as {
    members: { slug?: string, openPosition?: boolean }[]
  }
  return members.filter((m) => !m.openPosition && m.slug).map((m) => m.slug as string)
}

function authorEntries(): AuthorEntry[] {
  return collectSourceFiles(['content/authors'], ['.md']).map((file) => ({
    file: relativeToRepo(file),
    slug: String(frontmatterOf(file).slug ?? basename(file, '.md')),
  }))
}

function referencesIn(dir: string, field: 'author' | 'hosts' | 'maintainers'): SlugReference[] {
  return collectSourceFiles([dir], ['.md']).map((file) => ({
    file: relativeToRepo(file),
    locale: relativeToRepo(file).split('/')[2] ?? '',
    field,
    slugs: slugList(frontmatterOf(file)[field]),
  }))
}

const COLLISION_ROSTER = ['themeinerlp']
const GUEST = new Set(['gast'])

describe('person slug rules', () => {
  it('names the author file and slug that also sit in the roster', () => {
    const problems = collisionProblems(COLLISION_ROSTER, [
      { file: 'content/authors/a.md', slug: 'themeinerlp' }, { file: 'content/authors/b.md', slug: 'gast' },
    ])
    expect(problems).toEqual(['content/authors/a.md: slug "themeinerlp" is also in the team roster'])
  })

  it('accepts authors that are not in the roster', () => {
    expect(collisionProblems(COLLISION_ROSTER, [{ file: 'x.md', slug: 'gast' }])).toEqual([])
  })

  it('names file, field and slug of a typo in author', () => {
    const problems = unresolvedProblems(
      [{ file: 'content/blog/de/a.md', locale: 'de', field: 'author', slugs: ['themeinerp'] }],
      { de: new Set(COLLISION_ROSTER) }
    )
    expect(problems).toEqual(['content/blog/de/a.md: author "themeinerp" does not resolve in de'])
  })

  it('names file, field and slug of a host without profile', () => {
    const problems = unresolvedProblems(
      [{ file: 'content/events/de/e.md', locale: 'de', field: 'hosts', slugs: ['unbekannt'] }],
      { de: GUEST }
    )
    expect(problems).toEqual(['content/events/de/e.md: hosts "unbekannt" does not resolve in de'])
  })

  it('resolves per locale, so a slug missing in one roster fails there only', () => {
    const resolvable = { de: new Set(['a']), en: new Set<string>() }
    const problems = unresolvedProblems([
      { file: 'de.md', locale: 'de', field: 'author', slugs: ['a'] }, { file: 'en.md', locale: 'en', field: 'author', slugs: ['a'] },
    ], resolvable)
    expect(problems).toEqual(['en.md: author "a" does not resolve in en'])
  })

  it('accepts references without any slug', () => {
    expect(unresolvedProblems([{ file: 'a.md', locale: 'de', field: 'hosts', slugs: [] }], {})).toEqual([])
  })
})

describe('person slugs in the content files', () => {
  const authors = authorEntries()

  it('keeps every slug out of the roster and the authors at once', () => {
    const problems = locales.flatMap((locale) => collisionProblems(rosterSlugs(locale), authors))
    expect(problems).toEqual([])
  })

  it('resolves every blog author, event host and project maintainer in its own locale', () => {
    const resolvable = Object.fromEntries(locales.map((locale) => [
      locale, new Set([...rosterSlugs(locale), ...authors.map((author) => author.slug)]),
    ]))
    const references = [...referencesIn('content/blog', 'author'), ...referencesIn('content/events', 'hosts'), ...referencesIn('content/projects', 'maintainers')]
    expect(unresolvedProblems(references, resolvable)).toEqual([])
  })
})
