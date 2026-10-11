import { describe, expect, it } from 'vitest'
import {
  EMPTY_PROJECT_FILTER,
  filterProjects,
  isProjectFilterActive,
  parseProjectFilter,
  platformFacets,
  serializeProjectFilter,
  togglePlatform,
} from '../../layers/projects/utils/projectFilter'
import type { ProjectSummary } from '../../layers/projects/types'

const project = (slug: string, extra: Partial<ProjectSummary> = {}): ProjectSummary => ({
  slug,
  title: slug,
  summary: slug,
  status: 'active',
  audience: 'external',
  platforms: [],
  ...extra,
}) as ProjectSummary

const fixtures = [
  project('cygnus', { platforms: ['Minestom'] }),
  project('butterfly', { platforms: ['Paper', 'Minestom'] }),
  project('apus', { platforms: ['Kubernetes', 'Paper'], audience: 'internal' }),
  project('titan', { platforms: ['Minestom', 'CloudNet'], audience: 'internal' }),
  project('renovate-presets', { platforms: ['Renovate'] }),
]

const slugs = (list: ProjectSummary[]) => list.map((p) => p.slug)

describe('filterProjects', () => {
  it('returns every project for the empty filter', () => {
    expect(slugs(filterProjects(fixtures, EMPTY_PROJECT_FILTER))).toEqual(slugs(fixtures))
  })

  it('keeps only the chosen audience', () => {
    const internal = filterProjects(fixtures, { audience: 'internal', platforms: [] })
    expect(slugs(internal)).toEqual(['apus', 'titan'])
  })

  it('matches a project that runs on any one of the selected platforms', () => {
    const result = filterProjects(fixtures, { audience: 'all', platforms: ['Paper', 'CloudNet'] })
    expect(slugs(result)).toEqual(['butterfly',
'apus',
'titan'])
  })

  it('combines the audience and the platforms with and', () => {
    const result = filterProjects(fixtures, { audience: 'internal', platforms: ['Minestom'] })
    expect(slugs(result)).toEqual(['titan'])
  })

  it('drops a project without platforms as soon as a platform is selected', () => {
    const result = filterProjects([project('bare')], { audience: 'all', platforms: ['Paper'] })
    expect(result).toEqual([])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterProjects(fixtures, { audience: 'internal', platforms: ['Renovate'] })).toEqual([])
  })
})

describe('platformFacets', () => {
  it('counts each platform once for every project that names it', () => {
    const facets = platformFacets(fixtures)
    expect(facets.find((f) => f.platform === 'Minestom')?.count).toBe(3)
    expect(facets.find((f) => f.platform === 'Paper')?.count).toBe(2)
    expect(facets.find((f) => f.platform === 'Renovate')?.count).toBe(1)
  })

  it('counts a platform listed twice on one project once', () => {
    const facets = platformFacets([project('dup', { platforms: ['Paper', 'Paper'] })])
    expect(facets).toEqual([{ platform: 'Paper', count: 1 }])
  })

  it('lists the platforms alphabetically', () => {
    expect(platformFacets(fixtures).map((f) => f.platform)).toEqual([
      'CloudNet',
      'Kubernetes',
      'Minestom',
      'Paper',
      'Renovate',
    ])
  })

  it('ignores blank platform names and projects without platforms', () => {
    const facets = platformFacets([project('blank', { platforms: ['  ', 'Docker'] }), project('none')])
    expect(facets).toEqual([{ platform: 'Docker', count: 1 }])
  })
})

describe('togglePlatform', () => {
  it('adds a platform that is not selected yet', () => {
    expect(togglePlatform({ audience: 'internal', platforms: ['Paper'] }, 'Minestom'))
      .toEqual({ audience: 'internal', platforms: ['Paper', 'Minestom'] })
  })

  it('removes a platform that is already selected and keeps the audience', () => {
    expect(togglePlatform({ audience: 'internal', platforms: ['Paper', 'Minestom'] }, 'Paper'))
      .toEqual({ audience: 'internal', platforms: ['Minestom'] })
  })
})

describe('parseProjectFilter', () => {
  const known = ['CloudNet',
'Minestom',
'Paper']

  it('reads the audience and the comma-separated platforms', () => {
    const filter = parseProjectFilter(new URLSearchParams('audience=internal&platform=Minestom,Paper'), known)
    expect(filter).toEqual({ audience: 'internal', platforms: ['Minestom', 'Paper'] })
  })

  it('ignores an audience that is not a known value', () => {
    expect(parseProjectFilter(new URLSearchParams('audience=secret'), known).audience).toBe('all')
    expect(parseProjectFilter(new URLSearchParams('audience=all'), known).audience).toBe('all')
  })

  it('drops platforms that no project names', () => {
    const filter = parseProjectFilter(new URLSearchParams('platform=Minestom,Velocity'), known)
    expect(filter.platforms).toEqual(['Minestom'])
  })

  it('removes duplicate platforms', () => {
    const filter = parseProjectFilter(new URLSearchParams('platform=Paper,Paper'), known)
    expect(filter.platforms).toEqual(['Paper'])
  })

  it('returns the empty filter for a query without filter parameters', () => {
    expect(parseProjectFilter(new URLSearchParams('utm_source=x'), known)).toEqual(EMPTY_PROJECT_FILTER)
  })
})

describe('serializeProjectFilter', () => {
  it('writes nothing for the empty filter, so the unfiltered page keeps a bare URL', () => {
    expect(serializeProjectFilter(EMPTY_PROJECT_FILTER)).toEqual({})
  })

  it('writes the platforms sorted and comma-separated', () => {
    expect(serializeProjectFilter({ audience: 'all', platforms: ['Paper', 'Minestom'] }))
      .toEqual({ platform: 'Minestom,Paper' })
  })

  it('round-trips through the query string', () => {
    const filter = { audience: 'external' as const, platforms: ['CloudNet', 'Paper'] }
    const query = new URLSearchParams(serializeProjectFilter(filter))
    expect(parseProjectFilter(query, ['CloudNet', 'Paper'])).toEqual(filter)
  })
})

describe('isProjectFilterActive', () => {
  it('is false for the empty filter and true once either part is set', () => {
    expect(isProjectFilterActive(EMPTY_PROJECT_FILTER)).toBe(false)
    expect(isProjectFilterActive({ audience: 'internal', platforms: [] })).toBe(true)
    expect(isProjectFilterActive({ audience: 'all', platforms: ['Paper'] })).toBe(true)
  })
})
