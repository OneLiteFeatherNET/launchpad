// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { generateTokens } from '../../scripts/md3-tokens.mjs'
import M3Button from '../../layers/base/components/M3Button.vue'
import M3Chip from '../../layers/base/components/M3Chip.vue'
import M3IconButton from '../../layers/base/components/M3IconButton.vue'
import { useInteractiveTag } from '../../layers/base/composables/useInteractiveTag'
import * as variants from '../../layers/base/utils/m3Variants'
import { findViolations } from '../helpers/md3-rules'
import { themeCss } from '../helpers/theme'

/**
 * The M3* primitives are where colour, shape and state decisions live, so
 * they are held to the tokens themselves and to the accessibility promises
 * of spec `ui-primitives`: a real <button> (so Enter and Space work), a
 * required name on icon-only controls, `aria-pressed` on toggles, inert
 * disabled links, and labels that are never focusable.
 */

/** Stands in for Nuxt's NuxtLink outside a Nuxt runtime. */
const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

const global = { stubs: { NuxtLink, IconFa: true } }

describe('useInteractiveTag', () => {
  it('renders a button with type="button" by default', () => {
    const { tag, attrs } = useInteractiveTag({}, NuxtLink)
    expect(tag.value).toBe('button')
    expect(attrs.value).toMatchObject({ type: 'button' })
  })

  it('renders a NuxtLink for an internal route', () => {
    const { tag, attrs } = useInteractiveTag({ to: '/de/team' }, NuxtLink)
    expect(tag.value).toBe('NuxtLink')
    expect(attrs.value).toMatchObject({ to: '/de/team' })
  })

  it('hands <component :is> the resolved link component, never the string', () => {
    // Nuxt does not register NuxtLink globally: the string 'NuxtLink' in
    // `:is` renders a literal <nuxtlink> element that is no link at all.
    const { component } = useInteractiveTag({ to: '/de/team' }, NuxtLink)
    expect(component.value).toBe(NuxtLink)
    expect(useInteractiveTag({}, NuxtLink).component.value).toBe('button')
  })

  it('renders an <a> for an external URL, safe in a new tab', () => {
    const { tag, attrs } = useInteractiveTag({ href: 'https://example.org', target: '_blank' }, NuxtLink)
    expect(tag.value).toBe('a')
    expect(attrs.value).toMatchObject({ href: 'https://example.org', rel: 'noopener noreferrer' })
  })

  it('makes a disabled link inert', () => {
    const { attrs } = useInteractiveTag({ href: 'https://example.org', disabled: true }, NuxtLink)
    expect(attrs.value).toEqual({ 'role': 'link', 'aria-disabled': 'true', 'tabindex': -1 })
  })
})

describe('variant class lists', () => {
  const context = {
    colourTokens: new Set([...themeCss().matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((match) => match[1] ?? ''),),
    allowedColours: new Set(Object.keys(generateTokens())),
  }

  /** Every string anywhere in the exported class maps. */
  function strings(value: unknown): string[] {
    if (typeof value === 'string') return [value]
    if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
    return []
  }

  it('name only MD3 colour roles, shape steps and elevation levels', () => {
    expect(strings(variants).length).toBeGreaterThan(20)
    const found = strings(variants)
      .flatMap((classes) => findViolations(classes, context))
      .map((violation) => `${violation.rule}: ${violation.found}`)
    expect(found).toEqual([])
  })

  it('carry no dark: variant — the roles switch schemes themselves', () => {
    expect(strings(variants).filter((classes) => /\bdark:/.test(classes))).toEqual([])
  })
})

describe('M3Button', () => {
  it('is a filled, fully rounded <button type="button"> by default', () => {
    const wrapper = mount(M3Button, { slots: { default: 'Bewerben' }, global })
    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toEqual(expect.arrayContaining([
      'bg-primary',
      'text-on-primary',
      'rounded-full',
    ]))
    expect(button.text()).toBe('Bewerben')
  })

  it('is a native button, so Enter and Space trigger it like a click', async () => {
    const wrapper = mount(M3Button, { slots: { default: 'Go' }, global })
    const button = wrapper.get('button')
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('tabindex')).toBeUndefined()
    await button.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('opens an external link in a new tab safely', () => {
    const wrapper = mount(M3Button, {
      props: { href: 'https://1lf.link/discord', target: '_blank' },
      slots: { default: 'Discord' },
      global,
    })
    const link = wrapper.get('a')
    expect(link.attributes()).toMatchObject({
      href: 'https://1lf.link/discord',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('renders an internal route as a NuxtLink', () => {
    const wrapper = mount(M3Button, { props: { to: '/de/blog' }, slots: { default: 'Blog' }, global })
    expect(wrapper.get('a').attributes('href')).toBe('/de/blog')
  })

  it('does nothing when disabled and shows the MD3 disabled look', async () => {
    const wrapper = mount(M3Button, { props: { disabled: true }, slots: { default: 'Go' }, global })
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toEqual(expect.arrayContaining(['disabled:bg-on-surface/12', 'disabled:text-on-surface/38']))
    await button.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('narrows the padding on the side of a leading icon', () => {
    const plain = mount(M3Button, { slots: { default: 'Go' }, global })
    const withIcon = mount(M3Button, { props: { icon: ['fas', 'check'] }, slots: { default: 'Go' }, global })
    expect(plain.get('button').classes()).toContain('px-6')
    expect(withIcon.get('button').classes()).toEqual(expect.arrayContaining(['pl-4', 'pr-6']))
  })

  it('keeps layout classes the caller adds', () => {
    const wrapper = mount(M3Button, { attrs: { class: 'w-full mt-4' }, slots: { default: 'Go' }, global })
    expect(wrapper.get('button').classes()).toEqual(expect.arrayContaining([
      'w-full',
      'mt-4',
      'bg-primary',
    ]))
  })

  it('re-renders when the variant changes after mount', async () => {
    const wrapper = mount(M3Button, { props: { variant: 'filled' }, slots: { default: 'Go' }, global })
    await wrapper.setProps({ variant: 'outlined' })
    expect(wrapper.get('button').classes()).toContain('border-outline')
    expect(wrapper.get('button').classes()).not.toContain('bg-primary')
  })
})

describe('M3IconButton', () => {
  it('takes its accessible name from the required label', () => {
    const wrapper = mount(M3IconButton, {
      props: { icon: ['fas', 'bars'], label: 'Menü öffnen' },
      global,
    })
    const button = wrapper.get('button')
    expect(button.attributes('aria-label')).toBe('Menü öffnen')
    expect(button.attributes('aria-pressed')).toBeUndefined()
  })

  it('reports its state as a toggle', async () => {
    const wrapper = mount(M3IconButton, {
      props: { icon: ['fas', 'check'], label: 'Merken', variant: 'filled', selected: false },
      global,
    })
    const button = wrapper.get('button')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.classes()).toContain('bg-surface-container-highest')
    await wrapper.setProps({ selected: true })
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.classes()).toContain('bg-primary')
  })

  it('passes aria attributes through to the button', () => {
    const wrapper = mount(M3IconButton, {
      props: { icon: ['fas', 'bars'], label: 'Menü' },
      attrs: { 'aria-expanded': 'false', 'aria-controls': 'mobile-menu' },
      global,
    })
    expect(wrapper.get('button').attributes()).toMatchObject({
      'aria-expanded': 'false',
      'aria-controls': 'mobile-menu',
    })
  })

  it('grows its visible size but always keeps the 48px touch target', () => {
    const wrapper = mount(M3IconButton, {
      props: { icon: ['fas', 'bars'], label: 'Menü', size: 'sm' },
      global,
    })
    expect(wrapper.get('button').classes()).toEqual(expect.arrayContaining(['size-8', 'touch-target']))
  })
})

describe('M3Chip', () => {
  it('reports a selected filter through aria-pressed and a check mark', () => {
    const wrapper = mount(M3Chip, {
      props: { kind: 'filter', label: 'Fertig', selected: true },
      global,
    })
    const chip = wrapper.get('button')
    expect(chip.attributes('aria-pressed')).toBe('true')
    expect(chip.classes()).toContain('bg-secondary-container')
    expect(wrapper.findComponent({ name: 'IconFa' }).attributes('icon')).toBe('fas,check')
  })

  it('renders an unselected filter without the check mark', () => {
    const wrapper = mount(M3Chip, { props: { kind: 'filter', label: 'Fertig' }, global })
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
    expect(wrapper.findComponent({ name: 'IconFa' }).exists()).toBe(false)
  })

  it('renders a status label as a plain, unfocusable span', () => {
    const wrapper = mount(M3Chip, {
      props: { kind: 'label', label: 'Im Bau', color: 'brand-orange' },
      global,
    })
    const chip = wrapper.get('span')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(chip.attributes('role')).toBeUndefined()
    expect(chip.attributes('tabindex')).toBeUndefined()
    expect(chip.classes()).toContain('bg-brand-orange-container')
    expect(chip.classes()).not.toContain('state-layer')
    expect(chip.text()).toBe('Im Bau')
  })

  it('renders a neutral outlined label without a colour', () => {
    const wrapper = mount(M3Chip, { props: { kind: 'label', label: 'nuxt' }, global })
    expect(wrapper.get('span').classes()).toContain('border-outline-variant')
  })
})
