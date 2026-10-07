// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AuthorBox from '../../layers/blog/components/AuthorBox.vue'
import type { Person } from '../../layers/content-core/utils/content/person'

const external: Person = {
  slug: 'gast',
  name: 'Gast',
  role: 'Guest author',
  avatar: '/gast.png',
  kind: 'external',
  profilePath: '/en/blog/author/gast',
  bio: 'Writes about clusters.',
  links: { website: 'https://example.com', github: 'javascript:alert(1)', mastodon: '' },
}

const team: Person = {
  slug: 'tp',
  name: 'Team Person',
  role: 'Admin',
  kind: 'team',
  profilePath: '/en/team/tp',
  bio: 'Should not show here.',
}

const open = (person: Person) => mountSuspended(AuthorBox, { props: { person }, route: '/en/blog' })

describe('AuthorBox', () => {
  it('names the author in a heading', async () => {
    const wrapper = await open(external)
    expect(wrapper.get('h2').text()).toBe('Gast')
  })

  it('shows the role of the author', async () => {
    expect((await open(external)).text()).toContain('Guest author')
  })

  it('shows bio and links of an external author', async () => {
    const wrapper = await open(external)
    expect(wrapper.text(), 'bio').toContain('Writes about clusters.')
    expect(wrapper.find('a[href="https://example.com"]').exists(), 'website link').toBe(true)
  })

  it('leaves out links with a scheme other than http, https or mailto', async () => {
    const wrapper = await open(external)
    expect(wrapper.html()).not.toContain('javascript:')
  })

  it('links a team author to the team profile instead of showing a bio', async () => {
    const wrapper = await open(team)
    expect(wrapper.find('a[href="/en/team/tp"]').exists(), 'profile link').toBe(true)
    expect(wrapper.text(), 'bio').not.toContain('Should not show here.')
  })

  it('offers no profile link for an external author', async () => {
    const wrapper = await open(external)
    expect(wrapper.find('a[href^="/en/team"]').exists()).toBe(false)
  })
})
