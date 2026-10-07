// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import HostedEventList from '../../layers/events/components/HostedEventList.vue'
import type { EventCardData } from '../../layers/events/utils/eventLists'

const card = (slug: string, phase: EventCardData['phase']): EventCardData => ({
  slug,
  title: `Event ${slug}`,
  summary: slug,
  type: 'build',
  phase,
  accessMode: 'open',
  startsAt: '2026-10-01T18:00:00+02:00',
  endsAt: '2026-10-14T23:59:00+02:00',
  path: `/de/events/${slug}`,
})

const open = (events: EventCardData[]) => mountSuspended(HostedEventList, {
  props: { title: 'Events', events },
  route: '/de/team/tp',
})

describe('HostedEventList', () => {
  it('links each title to its event page', async () => {
    const wrapper = await open([card('a', 'running'), card('b', 'past')])
    expect(wrapper.find('a[href="/de/events/a"]').text()).toBe('Event a')
    expect(wrapper.find('a[href="/de/events/b"]').text()).toBe('Event b')
  })

  it('shows the period of each event', async () => {
    const wrapper = await open([card('a', 'running')])
    expect(wrapper.find('time').exists()).toBe(true)
  })

  it('names the phase of each event', async () => {
    const wrapper = await open([card('a', 'running')])
    expect(wrapper.text()).toContain('Läuft')
  })

  it('names the section with the given heading', async () => {
    const wrapper = await open([card('a', 'running')])
    expect(wrapper.get('h2').text()).toBe('Events')
  })
})
