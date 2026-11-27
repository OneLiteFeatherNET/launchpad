// @vitest-environment nuxt
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Carousel from '../../layers/home/components/Carousel.vue'

const blog = (title: string) => ({
  type: 'blog' as const, title, href: `/en/blog/${title}`, image: `/images/blog/${title}.webp`, alt: title
})
const slides = () => [blog('one'),
blog('two'),
blog('three')]

type Wrapper = Awaited<ReturnType<typeof mountCarousel>>

const mountCarousel = async (props: Record<string, unknown> = {}) => {
  const wrapper = await mountSuspended(Carousel, { props: { slides: slides(), autoPlay: false, ...props }, route: '/en' })
  await flushPromises()
  return wrapper
}
const images = (w: Wrapper) => w.findAll('img').map(i => i.attributes('alt'))
const hidden = (w: Wrapper, i: number) => w.find(`#carousel-slide-${i}`).attributes('aria-hidden')
// Nuxt compiles requestIdleCallback to its own setTimeout(1) polyfill here, so
// advancing fake time is what runs the idle callback.
const advance = async (w: Wrapper, ms: number) => {
  vi.advanceTimersByTime(ms)
  await w.vm.$nextTick()
}

describe('Carousel image arming', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('renders an image only for the first slide before idle', async () => {
    const wrapper = await mountCarousel()
    expect(images(wrapper)).toEqual(['one'])
    expect(wrapper.findAll('[role="group"]'), 'every slide keeps its box').toHaveLength(3)
    expect(wrapper.text()).toContain('three')
  })

  it('keeps the high-priority preload on the first slide only', async () => {
    const wrapper = await mountCarousel()
    const pictures = wrapper.findAllComponents({ name: 'NuxtPicture' })
    expect(pictures).toHaveLength(1)
    expect(pictures[0]!.props('preload')).toEqual({ fetchPriority: 'high' })
  })

  it('arms the next slide on idle', async () => {
    const wrapper = await mountCarousel()
    await advance(wrapper, 1)
    expect(images(wrapper)).toEqual(['one', 'two'])
  })

  it('arms the target slide when the visitor navigates before idle', async () => {
    const wrapper = await mountCarousel()
    await wrapper.find('button[aria-label*="3"]').trigger('click')
    expect(images(wrapper)).toContain('three')
    expect(hidden(wrapper, 2)).toBe('false')
  })

  it('keeps a slide armed after leaving it', async () => {
    const wrapper = await mountCarousel()
    await wrapper.find('button[aria-label*="2"]').trigger('click')
    await wrapper.find('button[aria-label*="1"]').trigger('click')
    expect(images(wrapper)).toContain('two')
  })

  it('arms an unarmed slide before autoplay advances to it', async () => {
    const wrapper = await mountCarousel({ autoPlay: true, interval: 1 })
    // The interval is created before the idle callback, so it fires first.
    await advance(wrapper, 1)
    expect(hidden(wrapper, 1), 'armed but not shown yet').toBe('true')
    expect(images(wrapper)).toContain('two')
    await advance(wrapper, 1)
    expect(hidden(wrapper, 1)).toBe('false')
  })
})
