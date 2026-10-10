// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { clearNuxtData } from '#imports'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  useProjectDetail,
  useProjectsBySlugs,
  useProjectsOverview,
} from '../../layers/projects/composables/useProjects'

const card = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug, title: slug, summary: slug, status: 'active', ...extra,
})

const repo = {
  listProjects: vi.fn(),
  listProjectsBySlugs: vi.fn(),
  getProjectBySlug: vi.fn(),
  getProjectByTranslationKey: vi.fn(),
  getTeamDocument: vi.fn(),
  listAuthorsBySlugs: vi.fn(),
}

mockNuxtImport('useContentRepository', () => () => repo)

beforeEach(() => {
  clearNuxtData()
  vi.clearAllMocks()
  repo.listProjects.mockResolvedValue([
    card('old', { status: 'archived' }), card('live'),
  ])
  repo.listProjectsBySlugs.mockResolvedValue([card('b'), card('a')])
  repo.getProjectBySlug.mockImplementation(async (_locale: string, slug: string) => (
    slug === 'arcr'
      ? {
 slug: 'arcr', title: 'ARCR', summary: 's', status: 'active', translationKey: 'arcr', maintainers: ['gast',
'ghost',
'tp']
}
      : null
  ))
  repo.getProjectByTranslationKey.mockImplementation(async (locale: string) => (
    locale === 'en' ? { slug: 'arcr-en' } : null
  ))
  repo.getTeamDocument.mockResolvedValue({ members: [{ slug: 'tp', name: 'Team Person' }] })
  repo.listAuthorsBySlugs.mockResolvedValue([{ slug: 'gast', name: 'Gast' }])
})

const render = async <T>(route: string, read: () => Promise<T> | T) => {
  const wrapper = await mountSuspended(defineComponent({
    async setup() {
      try {
        return { json: JSON.stringify(await read()) }
      } catch (error) {
        return { json: JSON.stringify({ error: (error as { statusCode?: number }).statusCode }) }
      }
    },
    render() {
      return h('pre', (this as unknown as { json: string }).json)
    },
  }), { route })
  await flushPromises()
  return JSON.parse(wrapper.get('pre').text()) as T
}

describe('useProjectsOverview', () => {
  it('asks for the locale of the page and sorts active projects first', async () => {
    const slugs = await render('/de/projects', async () => {
      const { projects } = await useProjectsOverview()
      return projects.value.map((p) => p.slug)
    })
    expect(repo.listProjects).toHaveBeenCalledWith('de')
    expect(slugs).toEqual(['live', 'old'])
  })
})

describe('useProjectsBySlugs', () => {
  it('returns the projects in the order of the slugs', async () => {
    const slugs = await render('/de/community-poi/x', async () => {
      const { projects } = await useProjectsBySlugs(['a', 'b'])
      return projects.value.map((p) => p.slug)
    })
    expect(repo.listProjectsBySlugs).toHaveBeenCalledWith('de', ['a', 'b'])
    expect(slugs).toEqual(['a', 'b'])
  })

  it('does not ask the repository without slugs', async () => {
    const slugs = await render('/de/community-poi/x', async () => {
      const { projects } = await useProjectsBySlugs([])
      return projects.value.map((p) => p.slug)
    })
    expect(repo.listProjectsBySlugs).not.toHaveBeenCalled()
    expect(slugs).toEqual([])
  })

  it('leaves out a slug that matches no project', async () => {
    repo.listProjectsBySlugs.mockResolvedValue([card('a')])
    const slugs = await render('/de/community-poi/x', async () => {
      const { projects } = await useProjectsBySlugs(['gone', 'a'])
      return projects.value.map((p) => p.slug)
    })
    expect(slugs).toEqual(['a'])
  })
})

describe('useProjectDetail', () => {
  it('resolves the maintainers in order and skips unknown ones', async () => {
    const result = await render('/de/projects/arcr', async () => {
      const { detail } = await useProjectDetail()
      return detail.value?.maintainers.map((m) => `${m.name}>${m.profilePath}`)
    })
    expect(result).toEqual(['Gast>/de/blog/author/gast', 'Team Person>/de/team/tp'])
  })

  it('answers 404 for an unknown slug', async () => {
    const result = await render('/de/projects/nope', async () => {
      const { detail } = await useProjectDetail()
      return detail.value
    })
    expect(result).toEqual({ error: 404 })
  })

  it('names the slug of the translation per locale, null without one', async () => {
    const result = await render('/de/projects/arcr', async () => {
      const { detail } = await useProjectDetail()
      return detail.value?.localeSlugs
    })
    expect(result).toEqual({ de: 'arcr', en: 'arcr-en' })
    repo.getProjectByTranslationKey.mockResolvedValue(null)
    clearNuxtData()
    const alone = await render('/de/projects/arcr', async () => {
      const { detail } = await useProjectDetail()
      return detail.value?.localeSlugs
    })
    expect(alone).toEqual({ de: 'arcr', en: null })
  })
})
