// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CarouselItemBlog from '../../layers/home/components/CarouselItemBlog.vue'

const item = {
  type: 'blog' as const,
  title: 'Release notes',
  href: '/en/blog/release',
  author: 'Phillipp',
  date: '2026-10-05T00:00:00Z'
}

describe('blog slide labels', () => {
  it('renders English wording on the English site', async () => {
    const wrapper = await mountSuspended(CarouselItemBlog, { props: { item }, route: '/en' })
    const text = wrapper.text()
    expect(text).toContain('by Phillipp')
    expect(text).toContain('Read')
    expect(text).not.toMatch(/\bvon\b|Lesen/)
  })

  it('renders German wording on the German site', async () => {
    const wrapper = await mountSuspended(CarouselItemBlog, { props: { item }, route: '/de' })
    expect(wrapper.text()).toContain('von Phillipp')
    expect(wrapper.text()).toContain('Lesen')
  })
})
