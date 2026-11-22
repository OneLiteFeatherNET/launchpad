// @vitest-environment nuxt
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData, useNuxtApp } from '#imports'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createError } from 'h3'
import { defineComponent, h } from 'vue'
import { useOpenCollective } from '../../layers/opencollective/composables/useOpenCollective'

const probe = defineComponent({
  setup() {
    const { data } = useOpenCollective()
    return () => h('p', { id: 'state' }, data.value.available ? `raised:${data.value.totalRaised}` : 'unavailable')
  }
})

const render = async () => {
  const wrapper = await mountSuspended(probe)
  await flushPromises()
  return wrapper
}

const link = 'https://opencollective.com/onelitefeather'
const stats = { available: true, slug: 'onelitefeather', currency: 'EUR', totalRaised: 120, goal: 3000, contributors: 4, updatedAt: '2026-11-01T00:00:00Z', link }
const outage = { available: false, slug: 'onelitefeather', link }

beforeEach(() => {
  clearNuxtData('opencollective-stats')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useOpenCollective', () => {
  it('passes the numbers through when the route has them', async () => {
    registerEndpoint('/api/opencollective', () => stats)
    expect((await render()).get('#state').text()).toBe('raised:120')
  })

  it('is unavailable, not zero, when the route reports an outage', async () => {
    registerEndpoint('/api/opencollective', () => outage)
    expect((await render()).get('#state').text()).toBe('unavailable')
  })

  it('is unavailable, not zero, when the route itself fails', async () => {
    registerEndpoint('/api/opencollective', () => {
      throw createError({ statusCode: 500 })
    })
    expect((await render()).get('#state').text()).toBe('unavailable')
  })

  it('asks again after hydrating an outage page, and recovers', async () => {
    const route = vi.fn(() => stats)
    registerEndpoint('/api/opencollective', route)
    // What the browser starts from: the payload the server rendered during the outage.
    const nuxtApp = useNuxtApp()
    nuxtApp.payload.data['opencollective-stats'] = outage
    nuxtApp.isHydrating = true
    const wrapper = await mountSuspended(probe)
    nuxtApp.isHydrating = false
    await nuxtApp.hooks.callHook('app:suspense:resolve')
    await vi.waitFor(() => expect(route).toHaveBeenCalledTimes(1))
    await flushPromises()
    expect(wrapper.get('#state').text()).toBe('raised:120')
  })

  it('keeps the section hidden when the retry also finds an outage', async () => {
    const route = vi.fn(() => outage)
    registerEndpoint('/api/opencollective', route)
    const nuxtApp = useNuxtApp()
    nuxtApp.payload.data['opencollective-stats'] = outage
    nuxtApp.isHydrating = true
    const wrapper = await mountSuspended(probe)
    nuxtApp.isHydrating = false
    await nuxtApp.hooks.callHook('app:suspense:resolve')
    await vi.waitFor(() => expect(route).toHaveBeenCalledTimes(1))
    await flushPromises()
    expect(wrapper.get('#state').text()).toBe('unavailable')
    expect(route).toHaveBeenCalledTimes(1)
  })

  it('does not ask again when the first answer had numbers', async () => {
    const route = vi.fn(() => stats)
    registerEndpoint('/api/opencollective', route)
    await render()
    expect(route).toHaveBeenCalledTimes(1)
  })
})
