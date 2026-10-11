// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import BluemapFacade from '../../layers/base/components/BluemapFacade.vue'
import type { BluemapCoordinates } from '../../layers/base/types'

/**
 * The BlueMap facade shared by the POI page and the blog block. Until the
 * reader presses its button there is no iframe, in the server render or in the
 * DOM, and the box it reserves is the 16:9 box the iframe will fill.
 */

// No real host: the deep link is built from this value.
mockNuxtImport('useRuntimeConfig', original => () => {
  const config = original()
  return { ...config, public: { ...config.public, bluemapUrl: 'https://bluemap.test' } }
})

const coordinates: BluemapCoordinates = { x: 1161, y: 75, z: 339, dimension: 'overworld' }
const props: { title: string, coordinates: BluemapCoordinates } = { title: 'Wunderbaum Yggdrasil', coordinates }
const OVERWORLD_LINK = 'https://bluemap.test/#world:1161:75:339:300:0:0:0:0:flat'

const i18n = () => createI18n<false>({ legacy: false, locale: 'de', messages: { de, en } })

const renderOnServer = (facadeProps = props) => {
  const app = createSSRApp({ render: () => h(BluemapFacade, facadeProps) })
  return renderToString(app.use(i18n()))
}

const mountFacade = (facadeProps = props) => mountSuspended(BluemapFacade, {
  props: facadeProps,
  attachTo: document.body,
})

describe('bluemap facade, server render', () => {
  it('contains no iframe', async () => {
    expect(await renderOnServer()).not.toContain('<iframe')
  })

  it('names the coordinates and links to the map without JavaScript', async () => {
    const html = await renderOnServer()
    expect(html).toContain('1161 / 75 / 339')
    expect(html).toContain(`href="${OVERWORLD_LINK}"`)
  })

  it('reserves the 16:9 box the iframe will fill', async () => {
    expect(await renderOnServer()).toContain('aspect-[16/9]')
  })

  it('links a nether position to the nether map', async () => {
    const html = await renderOnServer({ ...props, coordinates: { ...coordinates, dimension: 'nether' } })
    expect(html).toContain('https://bluemap.test/#world_nether:1161:75:339:')
  })
})

describe('bluemap facade, click to load', () => {
  it('renders no iframe until the button is pressed', async () => {
    const wrapper = await mountFacade()
    expect(wrapper.find('iframe').exists()).toBe(false)
    wrapper.unmount()
  })

  it('mounts the iframe on the deep link when the button is pressed', async () => {
    const wrapper = await mountFacade()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.get('iframe').attributes('src')).toBe(OVERWORLD_LINK)
    wrapper.unmount()
  })

  it('gives the iframe the same 16:9 box as the placeholder', async () => {
    const wrapper = await mountFacade()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.get('iframe').classes()).toContain('aspect-[16/9]')
    wrapper.unmount()
  })
})
