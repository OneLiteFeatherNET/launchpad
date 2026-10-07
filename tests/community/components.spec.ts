// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CommunityStats from '../../layers/community/components/CommunityStats.vue'
import CommunityStrip from '../../layers/community/components/CommunityStrip.vue'
import CommunityWall from '../../layers/community/components/CommunityWall.vue'
import { MIN_CONTRIBUTORS_SHOWN } from '../../layers/community/utils/thresholds'
import type { CommunityNumbers, Contributor } from '../../layers/community/types'

const numbers = (overrides: Partial<CommunityNumbers> = {}): CommunityNumbers => ({
  discordMembers: 1234,
  teamSize: 18,
  buildCount: 6,
  contributorCount: 5,
  supporters: 9,
  ...overrides
})

const ada: Contributor = {
  key: 'ada',
  name: 'Ada',
  mcName: 'ada',
  contributions: [
    { kind: 'build', title: 'Yggdrasil', path: '/de/community-poi/yggdrasil' }, { kind: 'event', title: 'Herbstbau', path: '/de/events/herbstbau', place: 1 }
  ]
}

const open = (component: object, props: object) => mountSuspended(component, { props, route: '/de/community' })

describe('CommunityStats', () => {
  it('lists every shown number with its label as a description list', async () => {
    const wrapper = await open(CommunityStats, { numbers: numbers() })
    expect(wrapper.findAll('dl dt')).toHaveLength(4)
    expect(wrapper.findAll('dl dd')).toHaveLength(4)
  })

  it('formats the numbers for the locale', async () => {
    const wrapper = await open(CommunityStats, { numbers: numbers() })
    expect(wrapper.text()).toContain('1.234')
  })

  it('leaves out the Discord tile when there is no count', async () => {
    const wrapper = await open(CommunityStats, { numbers: numbers({ discordMembers: null }) })
    expect(wrapper.findAll('dt')).toHaveLength(3)
    expect(wrapper.text()).not.toContain('Discord')
  })

  it('leaves out the supporters tile when there is no count', async () => {
    const wrapper = await open(CommunityStats, { numbers: numbers({ supporters: null }) })
    expect(wrapper.findAll('dt')).toHaveLength(3)
  })

  it('leaves out any tile whose value is zero', async () => {
    const wrapper = await open(CommunityStats, { numbers: numbers({ buildCount: 0 }) })
    expect(wrapper.text()).not.toContain('Community-Bauten')
  })

  it('hides the contributors tile below the threshold', async () => {
    const few = numbers({ contributorCount: MIN_CONTRIBUTORS_SHOWN - 1 })
    const wrapper = await open(CommunityStats, { numbers: few })
    expect(wrapper.text()).not.toContain('Mitwirkende')
  })

  it('shows the contributors tile at the threshold', async () => {
    const enough = numbers({ contributorCount: MIN_CONTRIBUTORS_SHOWN })
    const wrapper = await open(CommunityStats, { numbers: enough })
    expect(wrapper.text()).toContain('Mitwirkende')
    expect(wrapper.findAll('dt')).toHaveLength(5)
  })
})

describe('CommunityWall', () => {
  it('shows one list item per person', async () => {
    const wrapper = await open(CommunityWall, { contributors: [ada, { ...ada, key: 'bo', name: 'Bo' }] })
    expect(wrapper.findAll('section > ul > li')).toHaveLength(2)
  })

  it('shows the head as decoration, since the name stands beside it', async () => {
    const wrapper = await open(CommunityWall, { contributors: [ada] })
    expect(wrapper.get('img').attributes('alt')).toBe('')
  })

  it('links each contribution to its page', async () => {
    const wrapper = await open(CommunityWall, { contributors: [ada] })
    expect(wrapper.find('a[href="/de/community-poi/yggdrasil"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/de/events/herbstbau"]').exists()).toBe(true)
  })

  it('names the build and the placement in the badges', async () => {
    const text = (await open(CommunityWall, { contributors: [ada] })).text()
    expect(text).toContain('Bau: Yggdrasil')
    expect(text).toContain('Event: 1. Platz Herbstbau')
  })

  it('renders nothing for an empty wall', async () => {
    const wrapper = await open(CommunityWall, { contributors: [] })
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.find('h2').exists()).toBe(false)
  })
})

describe('CommunityStrip', () => {
  it('links to the community page', async () => {
    const wrapper = await open(CommunityStrip, { numbers: numbers(), to: '/de/community' })
    expect(wrapper.find('a[href="/de/community"]').exists()).toBe(true)
  })

  it('shows the numbers', async () => {
    const wrapper = await open(CommunityStrip, { numbers: numbers(), to: '/de/community' })
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('1.234')
  })

  it('shows Discord, team, supporters and builds, in that order', async () => {
    const wrapper = await open(CommunityStrip, { numbers: numbers(), to: '/de/community' })
    expect(wrapper.findAll('dt').map((dt) => dt.text())).toEqual([
      'Discord-Mitglieder',
      'Teammitglieder',
      'Community-Bauten',
      'Unterstützer'
    ])
  })

  it('never shows contributors, however many there are', async () => {
    const many = numbers({ contributorCount: 500 })
    const wrapper = await open(CommunityStrip, { numbers: many, to: '/de/community' })
    expect(wrapper.text()).not.toContain('Mitwirkende')
  })
})
