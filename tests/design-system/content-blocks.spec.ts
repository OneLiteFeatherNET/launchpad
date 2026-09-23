// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import MediaGallery from '../../layers/base/components/MediaGallery.vue'
import ResourceList from '../../layers/base/components/ResourceList.vue'

/**
 * The shared content blocks from spec `shared-content-blocks`: gallery and
 * resource list. They sit in `base`, so several
 * domains lean on them at once — the promises are pinned here rather than in
 * any one domain's tests.
 */

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

const NuxtPicture = defineComponent({
  props: { src: String, alt: String },
  setup(props) {
    return () => h('img', { src: props.src, alt: props.alt })
  },
})

const i18n = (locale: 'de' | 'en' = 'de') => createI18n<false>({ legacy: false, locale, messages: { de, en } })
const global = (locale: 'de' | 'en' = 'de') => ({
  stubs: { NuxtLink, NuxtPicture, IconFa: true },
  plugins: [i18n(locale)],
})

const images = [
  { src: '/a.webp', alt: 'Bild A', caption: 'Erstes' },
  { src: '/b.webp', alt: 'Bild B' },
  { src: '/c.webp', alt: 'Bild C' },
]

const key = (name: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key: name }))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MediaGallery', () => {
  it('renders nothing without images', () => {
    const wrapper = mount(MediaGallery, { props: { images: [], label: 'Galerie' }, global: global() })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('opens on a thumbnail, pages with the arrows, closes on Escape and returns focus', async () => {
    const wrapper = mount(MediaGallery, {
      props: { images, label: 'Galerie' },
      global: global(),
      attachTo: document.body,
    })
    const thumbnails = wrapper.findAll('li button')
    expect(thumbnails).toHaveLength(3)
    // A native <button>: Enter and Space activate it through `click`.
    expect(thumbnails[1]!.element.tagName).toBe('BUTTON')
    expect(thumbnails[1]!.attributes('aria-label')).toBe('Bild 2 von 3 öffnen')

    ;(thumbnails[1]!.element as HTMLButtonElement).focus()
    await thumbnails[1]!.trigger('click')
    await nextTick()
    const dialog = () => document.querySelector('[role="dialog"]')
    expect(dialog()?.getAttribute('aria-label')).toBe('Galerie')
    expect(dialog()?.querySelector('img')?.getAttribute('alt')).toBe('Bild B')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Galerie schließen')

    key('ArrowRight')
    await nextTick()
    expect(dialog()?.querySelector('img')?.getAttribute('alt')).toBe('Bild C')
    key('ArrowRight')
    await nextTick()
    expect(dialog()?.querySelector('img')?.getAttribute('alt')).toBe('Bild A')
    key('ArrowLeft')
    await nextTick()
    expect(dialog()?.querySelector('img')?.getAttribute('alt')).toBe('Bild C')

    key('Escape')
    await nextTick()
    await nextTick()
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(thumbnails[1]!.element)
    wrapper.unmount()
  })
})

describe('ResourceList', () => {
  const resources = [
    { kind: 'link' as const, name: 'Regelwerk', url: 'https://example.org/regeln' }, { kind: 'schematic' as const, name: 'Hafen', url: '/schematics/hafen.litematic', format: 'litematic', version: '1.21', sizeLabel: '2 MB', meta: ['Litematica 0.19'] },
  ]

  it('opens external targets safely in a new tab and says so', () => {
    const wrapper = mount(ResourceList, { props: { resources, label: 'Ressourcen' }, global: global() })
    const link = wrapper.get('a[href="https://example.org/regeln"]')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain('Öffnen')
    expect(link.get('.sr-only').text()).toBe('(öffnet in neuem Tab)')
  })

  it('offers internal files as downloads with their facts', () => {
    const wrapper = mount(ResourceList, { props: { resources, label: 'Ressourcen' }, global: global() })
    const file = wrapper.get('a[href="/schematics/hafen.litematic"]')
    expect(file.attributes('download')).toBe('Hafen')
    expect(file.attributes('target')).toBeUndefined()
    expect(file.find('.sr-only').exists()).toBe(false)
    const text = wrapper.text()
    for (const fact of ['.litematic',
'MC 1.21',
'Litematica 0.19',
'2 MB']) expect(text).toContain(fact)
  })

  it('hands each resource to the details slot', () => {
    const wrapper = mount(ResourceList, {
      props: { resources, label: 'Ressourcen' },
      slots: { details: ({ resource }: { resource: { name: string } }) => h('p', { class: 'details' }, `Setup ${resource.name}`) },
      global: global(),
    })
    expect(wrapper.findAll('.details').map((node) => node.text())).toEqual(['Setup Regelwerk', 'Setup Hafen'])
  })

  it('renders nothing without resources', () => {
    const wrapper = mount(ResourceList, { props: { resources: [], label: 'Ressourcen' }, global: global() })
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
