import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildNavConfig,
  navConfig,
  playLink,
  type NavConfigEntry,
  type NavLinkConfig
} from '../../layers/navigation/navItems'
import { isCurrentNavPath, isNavGroupActive } from '../../layers/navigation/utils/navigation'
import { repoRoot } from '../helpers/sources'

const MAX_TOP_LEVEL = 6

const VARIANTS = [
  { name: 'events in the community group', eventsTopLevel: false }, { name: 'events on the top level', eventsTopLevel: true }
] as const

const links = (config: NavConfigEntry[]): NavLinkConfig[] => config.flatMap(entry => (entry.type === 'group' ? entry.children : [entry]))
const group = (config: NavConfigEntry[], textKey: string) => config.find(entry => entry.type === 'group' && entry.textKey === textKey)
const childrenOf = (config: NavConfigEntry[], textKey: string) => {
  const found = group(config, textKey)
  return found?.type === 'group' ? found.children : []
}
const messages = (locale: string) => JSON.parse(readFileSync(`${repoRoot}/i18n/locales/${locale}.json`, 'utf8')).navigation as Record<string, string>
const pathOf = (link: NavLinkConfig) => link.path ?? `/de/${link.routeName}${link.hash ?? ''}`

describe('main navigation structure', () => {
  it('exports the default config without top-level events', () => {
    expect(navConfig).toEqual(buildNavConfig({ eventsTopLevel: false }))
  })

  it.each(VARIANTS)('keeps the top level short: $name', ({ eventsTopLevel }) => {
    expect(buildNavConfig({ eventsTopLevel }).length).toBeLessThanOrEqual(MAX_TOP_LEVEL)
  })

  it('orders the top level team, blog, community, more without events', () => {
    expect(buildNavConfig({ eventsTopLevel: false }).map(entry => entry.textKey)).toEqual([
      'navigation.team',
      'navigation.blog',
      'navigation.community',
      'navigation.more'
    ])
  })

  it('puts events after blog on the top level when there are live events', () => {
    expect(buildNavConfig({ eventsTopLevel: true }).map(entry => entry.textKey)).toEqual([
      'navigation.team',
      'navigation.blog',
      'navigation.events',
      'navigation.community',
      'navigation.more'
    ])
  })

  it.each(VARIANTS)('has no home link on the top level: $name', ({ eventsTopLevel }) => {
    const home = buildNavConfig({ eventsTopLevel }).filter(entry => entry.type === 'link' && entry.routeName === 'index')
    expect(home).toEqual([])
  })

  it('keeps events last in the community group while no event is live', () => {
    expect(childrenOf(buildNavConfig({ eventsTopLevel: false }), 'navigation.community').map(child => child.routeName))
      .toEqual(['community',
'join',
'community-poi',
'projects',
'events'])
  })

  it('drops events from the community group once it is on the top level', () => {
    expect(childrenOf(buildNavConfig({ eventsTopLevel: true }), 'navigation.community').map(child => child.routeName))
      .toEqual(['community',
'join',
'community-poi',
'projects'])
  })

  it.each(VARIANTS)('holds about, bluemap and status under more: $name', ({ eventsTopLevel }) => {
    const children = childrenOf(buildNavConfig({ eventsTopLevel }), 'navigation.more')
    expect(children.map(child => child.routeName ?? child.path)).toEqual([
      'about',
'bluemap',
'https://status.onelitefeather.net'
    ])
    expect(children[2]?.external).toBe(true)
  })

  it('links the play call to action to the connect section of the home page', () => {
    expect(playLink).toMatchObject({ routeName: 'index', hash: '#connect', textKey: 'navigation.play' })
  })

  it.each(VARIANTS)('keeps every destination reachable: $name', ({ eventsTopLevel }) => {
    const config = buildNavConfig({ eventsTopLevel })
    const reachable = new Set([...links(config), playLink].map(link => link.routeName ?? link.path))
    const expected = [
      'blog',
      'join',
      'team',
      'community-poi',
      'events',
      'projects',
      'community',
      'about',
      'bluemap',
      'index',
      'https://status.onelitefeather.net'
    ]
    for (const name of expected) {
      expect(reachable, `${name} reachable`).toContain(name)
    }
    expect([...links(config), playLink].some(link => link.hash === '#connect')).toBe(true)
  })

  it.each(VARIANTS)('lights the events entry on an event page: $name', ({ eventsTopLevel }) => {
    const config = buildNavConfig({ eventsTopLevel })
    const route = '/de/events/herbst-bauevent'
    const topLink = config.find(entry => entry.type === 'link' && entry.routeName === 'events')
    const community = childrenOf(config, 'navigation.community')
    if (eventsTopLevel) {
      expect(topLink && isCurrentNavPath(route, pathOf(topLink as NavLinkConfig))).toBe(true)
      expect(isNavGroupActive(route, community.map(pathOf))).toBe(false)
    } else {
      expect(topLink).toBeUndefined()
      expect(isNavGroupActive(route, community.map(pathOf))).toBe(true)
    }
  })

  it('reaches the home page through the logo', () => {
    const bar = readFileSync(`${repoRoot}/layers/navigation/components/NavigationBar.vue`, 'utf8')
    expect(bar).toMatch(/<NuxtLinkLocale to="\/"[^>]*:aria-label="t\('navigation\.home_link'\)"/)
  })

  it.each(['de', 'en'])('has the labels in %s', (locale) => {
    const nav = messages(locale)
    const keys = [
      'builds',
      'join',
      'home_link',
      'community_overview',
      'about',
      'play'
    ]
    for (const key of keys) {
      expect(nav[key], `navigation.${key}`).toBeTruthy()
    }
    expect(nav.overview).toBeUndefined()
    expect(nav.community_poi).toBeUndefined()
    expect(nav.server).toBeUndefined()
  })

  it('names the play call to action in both languages', () => {
    expect(messages('de').play).toBe('Spielen')
    expect(messages('en').play).toBe('Play')
  })

  it.each(['de', 'en'])('keeps the visible logo text in the logo link name in %s', (locale) => {
    expect(messages(locale).home_link).toContain('OneLiteFeather')
  })

  it('names the builds entry "Bauwerke" and "Builds"', () => {
    expect(messages('de').builds).toBe('Bauwerke')
    expect(messages('en').builds).toBe('Builds')
  })

  it('builds the schema from the config and hardcodes no label', () => {
    const source = readFileSync(`${repoRoot}/layers/navigation/composables/useSiteNavigationSchema.ts`, 'utf8')
    expect(source).toContain('buildNavConfig')
    expect(source).not.toMatch(/navigation\.(blog|team|community|builds)/)
  })
})
