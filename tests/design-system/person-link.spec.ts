// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import PersonLink from '../../layers/base/components/PersonLink.vue'

const render = (props: Record<string, unknown>) => mountSuspended(PersonLink, {
  props: { name: 'TheMeinerLP', to: '/de/team/themeinerlp', ...props },
})

describe('PersonLink', () => {
  it('links the name to the given path', async () => {
    const link = (await render({})).get('a')
    expect(link.text(), 'link text').toBe('TheMeinerLP')
    expect(link.attributes('href'), 'link target').toBe('/de/team/themeinerlp')
  })

  it('renders a single link even with avatar and role', async () => {
    const wrapper = await render({ avatar: '/a.png', role: 'Admin' })
    expect(wrapper.findAll('a')).toHaveLength(1)
  })

  it('shows the avatar with the name as alternative text', async () => {
    const img = (await render({ avatar: '/a.png' })).get('img')
    expect(img.attributes('src')).toBe('/a.png')
    expect(img.attributes('alt')).toBe('TheMeinerLP')
  })

  it('omits the avatar when none is given', async () => {
    expect((await render({})).find('img').exists()).toBe(false)
  })

  it('shows the role as plain text outside the link', async () => {
    const wrapper = await render({ role: 'Admin' })
    expect(wrapper.text()).toContain('Admin')
    expect(wrapper.get('a').text()).toBe('TheMeinerLP')
  })

  it('omits the role line when none is given', async () => {
    expect((await render({})).find('p').exists()).toBe(false)
  })
})
