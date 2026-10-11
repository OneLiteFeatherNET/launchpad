import type { ProjectStatus, ProjectSummary } from '../types'

export const PROJECT_STATUS_ORDER: Record<ProjectStatus, number> = {
  active: 0,
  maintenance: 1,
  archived: 2
}

const released = (project: ProjectSummary): number => {
  if (!project.releasedAt) return Number.NEGATIVE_INFINITY
  const time = new Date(project.releasedAt).getTime()
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time
}

/** Active before maintained before archived, newest release first, then by title. */
export function sortProjects(projects: readonly ProjectSummary[]): ProjectSummary[] {
  return [...projects].sort((a, b) => {
    const byStatus = (PROJECT_STATUS_ORDER[a.status] ?? 99) - (PROJECT_STATUS_ORDER[b.status] ?? 99)
    if (byStatus !== 0) return byStatus
    const aTime = released(a)
    const bTime = released(b)
    if (aTime !== bTime) return aTime > bTime ? -1 : 1
    return a.title.localeCompare(b.title)
  })
}

const statusRank = (project: ProjectSummary): number => PROJECT_STATUS_ORDER[project.status] ?? 99

/** The projects `slug` maintains, active first, then by title. */
export function projectsMaintainedBy(
  projects: readonly ProjectSummary[],
  slug: string
): ProjectSummary[] {
  return projects
    .filter((project) => project.maintainers?.includes(slug))
    .sort((a, b) => {
      const byStatus = statusRank(a) - statusRank(b)
      return byStatus !== 0 ? byStatus : a.title.localeCompare(b.title)
    })
}
