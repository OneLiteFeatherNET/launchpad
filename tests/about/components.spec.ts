// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AboutJoin from '../../layers/about/components/AboutJoin.vue'
import AboutPillars from '../../layers/about/components/AboutPillars.vue'
import type { AboutPillar } from '../../layers/about/types'

const pillars: AboutPillar[] = [
  { icon: 'cube', title: 'Gemeinsam bauen', text: 'Text eins', to: '/community-poi' }, { icon: 'code', title: 'Offen geteilt', text: 'Text zwei', to: '/projects' }
]

const open = (component: object, props: object, route = '/de/about') => mountSuspended(component, { props, route })

describe('AboutPillars', () => {
  it('lists one item per pillar with a decorative icon', async () => {
    const wrapper = await open(AboutPillars, { pillars })
    expect(wrapper.findAll('ul > li')).toHaveLength(2)
    for (const icon of wrapper.findAll('svg')) expect(icon.attributes('aria-hidden')).toBe('true')
  })

  it('links each title to the localized target', async () => {
    const wrapper = await open(AboutPillars, { pillars }, '/en/about')
    const links = wrapper.findAll('a')
    expect(links.map(a => a.attributes('href'))).toEqual(['/en/community-poi', '/en/projects'])
    expect(links.map(a => a.text())).toEqual(['Gemeinsam bauen', 'Offen geteilt'])
  })

  it('renders nothing without pillars', async () => {
    const wrapper = await open(AboutPillars, { pillars: [] })
    expect(wrapper.find('ul').exists()).toBe(false)
  })
})

describe('AboutJoin', () => {
  const props = { discordUrl: 'https://1lf.link/discord' }
  const hrefs = (wrapper: Awaited<ReturnType<typeof open>>) => wrapper.findAll('a').map(a => a.attributes('href'))

  it('offers play, discord, apply and support', async () => {
    expect(hrefs(await open(AboutJoin, props))).toEqual([
      '/de#connect',
      'https://1lf.link/discord',
      '/de/team',
      'https://opencollective.com/onelitefeather'
    ])
  })

  it('opens external links in a new tab without leaking the opener', async () => {
    const wrapper = await open(AboutJoin, props)
    const external = wrapper.findAll('a').filter(a => /^https?:/.test(a.attributes('href') ?? ''))
    expect(external).toHaveLength(2)
    for (const a of external) {
      expect(a.attributes('target')).toBe('_blank')
      expect(a.attributes('rel')).toContain('noopener')
      expect(a.attributes('rel')).toContain('noreferrer')
    }
  })

  it('follows the page locale', async () => {
    expect(hrefs(await open(AboutJoin, props, '/en/about'))[0]).toBe('/en#connect')
  })
})
