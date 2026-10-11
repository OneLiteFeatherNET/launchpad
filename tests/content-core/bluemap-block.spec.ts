// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import Bluemap from '../../layers/content-core/components/Bluemap.vue'

/**
 * The `::bluemap` markdown block: the BlueMap facade positioned from the
 * attributes an author writes in a blog post.
 */

// No real host: the deep link is built from this value.
mockNuxtImport('useRuntimeConfig', original => () => {
  const config = original()
  return { ...config, public: { ...config.public, bluemapUrl: 'https://bluemap.test' } }
})

// Attributes as markdown passes them: strings.
const attributes = { title: 'Wunderbaum Yggdrasil', x: '1161', y: '75', z: '339', world: 'overworld' }

const mountBlock = (overrides: Record<string, unknown> = {}) => mountSuspended(Bluemap, {
  props: { ...attributes, ...overrides },
  attachTo: document.body,
})

const i18n = () => createI18n<false>({ legacy: false, locale: 'de', messages: { de, en } })

describe('bluemap markdown block', () => {
  it('renders no iframe until the reader asks for the map', async () => {
    const wrapper = await mountBlock()
    expect(wrapper.find('iframe').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows the title and the coordinates as visible text', async () => {
    const wrapper = await mountBlock()
    expect(wrapper.text()).toContain('Wunderbaum Yggdrasil')
    expect(wrapper.text()).toContain('1161 / 75 / 339')
    wrapper.unmount()
  })

  it('points the iframe at the markdown coordinates once activated', async () => {
    const wrapper = await mountBlock()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.get('iframe').attributes('src')).toBe('https://bluemap.test/#world:1161:75:339:300:0:0:0:0:flat')
    wrapper.unmount()
  })

  it('accepts numeric attributes as well as strings', async () => {
    const wrapper = await mountBlock({ x: 1161, y: 75, z: 339 })
    expect(wrapper.text()).toContain('1161 / 75 / 339')
    wrapper.unmount()
  })

  it('centres on height 70 when y is omitted', async () => {
    const wrapper = await mountBlock({ y: undefined })
    expect(wrapper.text()).toContain('1161 / 339')
    expect(wrapper.find('a').attributes('href')).toBe('https://bluemap.test/#world:1161:70:339:300:0:0:0:0:flat')
    wrapper.unmount()
  })

  it('links to the nether map for world="nether"', async () => {
    const wrapper = await mountBlock({ world: 'nether' })
    expect(wrapper.find('a').attributes('href')).toContain('#world_nether:1161:75:339:')
    wrapper.unmount()
  })

  it('falls back to the overworld for an unknown world', async () => {
    const wrapper = await mountBlock({ world: 'moon' })
    expect(wrapper.find('a').attributes('href')).toContain('#world:1161:75:339:')
    wrapper.unmount()
  })

  it('renders nothing when a coordinate is not a number', async () => {
    const wrapper = await mountBlock({ x: 'nordwest' })
    expect(wrapper.find('section').exists()).toBe(false)
    wrapper.unmount()
  })

  it('server render carries the coordinates and a plain link, but no iframe', async () => {
    const app = createSSRApp({ render: () => h(Bluemap, attributes) })
    const html = await renderToString(app.use(i18n()))
    expect(html).toContain('1161 / 75 / 339')
    expect(html).toContain('href="https://bluemap.test/#world:1161:75:339:300:0:0:0:0:flat"')
    expect(html).not.toContain('<iframe')
  })
})
