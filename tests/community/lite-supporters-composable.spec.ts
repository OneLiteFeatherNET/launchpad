// @vitest-environment nuxt
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData } from '#imports'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createError } from 'h3'
import { defineComponent, h } from 'vue'
import { useLiteSupporters } from '../../layers/opencollective/composables/useLiteSupporters'

const probe = defineComponent({
  setup() {
    const { supporters } = useLiteSupporters()
    return () => h('p', { id: 'names' }, supporters.value.map((s) => s.name).join(','))
  }
})

const render = async () => {
  const wrapper = await mountSuspended(probe)
  await flushPromises()
  return wrapper.get('#names').text()
}

beforeEach(() => {
  clearNuxtData('lite-supporters')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useLiteSupporters', () => {
  it('passes the list from the route through', async () => {
    registerEndpoint('/api/community/supporters', () => ({
      supporters: [
        { name: 'Ada', image: null, profile: 'https://opencollective.com/ada' },
        { name: 'Bo', image: null, profile: 'https://opencollective.com/bo' }
      ]
    }))
    expect(await render()).toBe('Ada,Bo')
  })

  it('yields an empty list instead of throwing when the route fails', async () => {
    registerEndpoint('/api/community/supporters', () => {
      throw createError({ statusCode: 500 })
    })
    expect(await render()).toBe('')
  })
})
