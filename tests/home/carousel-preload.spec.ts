// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import Carousel from '../../layers/home/components/Carousel.vue'
import CarouselItemProject from '../../layers/home/components/CarouselItemProject.vue'
import { CAROUSEL_IMAGE_SIZES } from '../../layers/home/utils/carouselImage'

// NuxtPicture writes its preload link only on the server, so this client-side
// environment checks what the slides hand it; the emitted <link> is checked in
// the built HTML.
const blog = (title: string) => ({
  type: 'blog' as const, title, href: `/en/blog/${title}`, image: `/images/blog/${title}.webp`, alt: title
})
const project = (extra: Record<string, unknown> = {}) => ({
  type: 'project' as const, title: 'ARCR', href: '/en/projects/arcr', image: '/images/projects/arcr.webp', alt: 'ARCR', ...extra
})

const pictures = (wrapper: Awaited<ReturnType<typeof mountSuspended>>) => wrapper.findAllComponents({ name: 'NuxtPicture' })

describe('Carousel image preload', () => {
  it('asks for a high-priority preload on the first slide only', async () => {
    const wrapper = await mountSuspended(Carousel, { props: { slides: [blog('one'), blog('two')], autoPlay: false }, route: '/en' })
    await wrapper.find('button[aria-label*="2"]').trigger('click')
    const [first, second] = pictures(wrapper)
    expect(first.props('preload')).toEqual({ fetchPriority: 'high' })
    expect(second.props('preload')).toBeFalsy()
  })

  it('renders the source sizes from the shared constant', async () => {
    const wrapper = await mountSuspended(Carousel, { props: { slides: [blog('one')], autoPlay: false }, route: '/en' })
    expect(pictures(wrapper)[0].props('sizes')).toBe(CAROUSEL_IMAGE_SIZES)
    expect(wrapper.find('source').attributes('sizes')).toBeTruthy()
  })

  it('preloads the main image of a project slide with high priority', async () => {
    const wrapper = await mountSuspended(CarouselItemProject, { props: { item: project(), priority: true }, route: '/en' })
    expect(pictures(wrapper)).toHaveLength(1)
    expect(pictures(wrapper)[0].props('preload')).toEqual({ fetchPriority: 'high' })
  })

  it('does not preload the logo of a project slide', async () => {
    const wrapper = await mountSuspended(CarouselItemProject, { props: { item: project({ logoOnly: true }), priority: true }, route: '/en' })
    expect(pictures(wrapper)).toHaveLength(1)
    expect(pictures(wrapper)[0].props('preload')).toBeFalsy()
  })
})
