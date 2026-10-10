import { describe, expect, it } from 'vitest'
import { sortProjects } from '../../layers/projects/utils/projectLists'
import type { ProjectSummary } from '../../layers/projects/types'

const project = (slug: string, extra: Partial<ProjectSummary> = {}): ProjectSummary => ({
  slug,
  title: slug,
  summary: slug,
  status: 'active',
  ...extra,
}) as ProjectSummary

const order = (list: ProjectSummary[]) => sortProjects(list).map((p) => p.slug)

describe('sortProjects', () => {
  it('puts active projects before maintained and archived ones', () => {
    const list = [
      project('old', { status: 'archived' }),
      project('kept', { status: 'maintenance' }),
      project('live', { status: 'active' }),
    ]
    expect(order(list)).toEqual(['live',
'kept',
'old'])
  })

  it('puts the more recent release first within a status', () => {
    const list = [
      project('a', { releasedAt: new Date('2024-01-30') as never }), project('b', { releasedAt: '2025-06-01' as never }),
    ]
    expect(order(list)).toEqual(['b', 'a'])
  })

  it('puts a project without a release date after the dated ones of its status', () => {
    expect(order([project('undated'), project('dated', { releasedAt: '2024-01-30' as never })]))
      .toEqual(['dated', 'undated'])
  })

  it('falls back to the title', () => {
    expect(order([project('b', { title: 'Beta' }), project('a', { title: 'Alpha' })])).toEqual(['a', 'b'])
  })

  it('does not change the list it is given', () => {
    const list = [project('b', { title: 'B' }), project('a', { title: 'A' })]
    sortProjects(list)
    expect(list.map((p) => p.slug)).toEqual(['b', 'a'])
  })
})
