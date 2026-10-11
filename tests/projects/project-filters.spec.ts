// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjectFilters from '../../layers/projects/components/ProjectFilters.vue'
import { EMPTY_PROJECT_FILTER, type PlatformFacet, type ProjectFilter } from '../../layers/projects/utils/projectFilter'

const facets: PlatformFacet[] = [
  { platform: 'Minestom', count: 3 }, { platform: 'Paper', count: 2 },
]

const mountFilters = (filter: ProjectFilter = EMPTY_PROJECT_FILTER, shown = 5, total = 5) => {
  return mountSuspended(ProjectFilters, {
    props: { filter, facets, shown, total },
    route: '/de/projects',
  })
}

const chip = (wrapper: VueWrapper, label: string) => {
  const found = wrapper.findAll('button').find((button) => button.text() === label)
  if (!found) throw new Error(`no chip labelled "${label}"`)
  return found
}

const emittedFilters = (wrapper: VueWrapper): ProjectFilter[] => {
  return (wrapper.emitted('update:filter') ?? []).map(([filter]) => filter as ProjectFilter)
}

describe('ProjectFilters audience chips', () => {
  it('presses only the chip of the chosen audience', async () => {
    const wrapper = await mountFilters({ audience: 'internal', platforms: [] })
    expect(chip(wrapper, 'Intern').attributes('aria-pressed')).toBe('true')
    expect(chip(wrapper, 'Alle').attributes('aria-pressed')).toBe('false')
    expect(chip(wrapper, 'Öffentlich nutzbar').attributes('aria-pressed')).toBe('false')
  })

  it('emits the clicked audience and keeps the platforms', async () => {
    const wrapper = await mountFilters({ audience: 'all', platforms: ['Paper'] })
    await chip(wrapper, 'Öffentlich nutzbar').trigger('click')
    expect(emittedFilters(wrapper)).toEqual([{ audience: 'external', platforms: ['Paper'] }])
  })
})

describe('ProjectFilters platform chips', () => {
  it('labels each platform with the number of projects that run on it', async () => {
    const wrapper = await mountFilters()
    expect(chip(wrapper, 'Minestom (3)').attributes('aria-pressed')).toBe('false')
    expect(chip(wrapper, 'Paper (2)').attributes('aria-pressed')).toBe('false')
  })

  it('adds a platform to the selection and keeps the audience', async () => {
    const wrapper = await mountFilters({ audience: 'internal', platforms: ['Paper'] })
    await chip(wrapper, 'Minestom (3)').trigger('click')
    expect(emittedFilters(wrapper)).toEqual([{ audience: 'internal', platforms: ['Paper', 'Minestom'] }])
  })

  it('removes a platform that is already selected', async () => {
    const wrapper = await mountFilters({ audience: 'all', platforms: ['Paper'] })
    expect(chip(wrapper, 'Paper (2)').attributes('aria-pressed')).toBe('true')
    await chip(wrapper, 'Paper (2)').trigger('click')
    expect(emittedFilters(wrapper)).toEqual([{ audience: 'all', platforms: [] }])
  })
})

describe('ProjectFilters result count and reset', () => {
  it('announces the visible and total count politely', async () => {
    const wrapper = await mountFilters(EMPTY_PROJECT_FILTER, 2, 5)
    const live = wrapper.find('[aria-live="polite"]')
    expect(live.exists()).toBe(true)
    expect(live.text()).toBe('2 von 5 Projekten')
  })

  it('offers no reset action while nothing is selected', async () => {
    const wrapper = await mountFilters()
    const reset = wrapper.findAll('button').find((button) => button.text() === 'Filter zurücksetzen')
    expect(reset).toBeUndefined()
  })

  it('clears every selection with the reset action', async () => {
    const wrapper = await mountFilters({ audience: 'internal', platforms: ['Minestom'] }, 1, 5)
    await chip(wrapper, 'Filter zurücksetzen').trigger('click')
    expect(emittedFilters(wrapper)).toEqual([EMPTY_PROJECT_FILTER])
  })
})
