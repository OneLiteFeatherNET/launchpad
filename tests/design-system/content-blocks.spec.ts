// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import DateRange from '../../layers/base/components/DateRange.vue'
import EmptyState from '../../layers/base/components/EmptyState.vue'
import MediaGallery from '../../layers/base/components/MediaGallery.vue'
import ResourceList from '../../layers/base/components/ResourceList.vue'
import { formatDateRange } from '../../layers/base/utils/dateRange'

/**
 * The shared content blocks from spec `shared-content-blocks`: gallery,
 * resource list, date range and empty state. They sit in `base`, so several
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

describe('formatDateRange', () => {
  const berlin = 'Europe/Berlin'

  it('names the date once for a single day, in Berlin time whatever the machine says', () => {
    // Given as UTC: 16:00Z is 18:00 in Berlin summer time.
    const range = formatDateRange({ start: '2026-10-01T16:00:00Z', end: '2026-10-01T19:00:00Z', locale: 'de', timeZone: berlin })
    expect(range?.sameDay).toBe(true)
    expect(range?.startText).toBe('01.10.2026, 18:00')
    expect(range?.endText).toBe('21:00 MESZ')
    expect(range?.startIso).toBe('2026-10-01T16:00:00.000Z')
  })

  it('produces the same text on a UTC server and in a New York browser', () => {
    // Node re-reads TZ when it changes, which stands in for the two runtimes.
    const options = { start: '2026-10-01T18:00:00+02:00', locale: 'en', timeZone: berlin }
    const previous = process.env.TZ
    try {
      process.env.TZ = 'UTC'
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('UTC')
      const server = formatDateRange(options)
      process.env.TZ = 'America/New_York'
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/New_York')
      const browser = formatDateRange(options)
      expect(browser).toEqual(server)
      expect(browser?.startText).toBe('1 Oct 2026, 18:00 CEST')
    } finally {
      process.env.TZ = previous
    }
  })

  it('writes both dates for a span across days', () => {
    const range = formatDateRange({ start: '2026-10-01T18:00:00+02:00', end: '2026-10-14T23:59:00+02:00', locale: 'de', timeZone: berlin })
    expect(range?.sameDay).toBe(false)
    expect(range?.startText).toBe('01.10.2026, 18:00')
    expect(range?.endText).toBe('14.10.2026, 23:59 MESZ')
  })

  it('returns null for an unreadable start', () => {
    expect(formatDateRange({ start: 'bald', locale: 'de', timeZone: berlin })).toBeNull()
  })
})

describe('DateRange', () => {
  it('marks both ends up as <time datetime>', () => {
    const wrapper = mount(DateRange, {
      props: { start: '2026-10-01T18:00:00+02:00', end: '2026-10-01T21:00:00+02:00' },
      global: global(),
    })
    const times = wrapper.findAll('time')
    expect(times.map((node) => node.attributes('datetime'))).toEqual(['2026-10-01T16:00:00.000Z', '2026-10-01T19:00:00.000Z'])
    expect(wrapper.text()).toBe('01.10.2026, 18:00–21:00 MESZ')
  })
})

describe('EmptyState', () => {
  it('is a plain note with a focusable action, never an alert', () => {
    const wrapper = mount(EmptyState, {
      props: { text: 'Gerade läuft kein Event.', actionLabel: 'Discord', actionHref: 'https://discord.gg/x' },
      global: global(),
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    const action = wrapper.get('a')
    expect(action.attributes('href')).toBe('https://discord.gg/x')
    expect(action.classes()).toContain('focus-ring')
  })

  it('leaves the action out without a target', () => {
    const wrapper = mount(EmptyState, { props: { text: 'Leer', actionLabel: 'Nirgendwohin' }, global: global() })
    expect(wrapper.find('a, button').exists()).toBe(false)
  })
})
