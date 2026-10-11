import { PROJECT_AUDIENCES, type ProjectAudience, type ProjectSummary } from '../types'

export type ProjectAudienceFilter = 'all' | ProjectAudience

/** Platforms combine as "any of": a project matches when it runs on one of them. */
export interface ProjectFilter {
  audience: ProjectAudienceFilter
  platforms: string[]
}

export interface PlatformFacet {
  platform: string
  count: number
}

export const EMPTY_PROJECT_FILTER: ProjectFilter = { audience: 'all', platforms: [] }

// Explicit locale: server and browser must order the chips identically or
// hydration disagrees.
const comparePlatforms = (a: string, b: string): number => a.localeCompare(b, 'en')

export function isProjectFilterActive(filter: ProjectFilter): boolean {
  return filter.audience !== 'all' || filter.platforms.length > 0
}

/** Each platform any project names, with how many projects name it, alphabetical. */
export function platformFacets(projects: readonly ProjectSummary[]): PlatformFacet[] {
  const counts = new Map<string, number>()
  for (const project of projects) {
    const names = new Set((project.platforms ?? []).map((name) => name.trim()).filter(Boolean))
    for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts]
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => comparePlatforms(a.platform, b.platform))
}

export function filterProjects(
  projects: readonly ProjectSummary[],
  filter: ProjectFilter,
): ProjectSummary[] {
  return projects.filter((project) => {
    if (filter.audience !== 'all' && project.audience !== filter.audience) return false
    if (filter.platforms.length === 0) return true
    return (project.platforms ?? []).some((platform) => filter.platforms.includes(platform))
  })
}

export function togglePlatform(filter: ProjectFilter, platform: string): ProjectFilter {
  const platforms = filter.platforms.includes(platform)
    ? filter.platforms.filter((selected) => selected !== platform)
    : [...filter.platforms, platform]
  return { ...filter, platforms }
}

/**
 * Reads the filter from a query string. Unknown audiences and platforms that
 * no project names are dropped, so a stale or hand-edited link shows the
 * unfiltered list rather than an empty one.
 */
export function parseProjectFilter(
  query: URLSearchParams,
  knownPlatforms: readonly string[],
): ProjectFilter {
  const audience = query.get('audience')
  const known = new Set(knownPlatforms)
  const platforms = [...new Set((query.get('platform') ?? '').split(',').map((name) => name.trim()))]
    .filter((name) => known.has(name))
    .sort(comparePlatforms)
  return {
    audience: (PROJECT_AUDIENCES as readonly string[]).includes(audience ?? '')
      ? (audience as ProjectAudience)
      : 'all',
    platforms,
  }
}

/** The query parameters for a filter; defaults are left out so the unfiltered page has no query. */
export function serializeProjectFilter(filter: ProjectFilter): Record<string, string> {
  const query: Record<string, string> = {}
  if (filter.audience !== 'all') query.audience = filter.audience
  const platforms = [...new Set(filter.platforms)].sort(comparePlatforms)
  if (platforms.length) query.platform = platforms.join(',')
  return query
}
