// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useClientNow } from '../../layers/base/composables/useClientNow'
import { CLIENT_CLOCK_KEY } from '../../layers/base/utils/clientClock'
import { manualClock } from '../helpers/manualClock'

const Probe = defineComponent({
  setup() {
    const now = useClientNow()
    return () => h('p', String(now.value))
  }
})

const START = Date.UTC(2026, 9, 30, 12, 0, 0)

describe('useClientNow', () => {
  it('is null in the server render', async () => {
    const html = await renderToString(createSSRApp(Probe))
    expect(html).toContain('null')
  })

  it('takes the clock reading once mounted', async () => {
    const clock = manualClock(START)
    const wrapper = mount(Probe, { global: { provide: { [CLIENT_CLOCK_KEY as symbol]: clock } } })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe(String(START))
  })

  it('follows the clock on every tick', async () => {
    const clock = manualClock(START)
    const wrapper = mount(Probe, { global: { provide: { [CLIENT_CLOCK_KEY as symbol]: clock } } })
    await wrapper.vm.$nextTick()
    clock.advance(1000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe(String(START + 1000))
  })

  it('stops ticking after unmount', () => {
    const clock = manualClock(START)
    const wrapper = mount(Probe, { global: { provide: { [CLIENT_CLOCK_KEY as symbol]: clock } } })
    expect(clock.activeTimers(), 'a timer runs while mounted').toBe(1)
    wrapper.unmount()
    expect(clock.activeTimers(), 'no timer survives unmount').toBe(0)
  })
})
