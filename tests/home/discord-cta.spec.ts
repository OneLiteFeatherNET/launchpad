// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import DiscordCta from '../../layers/home/components/DiscordCta.vue'

const HREF = 'https://1lf.link/discord'

const open = (props: { members: number | null }) => {
  return mountSuspended(DiscordCta, { props: { href: HREF, ...props }, route: '/de' })
}

describe('DiscordCta', () => {
  it('is a labelled section with an h2', async () => {
    const wrapper = await open({ members: 1234 })
    const section = wrapper.get('section')
    const heading = wrapper.get('h2')
    expect(section.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(wrapper.find('h1').exists()).toBe(false)
  })

  it('joins through a real external link with a safe rel', async () => {
    const link = (await open({ members: 1234 })).get('a')
    expect(link.attributes('href')).toBe(HREF)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.text()).toContain('Discord beitreten')
  })

  it('names the member count formatted for the locale', async () => {
    expect((await open({ members: 1234 })).text()).toContain('1.234')
  })

  it('leaves out only the count when there is none', async () => {
    const wrapper = await open({ members: null })
    expect(wrapper.text()).not.toMatch(/\d/)
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('a[href]').exists()).toBe(true)
  })

  it('leaves out a count of zero', async () => {
    expect((await open({ members: 0 })).text()).not.toMatch(/\d/)
  })
})
