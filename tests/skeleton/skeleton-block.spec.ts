// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SkeletonBlock from '../../layers/base/components/SkeletonBlock.vue'
import SkeletonImage from '../../layers/base/components/SkeletonImage.vue'
import SkeletonRegion from '../../layers/base/components/SkeletonRegion.vue'
import SkeletonText from '../../layers/base/components/SkeletonText.vue'

const global = { mocks: { $t:(key: string) => key } }

describe('SkeletonBlock', () => {
  it('is hidden from assistive technology', () => {
    expect(mount(SkeletonBlock, { global }).attributes('aria-hidden')).toBe('true')
  })

  it('takes its colour and radius from tokens', () => {
    const classes = mount(SkeletonBlock, { global }).classes()
    expect(classes).toContain('bg-surface-container-high')
    expect(classes).toContain('rounded-medium')
  })

  it('only animates when the visitor allows motion', () => {
    const classes = mount(SkeletonBlock, { global }).classes()
    expect(classes).toContain('motion-safe:animate-pulse')
    expect(classes).not.toContain('animate-pulse')
  })

  it('lets the caller choose the radius token', () => {
    const classes = mount(SkeletonBlock, { props: { shape: 'large' }, global }).classes()
    expect(classes).toContain('rounded-large')
    expect(classes).not.toContain('rounded-medium')
  })
})

describe('SkeletonText', () => {
  it('renders one block per line', () => {
    const wrapper = mount(SkeletonText, { props: { lines: 3 }, global })
    expect(wrapper.findAllComponents(SkeletonBlock)).toHaveLength(3)
  })

  it('shortens the last line', () => {
    const blocks = mount(SkeletonText, { props: { lines: 2 }, global }).findAllComponents(SkeletonBlock)
    expect(blocks[0]!.classes()).not.toContain('w-2/3')
    expect(blocks[1]!.classes()).toContain('w-2/3')
  })
})

describe('SkeletonImage', () => {
  it('keeps the aspect ratio it is given', () => {
    const classes = mount(SkeletonImage, { props: { aspect: 'aspect-video' }, global }).classes()
    expect(classes).toContain('aspect-video')
    expect(classes).toContain('w-full')
  })
})

describe('SkeletonRegion', () => {
  it('marks the area busy and announces a loading text', () => {
    const wrapper = mount(SkeletonRegion, { slots: { default: '<i>x</i>' }, global })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    const status = wrapper.find('[role="status"]')
    expect(status.classes()).toContain('sr-only')
    expect(status.text()).toBe('loading.label')
  })
})
