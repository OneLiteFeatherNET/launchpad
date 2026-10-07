// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { clearNuxtData } from '#imports'
import { useBlogAuthorPage } from '../../layers/blog/composables/useBlogAuthorPage'

/**
 * Releases are far in the past or far in the future, so the real clock inside
 * the composable cannot change what these cases see.
 */
const PAST = '2000-01-01T00:00:00Z'
const FUTURE = '3000-01-01T00:00:00Z'

const post = (slug: string, author: string | string[], released = PAST) => ({
  slug,
  title: slug,
  author,
  pubDate: released,
  releaseDate: released,
})

type Roster = { slug: string, name: string }[]
const state = {
  articles: {} as Record<string, ReturnType<typeof post>[]>,
  rosters: {} as Record<string, Roster>,
}

const repo = {
  listBlogArticles: vi.fn(async (locale: string) => state.articles[locale] ?? []),
  getTeamDocument: vi.fn(async (locale: string) => ({
    members: (state.rosters[locale] ?? []).map((member) => ({ id: member.slug, ...member })),
  })),
  listAuthorsBySlugs: vi.fn(async (slugs: string[]) => slugs.filter((slug) => slug === 'gast').map((slug) => ({ slug, name: 'Gast' }))),
}
const setI18nParams = vi.fn()

mockNuxtImport('useContentRepository', () => () => repo)
mockNuxtImport('useSetI18nParams', () => () => setI18nParams)

const Harness = defineComponent({
  async setup() {
    try {
      const { person, articles } = await useBlogAuthorPage()
      const slugs = articles.value.map((article) => article.slug).join(',')
      return { outcome: `${person.value?.kind}:${person.value?.profilePath}:${slugs}` }
    } catch (error) {
      return { outcome: `error:${(error as { statusCode?: number }).statusCode}` }
    }
  },
  template: '<div>{{ outcome }}</div>',
})

const open = async (path: string) => {
  const wrapper = await mountSuspended(Harness, { route: path })
  await flushPromises()
  return wrapper.text()
}

beforeEach(() => {
  vi.clearAllMocks()
  clearNuxtData()
  state.articles = {}
  state.rosters = {
    de: [{ slug: 'tp', name: 'Team Person' }],
    en: [{ slug: 'tp', name: 'Team Person' }],
  }
})

describe('blog author page', () => {
  it('lists the released articles of a team author, newest first', async () => {
    state.articles.de = [
      { ...post('older', 'tp'), pubDate: '2001-01-01T00:00:00Z', releaseDate: '2001-01-01T00:00:00Z' },
      { ...post('newer', 'tp'), pubDate: '2002-01-01T00:00:00Z', releaseDate: '2002-01-01T00:00:00Z' },
      post('other', 'gast'),
    ]
    expect(await open('/de/blog/author/tp')).toBe('team:/de/team/tp:newer,older')
  })

  it('lists the articles of an external author, also from a shared list', async () => {
    state.articles.de = [post('solo', 'gast'), post('shared', ['tp', 'gast'])]
    expect(await open('/de/blog/author/gast')).toBe('external:/de/blog/author/gast:solo,shared')
  })

  it('answers 404 for an unknown slug', async () => {
    state.articles.de = [post('a', 'tp')]
    expect(await open('/de/blog/author/niemand')).toBe('error:404')
  })

  it('answers 404 for a person without any article', async () => {
    state.articles.de = [post('a', 'gast')]
    expect(await open('/de/blog/author/tp')).toBe('error:404')
  })

  it('answers 404 when every article of the author is still unreleased', async () => {
    state.articles.de = [post('later', 'tp', FUTURE)]
    expect(await open('/de/blog/author/tp')).toBe('error:404')
  })

  it('publishes the slug for each language in which the author has an article', async () => {
    state.articles.de = [post('a', 'tp')]
    state.articles.en = [post('b', 'tp')]
    await open('/de/blog/author/tp')
    expect(setI18nParams).toHaveBeenLastCalledWith({ de: { slug: 'tp' }, en: { slug: 'tp' } })
  })

  it('leaves out a language in which the author has no released article', async () => {
    state.articles.de = [post('a', 'tp')]
    state.articles.en = [post('b', 'tp', FUTURE)]
    await open('/de/blog/author/tp')
    expect(setI18nParams).toHaveBeenLastCalledWith({ de: { slug: 'tp' } })
  })

  it('leaves out a language in which the person does not resolve', async () => {
    state.articles.de = [post('a', 'tp')]
    state.articles.en = [post('b', 'tp')]
    state.rosters.en = []
    await open('/de/blog/author/tp')
    expect(setI18nParams).toHaveBeenLastCalledWith({ de: { slug: 'tp' } })
  })
})
