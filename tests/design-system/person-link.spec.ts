// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import PersonLink from '../../layers/base/components/PersonLink.vue'

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})
const NuxtImg = defineComponent({
  props: { src: { type: String, required: true }, alt: { type: String, default: '' } },
  setup(props) {
    return () => h('img', { src: props.src, alt: props.alt })
  },
})

const render = (props: Record<string, unknown>) => mount(PersonLink, {
  props: { name: 'TheMeinerLP', to: '/de/team/themeinerlp', ...props },
  global: { stubs: { NuxtLink, NuxtImg } },
})

describe('PersonLink', () => {
  it('links the name to the given path', () => {
    const link = render({}).get('a')
    expect(link.text(), 'link text').toBe('TheMeinerLP')
    expect(link.attributes('href'), 'link target').toBe('/de/team/themeinerlp')
  })

  it('renders a single link even with avatar and role', () => {
    const wrapper = render({ avatar: '/a.png', role: 'Admin' })
    expect(wrapper.findAll('a')).toHaveLength(1)
  })

  it('shows the avatar with the name as alternative text', () => {
    const img = render({ avatar: '/a.png' }).get('img')
    expect(img.attributes('src')).toBe('/a.png')
    expect(img.attributes('alt')).toBe('TheMeinerLP')
  })

  it('omits the avatar when none is given', () => {
    expect(render({}).find('img').exists()).toBe(false)
  })

  it('shows the role as plain text outside the link', () => {
    const wrapper = render({ role: 'Admin' })
    expect(wrapper.text()).toContain('Admin')
    expect(wrapper.get('a').text()).toBe('TheMeinerLP')
  })

  it('omits the role line when none is given', () => {
    expect(render({}).find('p').exists()).toBe(false)
  })
})
