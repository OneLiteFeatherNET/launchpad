import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { navConfig, type NavLinkConfig } from '../../layers/navigation/navItems'
import { repoRoot } from '../helpers/sources'

const MAX_TOP_LEVEL = 6

const links = (): NavLinkConfig[] => navConfig.flatMap(entry => (entry.type === 'group' ? entry.children : [entry]))
const group = (textKey: string) => navConfig.find(entry => entry.type === 'group' && entry.textKey === textKey)
const messages = (locale: string) => JSON.parse(readFileSync(`${repoRoot}/i18n/locales/${locale}.json`, 'utf8')).navigation as Record<string, string>

describe('main navigation structure', () => {
  it('keeps the top level short', () => {
    expect(navConfig.length).toBeLessThanOrEqual(MAX_TOP_LEVEL)
  })

  it('orders the top level team, blog, community, more', () => {
    expect(navConfig.map(entry => entry.textKey)).toEqual([
      'navigation.team',
      'navigation.blog',
      'navigation.community',
      'navigation.more',
    ])
  })

  it('has no home link on the top level; the logo is the way home', () => {
    const home = navConfig.filter(entry => entry.type === 'link' && entry.routeName === 'index')
    expect(home).toEqual([])
  })

  it('groups the community destinations', () => {
    const community = group('navigation.community')
    const targets = community?.type === 'group' ? community.children.map(child => child.routeName) : []
    expect(targets).toEqual([
      'community',
      'community-poi',
      'projects',
      'events',
    ])
  })

  it('groups server, bluemap and status under more', () => {
    const more = group('navigation.more')
    const children = more?.type === 'group' ? more.children : []
    expect(children.map(child => child.routeName ?? child.path)).toEqual([
      'index',
      'bluemap',
      'https://status.onelitefeather.net',
    ])
    expect(children[0]?.hash).toBe('#connect')
    expect(children[2]?.external).toBe(true)
  })

  it('keeps every destination that was reachable from the navigation', () => {
    const reachable = new Set(links().map(link => link.routeName ?? link.path))
    const expected = [
      'blog',
      'team',
      'community-poi',
      'events',
      'projects',
      'community',
      'bluemap',
      'index',
      'https://status.onelitefeather.net',
    ]
    for (const name of expected) {
      expect(reachable, `${name} reachable`).toContain(name)
    }
    expect(links().some(link => link.hash === '#connect')).toBe(true)
  })

  it('reaches the home page through the logo', () => {
    const bar = readFileSync(`${repoRoot}/layers/navigation/components/NavigationBar.vue`, 'utf8')
    expect(bar).toMatch(/<NuxtLinkLocale to="\/"[^>]*:aria-label="t\('navigation\.home_link'\)"/)
  })

  it.each(['de', 'en'])('has the labels in %s', (locale) => {
    const nav = messages(locale)
    const keys = [
      'builds',
      'home_link',
      'community_overview',
    ]
    for (const key of keys) {
      expect(nav[key], `navigation.${key}`).toBeTruthy()
    }
    expect(nav.overview).toBeUndefined()
    expect(nav.community_poi).toBeUndefined()
  })

  it.each(['de', 'en'])('keeps the visible logo text in the logo link name in %s', (locale) => {
    expect(messages(locale).home_link).toContain('OneLiteFeather')
  })

  it('names the builds entry "Bauwerke" and "Builds"', () => {
    expect(messages('de').builds).toBe('Bauwerke')
    expect(messages('en').builds).toBe('Builds')
  })

  it('builds the schema from navConfig and hardcodes no label', () => {
    const source = readFileSync(`${repoRoot}/layers/navigation/composables/useSiteNavigationSchema.ts`, 'utf8')
    expect(source).toContain('flatten(navConfig)')
    expect(source).not.toMatch(/navigation\.(blog|team|community|builds)/)
  })
})
