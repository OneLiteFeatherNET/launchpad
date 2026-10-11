// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import TeamMemberCard from '../../layers/team/components/TeamMemberCard.vue'

const open = () => mountSuspended(TeamMemberCard, { props: { name: 'Ada', mcName: 'ada' }, route: '/de/team' })

describe('TeamMemberCard avatar', () => {
  it('shows the Minecraft head while it loads', async () => {
    const wrapper = await open()
    expect(wrapper.get('img').attributes('src')).toContain('mc-heads.net')
  })

  it('replaces a head that fails to load with the initial', async () => {
    const wrapper = await open()
    await wrapper.get('img').trigger('error')
    await nextTick()
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[aria-hidden="true"]').text()).toBe('A')
  })
})
