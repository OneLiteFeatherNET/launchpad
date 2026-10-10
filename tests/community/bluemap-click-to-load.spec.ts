// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CommunityPoiBluemap from '../../layers/community-poi/components/CommunityPoiBluemap.vue'

/**
 * The embedded BlueMap used to start loading at page load, so a POI page cost
 * hundreds of requests before the reader asked for the map. The iframe is now
 * mounted only on activation; until then a placeholder with the same box
 * stands in for it.
 */

// No real host: the deep link is built from this value, so the assertion
// below does not depend on the production URL.
mockNuxtImport('useRuntimeConfig', original => () => {
  const config = original()
  return { ...config, public: { ...config.public, bluemapUrl: 'https://bluemap.test' } }
})

const props = {
  title: 'Yggdrasil',
  coordinates: { x: 10, y: 64, z: -20, dimension: 'overworld' as const },
}

const mountBluemap = () => mountSuspended(CommunityPoiBluemap, {
  route: '/de/community-poi/yggdrasil',
  props,
  attachTo: document.body,
})

// The coordinates block has its own button, so select the placeholder by name.
const loadButton = (wrapper: Awaited<ReturnType<typeof mountBluemap>>) => wrapper
  .findAll('button')
  .find(button => button.text() === 'Karte laden')

describe('community poi bluemap, click to load', () => {
  it('renders no iframe until the map is requested', async () => {
    const wrapper = await mountBluemap()
    expect(wrapper.find('iframe').exists()).toBe(false)
    wrapper.unmount()
  })

  it('offers a button named "Karte laden" as the placeholder', async () => {
    const wrapper = await mountBluemap()
    expect(loadButton(wrapper)?.exists()).toBe(true)
    wrapper.unmount()
  })

  it('mounts the iframe on the deep link when the button is clicked', async () => {
    const wrapper = await mountBluemap()
    await loadButton(wrapper)!.trigger('click')
    await flushPromises()
    const src = wrapper.get('iframe').attributes('src')
    expect(src).toBe('https://bluemap.test/#world:10:64:-20:300:0:0:0:0:flat')
    wrapper.unmount()
  })

  it('moves focus into the iframe once it is mounted', async () => {
    const wrapper = await mountBluemap()
    await loadButton(wrapper)!.trigger('click')
    await flushPromises()
    expect(document.activeElement).toBe(wrapper.get('iframe').element)
    wrapper.unmount()
  })
})
