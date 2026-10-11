import { describe, expect, it } from 'vitest'
import { groupProjectsByAudience, projectsMaintainedBy, sortProjects } from '../../layers/projects/utils/projectLists'
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

describe('projectsMaintainedBy', () => {
  const member = 'themeinerlp'
  const maintained = (slug: string, extra: Partial<ProjectSummary> = {}) => {
    return project(slug, { maintainers: [member], ...extra } as Partial<ProjectSummary>)
  }
  const slugsFor = (list: ProjectSummary[], name = member) => {
    return projectsMaintainedBy(list, name).map((p) => p.slug)
  }

  it('keeps only the projects that name the member as a maintainer', () => {
    const list = [
      maintained('mine'),
      project('theirs', { maintainers: ['someone-else'] } as Partial<ProjectSummary>),
      project('unlisted'),
    ]
    expect(slugsFor(list)).toEqual(['mine'])
  })

  it('lists active projects first, then by title within a status', () => {
    const list = [
      maintained('archived-a', { status: 'archived', title: 'A' }),
      maintained('maintenance', { status: 'maintenance', title: 'M' }),
      maintained('active-z', { status: 'active', title: 'Zeta' }),
      maintained('active-b', { status: 'active', title: 'Beta' }),
    ]
    expect(slugsFor(list)).toEqual([
      'active-b',
      'active-z',
      'maintenance',
      'archived-a',
    ])
  })

  it('orders by title alone, without the release date', () => {
    const newer = maintained('new', { title: 'Beta', releasedAt: '2026-01-01' as never })
    const older = maintained('old', { title: 'Alpha', releasedAt: '2020-01-01' as never })
    expect(slugsFor([newer, older])).toEqual(['old', 'new'])
  })

  it('tolerates a project without a maintainer list', () => {
    expect(slugsFor([project('bare'), maintained('mine')])).toEqual(['mine'])
  })

  it('returns nothing for a member who maintains no project', () => {
    expect(slugsFor([maintained('mine')], 'nobody')).toEqual([])
  })

  it('does not change the list it is given', () => {
    const list = [maintained('b', { title: 'B' }), maintained('a', { title: 'A' })]
    projectsMaintainedBy(list, member)
    expect(list.map((p) => p.slug)).toEqual(['b', 'a'])
  })
})

describe('groupProjectsByAudience', () => {
  const audienced = (slug: string, audience: 'external' | 'internal') => {
    return project(slug, { audience } as Partial<ProjectSummary>)
  }
  const audiences = (projects: ProjectSummary[]) => {
    return groupProjectsByAudience(projects).map((group) => group.audience)
  }
  const slugs = (group: { projects: ProjectSummary[] }) => group.projects.map((p) => p.slug)

  it('lists the external group before the internal one', () => {
    expect(audiences([audienced('a', 'internal'), audienced('b', 'external')]))
      .toEqual(['external', 'internal'])
  })

  it('keeps the input order within each group', () => {
    const groups = groupProjectsByAudience([
      audienced('ext-1', 'external'),
      audienced('int-1', 'internal'),
      audienced('ext-2', 'external'),
      audienced('int-2', 'internal'),
    ])
    expect(groups.map(slugs)).toEqual([['ext-1', 'ext-2'], ['int-1', 'int-2']])
  })

  it('returns an empty group rather than dropping it', () => {
    const [external, internal] = groupProjectsByAudience([audienced('only', 'internal')])
    expect(external).toEqual({ audience: 'external', projects: [] })
    expect(slugs(internal!)).toEqual(['only'])
  })

  it('does not change the list it is given', () => {
    const list = [audienced('int', 'internal'), audienced('ext', 'external')]
    groupProjectsByAudience(list)
    expect(list.map((p) => p.slug)).toEqual(['int', 'ext'])
  })
})
