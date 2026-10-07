// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { resolvePeople, resolvePerson, usePeople } from '../../layers/content-core/composables/usePeople'

const repo = {
  getTeamDocument: vi.fn(),
  listAuthorsBySlugs: vi.fn(),
}

mockNuxtImport('useContentRepository', () => () => repo)

beforeEach(() => {
  vi.clearAllMocks()
  repo.getTeamDocument.mockResolvedValue({
    members: [{ id: 'a', name: 'TheMeinerLP', slug: 'themeinerlp' }],
  })
  repo.listAuthorsBySlugs.mockImplementation(async (slugs: string[]) => slugs.filter((s) => s === 'gast').map((slug) => ({ slug, name: 'Gast' })))
})

describe('resolvePeople', () => {
  it('returns people in the order of the given slugs', async () => {
    const people = await resolvePeople(['gast', 'themeinerlp'], 'de')
    expect(people.map((p) => p.slug)).toEqual(['gast', 'themeinerlp'])
  })

  it('skips slugs that resolve to nobody', async () => {
    const people = await resolvePeople(['ghost', 'themeinerlp'], 'de')
    expect(people.map((p) => p.slug)).toEqual(['themeinerlp'])
  })

  it('asks the authors collection only for slugs the roster does not hold', async () => {
    await resolvePeople(['themeinerlp', 'gast'], 'de')
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledTimes(1)
    expect(repo.listAuthorsBySlugs).toHaveBeenCalledWith(['gast'])
  })

  it('does not query authors when the roster covers every slug', async () => {
    await resolvePeople(['themeinerlp'], 'de')
    expect(repo.listAuthorsBySlugs).not.toHaveBeenCalled()
  })

  it('does not touch the repository for an empty slug list', async () => {
    expect(await resolvePeople([], 'de')).toEqual([])
    expect(repo.getTeamDocument).not.toHaveBeenCalled()
  })

  it('reads the roster of the requested locale', async () => {
    await resolvePeople(['themeinerlp'], 'en')
    expect(repo.getTeamDocument).toHaveBeenCalledWith('en')
  })
})

describe('resolvePerson', () => {
  it('resolves a single slug', async () => {
    expect((await resolvePerson('gast', 'en'))?.profilePath).toBe('/en/blog/author/gast')
  })

  it('returns null for an unknown slug', async () => {
    expect(await resolvePerson('ghost', 'en')).toBeNull()
  })
})

describe('usePeople', () => {
  const Harness = defineComponent({
    async setup() {
      const { people } = await usePeople(['themeinerlp', 'gast'])
      return { paths: people.value.map((p) => p.profilePath).join(',') }
    },
    template: '<div>{{ paths }}</div>',
  })

  it('resolves the slugs for the route locale during setup', async () => {
    const wrapper = await mountSuspended(Harness, { route: '/en/blog' })
    expect(wrapper.text()).toBe('/en/team/themeinerlp,/en/blog/author/gast')
  })
})
