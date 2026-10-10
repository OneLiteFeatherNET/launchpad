// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CarouselItemProject from '../../layers/home/components/CarouselItemProject.vue'

const item = (extra: Record<string, unknown> = {}) => ({
  type: 'project' as const,
  title: 'ARCR',
  href: '/en/projects/arcr',
  ...extra,
})

const slide = (extra?: Record<string, unknown>) => mountSuspended(CarouselItemProject, { props: { item: item(extra) }, route: '/en' })

describe('CarouselItemProject', () => {
  it('contains a logo instead of cropping it to the wide slide', async () => {
    const wrapper = await slide({ image: '/images/projects/arcr.webp', alt: 'ARCR logo' })
    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('ARCR logo')
    expect(img.classes(), 'logo must not be stretched').toContain('object-contain')
    expect(img.classes()).not.toContain('object-cover')
  })

  it('sits the logo on a tinted surface', async () => {
    const wrapper = await slide({ image: '/images/projects/arcr.webp' })
    expect(wrapper.find('[data-testid="project-slide-surface"]').classes().join(' '))
      .toContain('from-surface-container-high')
  })

  it('keeps the surface without an image', async () => {
    const wrapper = await slide()
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[data-testid="project-slide-surface"]').exists()).toBe(true)
  })
})
