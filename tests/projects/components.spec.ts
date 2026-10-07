// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ProjectCard from '../../layers/projects/components/ProjectCard.vue'
import ProjectGrid from '../../layers/projects/components/ProjectGrid.vue'
import type { ProjectSummary } from '../../layers/projects/types'

const project = (slug: string, extra: Record<string, unknown> = {}): ProjectSummary => ({
  slug,
  title: `Project ${slug}`,
  summary: `Summary ${slug}`,
  status: 'active',
  ...extra,
}) as ProjectSummary

const card = (p: ProjectSummary) => mountSuspended(ProjectCard, { props: { project: p }, route: '/de/projects' })
const grid = (projects: ProjectSummary[]) => mountSuspended(ProjectGrid, { props: { projects }, route: '/de/projects' })

describe('ProjectCard', () => {
  it('has exactly one link, to the detail page', async () => {
    const wrapper = await card(project('arcr'))
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]!.attributes('href')).toBe('/de/projects/arcr')
    expect(links[0]!.text()).toBe('Project arcr')
  })

  it('shows the summary and names the status', async () => {
    const wrapper = await card(project('arcr'))
    expect(wrapper.text()).toContain('Summary arcr')
    expect(wrapper.text()).toContain('Aktiv')
  })

  it('shows a placeholder without a logo', async () => {
    const wrapper = await card(project('arcr'))
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('shows the logo with its alt text', async () => {
    const wrapper = await card(project('arcr', { logo: '/images/projects/arcr.webp', logoAlt: 'ARCR logo' }))
    expect(wrapper.find('img').attributes('alt')).toBe('ARCR logo')
  })
})

describe('ProjectGrid', () => {
  it('renders one list item per project', async () => {
    const wrapper = await grid([project('a'), project('b')])
    expect(wrapper.findAll('ul > li')).toHaveLength(2)
  })

  it('shows an empty state without projects', async () => {
    const wrapper = await grid([])
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.text()).toContain('Noch keine Projekte')
  })
})
