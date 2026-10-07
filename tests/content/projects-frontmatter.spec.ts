import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'
import { locales } from '../../layers/content-core/utils/content/locales'

/**
 * The rules the projects schema cannot express: @nuxt/content turns the zod
 * schema into columns and never validates a document against it.
 */

type Frontmatter = Record<string, unknown>
interface ProjectDocument { file: string, locale: string, data: Frontmatter }

const STATUSES = ['active',
'maintenance',
'archived']
const LINK_KEYS = ['docs',
'source',
'issues']
const FACT_FIELDS = ['status',
'releasedAt',
'license',
'platforms',
'maintainers',
'links'] as const

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''
const isHttps = (value: unknown): boolean => {
  try {
    return typeof value === 'string' && new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function projectFrontmatterProblems(data: Frontmatter): string[] {
  const problems: string[] = []
  for (const field of ['slug',
'title',
'summary']) {
    if (!isText(data[field])) problems.push(`${field}: required text is missing`)
  }
  if (!STATUSES.includes(data.status as string)) {
    problems.push(`status: must be one of ${STATUSES.join(', ')}`)
  }
  if (data.logo !== undefined && !isText(data.logoAlt)) {
    problems.push('logo: needs a logoAlt')
  }
  const links = (data.links ?? {}) as Frontmatter
  for (const key of LINK_KEYS) {
    if (links[key] !== undefined && !isHttps(links[key])) problems.push(`links.${key}: must be an https URL`)
  }
  for (const download of (links.downloads ?? []) as Frontmatter[]) {
    if (!isText(download.label)) problems.push('links.downloads: every entry needs a label')
    if (!isHttps(download.url)) problems.push(`links.downloads: "${String(download.label)}" must be an https URL`)
  }
  return problems
}

export function projectSlugProblems(docs: ProjectDocument[]): string[] {
  const seen = new Map<string, string>()
  const problems: string[] = []
  for (const doc of docs) {
    const key = `${doc.locale}/${String(doc.data.slug)}`
    const first = seen.get(key)
    if (first) problems.push(`${first}, ${doc.file}: slug "${String(doc.data.slug)}" is used twice in ${doc.locale}`)
    else seen.set(key, doc.file)
  }
  return problems
}

export function projectTranslationProblems(docs: ProjectDocument[]): string[] {
  const byKey = new Map<string, ProjectDocument[]>()
  for (const doc of docs) {
    const key = doc.data.translationKey
    if (typeof key !== 'string' || key === '') continue
    byKey.set(key, [...(byKey.get(key) ?? []), doc])
  }
  const problems: string[] = []
  for (const [key, group] of byKey) {
    const files = group.map((doc) => doc.file).join(', ')
    const present = new Set(group.map((doc) => doc.locale))
    for (const locale of locales) {
      if (!present.has(locale)) problems.push(`${files}: translationKey "${key}" has no ${locale} translation`)
    }
    for (const field of FACT_FIELDS) {
      const values = new Set(group.map((doc) => JSON.stringify(doc.data[field] ?? null)))
      if (values.size > 1) problems.push(`${files}: ${field} differs between translations sharing translationKey "${key}"`)
    }
  }
  return problems
}

function projectDocuments(): ProjectDocument[] {
  return collectSourceFiles(['content/projects'], ['.md']).map((file) => {
    const text = readFileSync(file, 'utf8')
    return {
      file: relativeToRepo(file),
      locale: relativeToRepo(file).split('/')[2] ?? '',
      data: (parse(text.slice(3, text.indexOf('\n---', 3))) ?? {}) as Frontmatter,
    }
  })
}

const VALID: Frontmatter = {
  slug: 'arcr',
  translationKey: 'arcr',
  title: 'ARCR',
  summary: 'Detects redstone clocks.',
  status: 'active',
  releasedAt: '2024-01-30',
  platforms: ['Paper'],
  links: {
    docs: 'https://arcr.onelitefeather.net',
    downloads: [{ label: 'Hangar', url: 'https://hangar.papermc.io/x' }],
  },
}

const withChange = (change: (data: Frontmatter) => void): Frontmatter => {
  const copy = structuredClone(VALID)
  change(copy)
  return copy
}

const doc = (locale: string, data: Frontmatter): ProjectDocument => ({ file: `content/projects/${locale}/x.md`, locale, data })

describe('project frontmatter rules', () => {
  it('accepts a complete and a minimal entry', () => {
    expect(projectFrontmatterProblems(VALID)).toEqual([])
    expect(projectFrontmatterProblems({ slug: 'a', title: 'A', summary: 'S', status: 'archived' })).toEqual([])
  })

  it('rejects a missing summary and an unknown status', () => {
    expect(projectFrontmatterProblems(withChange((d) => { delete d.summary }))).toEqual(['summary: required text is missing'])
    expect(projectFrontmatterProblems(withChange((d) => { d.status = 'beta' }))[0]).toContain('status')
  })

  it('requires an alt text for a logo', () => {
    expect(projectFrontmatterProblems(withChange((d) => { d.logo = '/images/x.webp' }))).toEqual(['logo: needs a logoAlt'])
    expect(projectFrontmatterProblems(withChange((d) => { d.logo = '/images/x.webp'; d.logoAlt = 'Logo' }))).toEqual([])
  })

  it('requires https links', () => {
    const problems = projectFrontmatterProblems(withChange((d) => {
      d.links = { docs: 'http://example.org', source: 'nope', downloads: [{ label: 'X', url: 'ftp://x' }] }
    }))
    expect(problems).toEqual([
      'links.docs: must be an https URL',
      'links.source: must be an https URL',
      'links.downloads: "X" must be an https URL',
    ])
  })
})

describe('project slugs', () => {
  it('names both files that share a slug in one language', () => {
    const a = { ...doc('de', VALID), file: 'a.md' }
    const b = { ...doc('de', VALID), file: 'b.md' }
    expect(projectSlugProblems([a, b])).toEqual(['a.md, b.md: slug "arcr" is used twice in de'])
  })

  it('accepts the same slug in two languages', () => {
    expect(projectSlugProblems([doc('de', VALID), doc('en', VALID)])).toEqual([])
  })
})

describe('project translations', () => {
  it('accepts translations that agree on the facts', () => {
    expect(projectTranslationProblems([doc('de', VALID), doc('en', VALID)])).toEqual([])
  })

  it('names both files when the status differs', () => {
    const de = { ...doc('de', VALID), file: 'de.md' }
    const en = { ...doc('en', withChange((d) => { d.status = 'archived' })), file: 'en.md' }
    const [problem] = projectTranslationProblems([de, en])
    expect(problem).toContain('de.md')
    expect(problem).toContain('en.md')
    expect(problem).toContain('status differs')
  })

  it('rejects a translationKey that exists in one language only', () => {
    expect(projectTranslationProblems([doc('de', VALID)])[0]).toContain('no en translation')
  })

  it('rejects differing maintainers', () => {
    const en = doc('en', withChange((d) => { d.maintainers = ['themeinerlp'] }))
    expect(projectTranslationProblems([doc('de', VALID), en])[0]).toContain('maintainers differs')
  })
})

describe('project documents', () => {
  const docs = projectDocuments()

  it('finds the project documents', () => {
    expect(docs.length).toBeGreaterThan(0)
  })

  it.each(docs.map((d) => [d.file, d] as const))('%s follows the frontmatter rules', (_, d) => {
    expect(projectFrontmatterProblems(d.data)).toEqual([])
  })

  it('uses each slug once per language', () => {
    expect(projectSlugProblems(docs)).toEqual([])
  })

  it('keeps translations in step', () => {
    expect(projectTranslationProblems(docs)).toEqual([])
  })
})
