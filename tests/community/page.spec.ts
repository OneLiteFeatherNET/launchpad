import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { navConfig } from '../../layers/navigation/navItems'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')

describe('community page', () => {
  const page = read('pages/community.vue')

  it('has one h1', () => {
    expect(page.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('sets title, description and breadcrumbs for the page', () => {
    expect(page).toMatch(/usePageSeo\(\{\s*title: t\('community\.title'\)/)
    expect(page).toContain("description: t('community.description')")
    expect(page).toMatch(/useBreadcrumbs\(/)
  })

  it('feeds the wall from the orchestrating composable, not from a domain layer', () => {
    expect(page).toContain('useCommunityOverview()')
    expect(page).not.toMatch(/useCommunityPoi|useEvents|useTeamRoster|useOpenCollective/)
  })

  it('reads no query, cookie or header', () => {
    expect(page).not.toMatch(/route\.query|useCookie|useRequestHeaders/)
  })
})

describe('home page community strip', () => {
  const home = read('pages/index.vue')

  it('renders the strip from props prepared by the page', () => {
    expect(home).toMatch(/<LazyCommunityStrip[^>]*hydrate-on-visible[^>]*:numbers="numbers"/)
    expect(home).toContain('useCommunityOverview()')
  })

  it('links the strip to the localized community page', () => {
    expect(home).toMatch(/:to="`\/\$\{locale\}\/community`"/)
  })
})

describe('navigation', () => {
  it('has a community entry before the "more" group', () => {
    const community = navConfig.findIndex((entry) => entry.type === 'link' && entry.routeName === 'community')
    const more = navConfig.findIndex((entry) => entry.type === 'group')
    expect(community, 'community link exists').toBeGreaterThan(-1)
    expect(community).toBeLessThan(more)
  })

  it('titles the entry from the navigation messages', () => {
    const entry = navConfig.find((item) => item.type === 'link' && item.routeName === 'community')
    expect(entry?.textKey).toBe('navigation.community')
  })
})
