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
  headerImage: '/images/blog/post.webp',
  headerImageAlt: 'A post'
}

const open = (component: Component, props: Record<string, unknown> = {}) => {
  return mountSuspended(component, { props: { blogArticle: article, ...props }, route: '/en/blog' })
}

describe('blog overview image priority', () => {
  it('loads the featured card image eagerly at high priority', async () => {
    const wrapper = await open(Top1)
    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('fetchpriority')).toBe('high')
    expect(wrapper.findComponent({ name: 'NuxtPicture' }).props('preload')).toEqual({ fetchPriority: 'high' })
  })

  it('sizes the featured image box to 16:9 instead of a fixed height', async () => {
    const img = (await open(Top1)).find('img')
    expect(img.classes()).toContain('aspect-video')
    expect(img.classes()).not.toContain('h-96')
  })

  it('keeps a grid card lazy by default', async () => {
    const wrapper = await open(ArticleCard)
    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('fetchpriority')).toBeUndefined()
    expect(wrapper.findComponent({ name: 'NuxtPicture' }).props('preload')).toBeFalsy()
  })

  it('loads a priority grid card eagerly at high priority', async () => {
    const wrapper = await open(ArticleCard, { priority: true })
    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('fetchpriority')).toBe('high')
  })
})
