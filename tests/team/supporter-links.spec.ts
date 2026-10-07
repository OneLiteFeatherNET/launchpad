// @vitest-environment nuxt
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData } from '#imports'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { useLiteSupporterLinks } from '../../composables/useLiteSupporterLinks'

const probe = defineComponent({
  setup() {
    const links = useLiteSupporterLinks()
    return () => h('pre', JSON.stringify(links.value))
  }
})

const render = async (route: string) => {
  const wrapper = await mountSuspended(probe, { route })
  await flushPromises()
  return JSON.parse(wrapper.get('pre').text()) as { name: string, image: string | null, href: string }[]
}

beforeEach(() => {
  clearNuxtData()
  registerEndpoint('/api/community/supporters', () => ({
    supporters: [{ name: 'Bünyamin Arif', image: null, profile: 'https://opencollective.com/b' }]
  }))
})

describe('useLiteSupporterLinks', () => {
  it('links each supporter to the card on the community wall of the page locale', async () => {
    const [link] = await render('/de/team')
    expect(link).toEqual({ name: 'Bünyamin Arif', image: null, href: '/de/community#person-bunyamin-arif' })
  })

  it('hands the team layer no profile URL', async () => {
    const [link] = await render('/de/team')
    expect(JSON.stringify(link)).not.toContain('opencollective.com')
  })
})
