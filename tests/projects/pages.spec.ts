import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { navConfig } from '../../layers/navigation/navItems'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')

const overview = read('pages/projects/index.vue')
const detail = read('pages/projects/[...slug].vue')
const poiDetail = read('pages/community-poi/[...slug].vue')

describe.each([
  ['pages/projects/index.vue', overview], ['pages/projects/[...slug].vue', detail],
])('%s', (_, source) => {
  it('has exactly one h1', () => {
    expect(source.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('sets a title through usePageSeo and writes breadcrumbs', () => {
    expect(source).toMatch(/usePageSeo\(\{[\s\S]*?\btitle:/)
    expect(source).toContain('useBreadcrumbs(')
  })

  it('reads nothing from the request', () => {
    expect(source).not.toMatch(/route\.query|useCookie|useRequestHeaders/)
  })
})

describe('project detail page', () => {
  it('lists links through ResourceList and maintainers through PersonLink', () => {
    expect(detail).toContain('<ResourceList')
    expect(detail).toContain('<PersonLink')
  })

  it('shows the section "in use" only with community POIs', () => {
    expect(detail).toMatch(/<section v-if="pois\.length"[^>]*aria-labelledby="project-in-use"/)
    expect(detail).toContain('useCommunityPoisByProject(')
  })

  it('describes the project as a SoftwareApplication', () => {
    expect(detail).toContain("'@type': 'SoftwareApplication'")
  })
})

describe('community POI detail page', () => {
  it('shows the linked projects only when there are some', () => {
    expect(poiDetail).toContain('useProjectsBySlugs(')
    expect(poiDetail).toMatch(/<section v-if="linkedProjects\.length"/)
  })
})

describe('navigation', () => {
  it('links the projects before the community page', () => {
    const names = navConfig.map((entry) => (entry.type === 'link' ? entry.routeName : undefined))
    expect(names).toContain('projects')
    expect(names.indexOf('projects')).toBeLessThan(names.indexOf('community'))
  })
})
