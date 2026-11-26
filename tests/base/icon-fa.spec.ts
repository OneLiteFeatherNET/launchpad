// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { faHome, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import IconFa from '../../layers/base/components/IconFa.vue'

describe('IconFa', () => {
  it('renders an imported definition as a decorative svg with its viewBox and path', () => {
    const [width,
height, , , path] = faHome.icon
    const svg = mount(IconFa, { props: { icon: faHome } }).find('svg')

    expect(svg.exists()).toBe(true)
    expect(svg.attributes('viewBox')).toBe(`0 0 ${width} ${height}`)
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.find('path').attributes('d')).toBe(path)
  })

  it('resolves the string form against the registry', () => {
    const svg = mount(IconFa, { props: { icon: ['fas', 'arrow-right'] } }).find('svg')
    expect(svg.find('path').attributes('d')).toBe(faArrowRight.icon[4])
  })

  it('resolves a Font Awesome alias such as `times`', () => {
    const svg = mount(IconFa, { props: { icon: ['fas', 'times'] } }).find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('resolves a brand icon', () => {
    const svg = mount(IconFa, { props: { icon: ['fab', 'discord'] } }).find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('forwards classes and attributes to the svg', () => {
    const svg = mount(IconFa, { props: { icon: faHome }, attrs: { class: 'size-5', 'data-x': '1' } }).find('svg')
    expect(svg.classes()).toContain('size-5')
    expect(svg.attributes('data-x')).toBe('1')
  })

  it('renders nothing for an icon that is not registered', () => {
    const wrapper = mount(IconFa, { props: { icon: ['fas', 'no-such-icon'] } })
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
