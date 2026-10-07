// @vitest-environment nuxt
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData } from '#imports'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createError } from 'h3'
import { defineComponent, h } from 'vue'
import { useDiscordMembers } from '../../layers/community/composables/useDiscordMembers'

const probe = defineComponent({
  setup() {
    const { members } = useDiscordMembers()
    return () => h('p', { id: 'members' }, String(members.value))
  }
})

const render = async () => {
  const wrapper = await mountSuspended(probe)
  await flushPromises()
  return wrapper.get('#members').text()
}

beforeEach(() => {
  clearNuxtData('community-discord-members')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useDiscordMembers', () => {
  it('passes the count from the route through', async () => {
    registerEndpoint('/api/community/discord', () => ({ members: 321 }))
    expect(await render()).toBe('321')
  })

  it('yields null instead of throwing when the route fails', async () => {
    registerEndpoint('/api/community/discord', () => {
      throw createError({ statusCode: 500 })
    })
    expect(await render()).toBe('null')
  })

  it('yields null when the route has no count', async () => {
    registerEndpoint('/api/community/discord', () => ({ members: null }))
    expect(await render()).toBe('null')
  })
})
