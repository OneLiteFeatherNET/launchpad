// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ArticleHeaderImage from '../../layers/blog/components/ArticleHeaderImage.vue'
import { ARTICLE_HEADER_SIZES } from '../../layers/blog/utils/articleImage'

const open = () => mountSuspended(ArticleHeaderImage, {
  props: { src: '/images/blog/post.webp', alt: 'A post' },
  route: '/de/blog/post'
})

describe('article header image', () => {
  it('asks NuxtPicture for a high-priority preload', async () => {
    const picture = (await open()).findComponent({ name: 'NuxtPicture' })
    expect(picture.props('preload')).toEqual({ fetchPriority: 'high' })
  })

  it('renders the image eagerly with fetchpriority high', async () => {
    const img = (await open()).find('img')
    expect(img.attributes('fetchpriority')).toBe('high')
    expect(img.attributes('loading')).toBe('eager')
  })

  it('takes its sizes from the shared constant', async () => {
    const wrapper = await open()
    expect(wrapper.findComponent({ name: 'NuxtPicture' }).props('sizes')).toBe(ARTICLE_HEADER_SIZES)
    expect(wrapper.find('source').attributes('sizes')).toBeTruthy()
  })
})
