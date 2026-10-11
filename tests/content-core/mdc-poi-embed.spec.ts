// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PoiEmbed from '../../layers/content-core/components/PoiEmbed.vue'

const fixtures = vi.hoisted(() => [
  {
    slug: 'yggdrasil',
    title: 'Wunderbaum Yggdrasil',
    summary: 'Ein Kirschblütenbaum.',
    status: 'completed',
    progress: 100,
    thumbnail: '/images/community-poi/yggdrasil/cover.webp',
    thumbnailAlt: 'Holzbrücke',
    builders: [{ name: 'Svenko1' }],
    coordinates: { x: 1161, y: 75, z: 339, dimension: 'overworld' }
  },
  {
    slug: 'end-portal',
    title: 'End-Portal in der Oberwelt',
    summary: 'Ein geplantes End-Portal.',
    status: 'planning',
    progress: 0,
    thumbnail: '/images/community-poi/end-portal/cover.webp',
    thumbnailAlt: 'Krater',
    builders: [{ name: 'Svenko1' }]
  }
])

// The embed reads the repository; the test feeds it fixtures, never the content store.
mockNuxtImport('useContentRepository', () => () => ({
  listCommunityPoiEmbedsBySlugs: async (_locale: string, slugs: string[]) => fixtures
    .filter((poi) => slugs.includes(poi.slug))
}))

const mountEmbed = (slug: string) => mountSuspended(PoiEmbed, { route: '/de/blog/test', props: { slug } })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('poi-embed block', () => {
  it('links the title to the POI page in the current locale', async () => {
    const wrapper = await mountEmbed('end-portal')
    expect(wrapper.get('h3 a').attributes('href')).toBe('/de/community-poi/end-portal')
    wrapper.unmount()
  })

  it('shows the progress bar while the build is unfinished', async () => {
    const wrapper = await mountEmbed('end-portal')
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('omits the progress bar once the build is completed', async () => {
    const wrapper = await mountEmbed('yggdrasil')
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows the builders and the coordinates with their copy action', async () => {
    const wrapper = await mountEmbed('yggdrasil')
    expect(wrapper.text()).toContain('Svenko1')
    expect(wrapper.text()).toContain('1161 / 75 / 339')
    wrapper.unmount()
  })

  it('renders nothing for an unknown slug', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = await mountEmbed('does-not-exist')
    expect(wrapper.find('article').exists()).toBe(false)
    wrapper.unmount()
  })

  it('warns in development about an unknown slug', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = await mountEmbed('does-not-exist')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('does-not-exist'))
    wrapper.unmount()
  })
})
