// @vitest-environment nuxt
import { readFileSync } from 'node:fs'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useHomeHighlights } from '../../composables/useHomeHighlights'
import { repoRoot } from '../helpers/sources'

const NOW = new Date('2026-10-07T12:00:00Z')

const repo = {
  listBlogArticles: vi.fn(),
  listCommunityPois: vi.fn(),
  listProjects: vi.fn(),
  getTeamDocument: vi.fn(),
  listAuthorsBySlugs: vi.fn()
}

mockNuxtImport('useContentRepository', () => () => repo)

let result: ReturnType<typeof useHomeHighlights> | undefined

const Harness = defineComponent({
  setup() {
    result = useHomeHighlights()
    return {}
  },
  template: '<div />'
})

beforeEach(() => {
  clearNuxtData()
  vi.clearAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  repo.listBlogArticles.mockResolvedValue([
    {
      slug: 'release',
      title: 'Release',
      description: 'Notes',
      pubDate: '2026-10-05T00:00:00Z',
      author: 'themeinerlp'
    },
    { slug: 'old', title: 'Old', description: 'Long ago', pubDate: '2026-01-01T00:00:00Z' }
  ])
  repo.listCommunityPois.mockResolvedValue([])
  repo.listProjects.mockResolvedValue([
    { slug: 'arcr', title: 'ARCR', summary: 'Clocks', status: 'active', publishedAt: '2026-10-07' }
  ])
  repo.getTeamDocument.mockResolvedValue({
    members: [{ slug: 'themeinerlp', name: 'Phillipp', mcName: 'TheMeinerLP' }]
  })
  repo.listAuthorsBySlugs.mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useHomeHighlights', () => {
  it('fixes the moment once and returns the new slides, newest first', async () => {
    await mountSuspended(Harness, { route: '/en' })
    await flushPromises()
    const { now, slides } = result!.highlights.value
    expect(now).toBe(NOW.toISOString())
    const hrefs = slides.map((slide) => (slide as { href: string }).href)
    expect(hrefs).toEqual(['/en/projects/arcr', '/en/blog/release'])
  })

  it('names the article author from the roster', async () => {
    await mountSuspended(Harness, { route: '/en' })
    await flushPromises()
    const blog = result!.highlights.value.slides.find((slide) => (slide as { type: string }).type === 'blog')
    expect(blog).toMatchObject({ author: 'Phillipp', isNew: true })
  })

  it('reads each collection once and never resolves authors of old articles', async () => {
    await mountSuspended(Harness, { route: '/en' })
    await flushPromises()
    expect(repo.listBlogArticles).toHaveBeenCalledTimes(1)
    expect(repo.listCommunityPois).toHaveBeenCalledTimes(1)
    expect(repo.listProjects).toHaveBeenCalledTimes(1)
    expect(repo.getTeamDocument).toHaveBeenCalledTimes(1)
  })

  it('also returns recent, not-new content to fill a sparse carousel', async () => {
    await mountSuspended(Harness, { route: '/en' })
    await flushPromises()
    const recent = result!.highlights.value.recent.map((slide) => (slide as { href: string }).href)
    expect(recent).toEqual(['/en/blog/old'])
  })

  it('leaves path and stem out of the payload', async () => {
    repo.listProjects.mockResolvedValue([
      {
        slug: 'arcr',
        title: 'ARCR',
        summary: 'Clocks',
        status: 'active',
        publishedAt: '2026-10-07',
        path: '/projects/en/arcr',
        stem: 'projects/en/arcr'
      }
    ])
    await mountSuspended(Harness, { route: '/en' })
    await flushPromises()
    expect(JSON.stringify(result!.highlights.value)).not.toMatch(/"(path|stem)"/)
  })
})

describe('home page wiring', () => {
  const page = readFileSync(`${repoRoot}/pages/index.vue`, 'utf8')

  it('fetches the highlights at page level and composes them with events and curated slides', () => {
    expect(page).toContain('useHomeHighlights()')
    expect(page).toMatch(/composeSlides\(/)
    expect(page).toMatch(/eventSlide\(/)
  })
})
