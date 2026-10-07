// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AuthorPostList from '../../layers/blog/components/AuthorPostList.vue'

const posts = [
  { slug: 'new', title: 'New post', pubDate: '2026-03-01T00:00:00Z' }, { slug: 'old', title: 'Old post', pubDate: '2025-03-01T00:00:00Z' },
]

const open = (items = posts) => mountSuspended(AuthorPostList, {
  props: { title: 'Beiträge', posts: items },
  route: '/de/team/tp',
})

describe('AuthorPostList', () => {
  it('links each title to its article in the page locale', async () => {
    const wrapper = await open()
    expect(wrapper.find('a[href="/de/blog/new"]').text()).toBe('New post')
    expect(wrapper.find('a[href="/de/blog/old"]').text()).toBe('Old post')
  })

  it('keeps the given order', async () => {
    const wrapper = await open()
    expect(wrapper.findAll('li a').map((link) => link.text())).toEqual(['New post', 'Old post'])
  })

  it('shows the release date as a machine-readable time', async () => {
    const wrapper = await open()
    expect(wrapper.find('time').attributes('datetime')).toBe('2026-03-01T00:00:00.000Z')
  })

  it('names the section with the given heading', async () => {
    const wrapper = await open()
    expect(wrapper.get('h2').text()).toBe('Beiträge')
  })
})
