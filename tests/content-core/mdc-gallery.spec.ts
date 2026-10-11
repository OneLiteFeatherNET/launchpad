// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import Gallery from '../../layers/content-core/components/Gallery.vue'

const images = [
  { src: '/images/community-poi/yggdrasil/krone-innen.webp', alt: 'Hütten in der Krone', width: 1600, height: 841 }, { src: '/images/community-poi/trident-kupfer-farm/mob-window.webp', alt: 'Ertrunkene hinter Glas', width: 1600, height: 841 }
]

describe('gallery block', () => {
  it('shows an openable tile for every image, named by its position', async () => {
    const wrapper = await mountSuspended(Gallery, { route: '/de/blog/test', props: { images } })
    const tiles = wrapper.findAll('button[aria-label^="Bild"]')
    expect(tiles).toHaveLength(2)
    expect(tiles[0]?.attributes('aria-label')).toBe('Bild 1 von 2 öffnen')
    wrapper.unmount()
  })

  it('keeps the alt text of each image', async () => {
    const wrapper = await mountSuspended(Gallery, { route: '/de/blog/test', props: { images } })
    const alts = wrapper.findAll('img').map((img) => img.attributes('alt'))
    expect(alts).toEqual(expect.arrayContaining(['Hütten in der Krone', 'Ertrunkene hinter Glas']))
    wrapper.unmount()
  })

  it('names the gallery with its translated default label', async () => {
    const wrapper = await mountSuspended(Gallery, { route: '/de/blog/test', props: { images } })
    expect(wrapper.get('section').attributes('aria-label')).toBe('Bildergalerie')
    wrapper.unmount()
  })

  it('renders nothing for an empty image list', async () => {
    const wrapper = await mountSuspended(Gallery, { route: '/de/blog/test', props: { images: [] } })
    expect(wrapper.find('section').exists()).toBe(false)
    wrapper.unmount()
  })
})
