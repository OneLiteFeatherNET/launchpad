// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'
import ArticleCard from '../../layers/blog/components/ArticleCard.vue'
import Top1 from '../../layers/blog/components/Top1.vue'

const article = {
  slug: 'post',
  title: 'A post',
  description: 'About a post',
  pubDate: '2026-01-01T00:00:00Z',
}

const authors = [
  { slug: 'themeinerlp', name: 'TheMeinerLP', profilePath: '/de/team/themeinerlp' }, { slug: 'gast', name: 'Gast', profilePath: '/de/blog/author/gast' },
]

const open = (component: Component, withAuthors = authors) => mountSuspended(
  component,
  { props: { blogArticle: article, authors: withAuthors }, route: '/de/blog' }
)

describe.each([
  ['ArticleCard', ArticleCard], ['Top1', Top1],
])('%s authors', (_name, component) => {
  it('links a team author to the team profile', async () => {
    const wrapper = await open(component)
    expect(wrapper.find('a[href="/de/team/themeinerlp"]').text()).toBe('TheMeinerLP')
  })

  it('links an external author to the author page', async () => {
    const wrapper = await open(component)
    expect(wrapper.find('a[href="/de/blog/author/gast"]').text()).toBe('Gast')
  })

  it('keeps the title link on the article', async () => {
    const wrapper = await open(component)
    expect(wrapper.find('a[href="/de/blog/post"]').text()).toBe('A post')
  })

  it('does not nest links', async () => {
    const wrapper = await open(component)
    expect(wrapper.element.querySelectorAll('a a')).toHaveLength(0)
  })

  it('renders no author links without authors', async () => {
    const wrapper = await open(component, [])
    expect(wrapper.findAll('a')).toHaveLength(1)
  })
})
