// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import TeamSupporterList from '../../layers/team/components/TeamSupporterList.vue'
import { repoRoot } from '../helpers/sources'

const AVATAR = 'https://opencollective-production.s3.us-west-1.amazonaws.com/a.png'

const supporters = [
  { name: 'Abarzer', image: AVATAR, href: '/de/community#person-abarzer' }, { name: 'marc', image: null, href: '/de/community#person-marc' }
]

const open = (props: { supporters: typeof supporters }) => {
  return mountSuspended(TeamSupporterList, { props, route: '/de/team' })
}

describe('TeamSupporterList', () => {
  it('shows a heading one level below the rank heading', async () => {
    const wrapper = await open({ supporters })
    expect(wrapper.get('h3').text()).toBe('Unsere Lite-Unterstützer')
  })

  it('lists each supporter once, as a list item', async () => {
    const wrapper = await open({ supporters })
    expect(wrapper.findAll('ul > li')).toHaveLength(2)
  })

  it('links each supporter to the card on the community wall', async () => {
    const wrapper = await open({ supporters })
    expect(wrapper.find('a[href="/de/community#person-abarzer"]').text()).toContain('Abarzer')
    expect(wrapper.find('a[href="/de/community#person-marc"]').exists()).toBe(true)
  })

  it('shows the avatar as decoration, since the name stands beside it', async () => {
    const wrapper = await open({ supporters })
    expect(wrapper.get('img').attributes('alt')).toBe('')
  })

  it('shows an initial instead of an image when there is no avatar', async () => {
    const wrapper = await open({ supporters: [supporters[1]!] })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[aria-hidden="true"]').text()).toBe('M')
  })

  it('renders nothing without supporters', async () => {
    const wrapper = await open({ supporters: [] })
    expect(wrapper.find('h3').exists()).toBe(false)
    expect(wrapper.find('ul').exists()).toBe(false)
  })
})

describe('team page', () => {
  const source = readFileSync(join(repoRoot, 'pages/team/index.vue'), 'utf8')

  it('puts the supporter list into the Lite rank only', () => {
    expect(source).toMatch(/group\.rank === 'lite'/)
    expect(source).toMatch(/<TeamSupporterList/)
  })
})
