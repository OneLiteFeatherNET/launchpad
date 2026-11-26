// @vitest-environment nuxt
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ArticleSkeleton from '../../layers/blog/components/ArticleSkeleton.vue'
import { ARTICLE_CARD_CLASS } from '../../layers/blog/utils/articleCardClasses'

const page = readFileSync(join(__dirname, '../../pages/blog/[...slug].vue'), 'utf8')

describe('ArticleSkeleton', () => {
  it('is a busy region with a loading text for screen readers', async () => {
    const wrapper = await mountSuspended(ArticleSkeleton)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[role="status"]').text()).not.toBe('')
  })

  it('takes the card surface and the 16:9 header of the finished article', async () => {
    const wrapper = await mountSuspended(ArticleSkeleton)
    for (const name of ARTICLE_CARD_CLASS.split(' ')) {
      expect(wrapper.find('.rounded-large').classes()).toContain(name)
    }
    expect(wrapper.find('.aspect-video').exists()).toBe(true)
  })

  it('stands in for the article on the page, ahead of the article itself', () => {
    expect(page.indexOf('<ArticleSkeleton v-if="loading"')).toBeGreaterThan(-1)
    expect(page.indexOf('<ArticleSkeleton')).toBeLessThan(page.indexOf('<article'))
  })
})
