// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Coords from '../../layers/content-core/components/Coords.vue'

// vueuse captures `window.navigator` when it loads, so stub both references.
const navigators = () => [...new Set<Navigator>([globalThis.navigator, window.navigator])]

/** Replaces the clipboard for one test. Removed again in afterEach. */
function stubClipboard() {
  const writeText = vi.fn(async (_text: string) => {})
  for (const nav of navigators()) {
    Object.defineProperty(nav, 'clipboard', { value: { writeText }, configurable: true })
  }
  return writeText
}

afterEach(() => {
  for (const nav of navigators()) Reflect.deleteProperty(nav, 'clipboard')
})

describe('coords block', () => {
  it('shows the position and the translated dimension', async () => {
    const wrapper = await mountSuspended(Coords, { route: '/de/blog/test', props: { x: 1161, y: 75, z: 339, world: 'overworld' } })
    expect(wrapper.text()).toContain('1161 / 75 / 339')
    expect(wrapper.text()).toContain('Oberwelt')
    wrapper.unmount()
  })

  it('copies the teleport command for the three coordinates', async () => {
    const writeText = stubClipboard()
    const wrapper = await mountSuspended(Coords, { route: '/de/blog/test', props: { x: 1161, y: 75, z: 339 } })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('/tp 1161 75 339')
    wrapper.unmount()
  })

  it('uses a tilde for the height when y is omitted', async () => {
    const writeText = stubClipboard()
    const wrapper = await mountSuspended(Coords, { route: '/de/blog/test', props: { x: 5, z: 6 } })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('/tp 5 ~ 6')
    wrapper.unmount()
  })

  it('names the copy button after the command it copies', async () => {
    stubClipboard()
    const wrapper = await mountSuspended(Coords, { route: '/de/blog/test', props: { x: 1161, y: 75, z: 339 } })
    expect(wrapper.get('button').attributes('aria-label')).toContain('/tp 1161 75 339')
    wrapper.unmount()
  })
})
