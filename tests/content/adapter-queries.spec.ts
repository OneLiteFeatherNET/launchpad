import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createNuxtContentAdapter as createAdapter } from '../../layers/content-core/utils/content/nuxtContentAdapter'

interface Call { method: string, args: unknown[] }

const fake = vi.hoisted(() => {
  const state = {
    collection: '' as string,
    calls: [] as { method: string, args: unknown[] }[],
    rows: [] as unknown[]
  }
  const builder: Record<string, (...args: unknown[]) => unknown> = {}
  for (const method of ['select',
'where',
'order']) {
    builder[method] = (...args: unknown[]) => {
      state.calls.push({ method, args })
      return builder
    }
  }
  builder.all = async () => {
    state.calls.push({ method: 'all', args: [] })
    return state.rows
  }
  builder.first = async () => {
    state.calls.push({ method: 'first', args: [] })
    return state.rows[0] ?? null
  }
  return {
    state,
    queryCollection: (collection: string) => {
      state.collection = collection
      return builder
    }
  }
})

const createNuxtContentAdapter = () => createAdapter(fake.queryCollection as never)

const calls = (): Call[] => fake.state.calls
const named = (method: string) => calls().filter((call) => call.method === method)
const selected = (): string[] => named('select').flatMap((call) => call.args as string[])

beforeEach(() => {
  fake.state.collection = ''
  fake.state.calls = []
  fake.state.rows = []
})

describe('single-document collections', () => {
  const cases = [
    ['getTeamDocument', 'team_de'],
    ['getServerConcept', 'server_concept_de'],
    ['getServerConnect', 'server_connect_de'],
    ['getHomeCarousel', 'home_carousel_de']
  ] as const

  it.each(cases)('%s reads one row with first(), never all()', async (method, collection) => {
    fake.state.rows = [{ title: 'doc' }]
    const doc = await createNuxtContentAdapter()[method]('de')
    expect(fake.state.collection).toBe(collection)
    expect(named('first')).toHaveLength(1)
    expect(named('all')).toHaveLength(0)
    expect(doc).toEqual({ title: 'doc' })
  })

  it.each(cases)('%s answers null for an empty collection', async (method) => {
    expect(await createNuxtContentAdapter()[method]('de')).toBeNull()
  })
})

describe('event list', () => {
  const adapter = () => createNuxtContentAdapter()

  it('selects the card and phase fields', async () => {
    await adapter().listEvents('en')
    for (const field of ['slug',
'title',
'summary',
'type',
'thumbnail',
'thumbnailAlt',
'event',
'unlisted',
'promote',
'access',
'results',
'hosts']) {
      expect(selected(), `missing ${field}`).toContain(field)
    }
  })

  it('does not select the body or detail-only fields', async () => {
    await adapter().listEvents('en')
    for (const field of ['body',
'guides',
'join',
'build',
'testing',
'play',
'subject']) {
      expect(selected(), `unexpected ${field}`).not.toContain(field)
    }
  })

  it('keeps the detail query unprojected', async () => {
    await adapter().getEventBySlug('en', 'x')
    expect(named('select')).toHaveLength(0)
  })
})

describe('community poi list', () => {
  const adapter = () => createNuxtContentAdapter()

  it('replaces gallery and schematics with their counts', async () => {
    fake.state.rows = [{
      slug: 'a',
      title: 'A',
      gallery: [{ src: '1' }, { src: '2' }],
      schematics: [{ url: 'u' }]
    }]
    const [poi] = await adapter().listCommunityPois('de')
    expect(poi).toMatchObject({ slug: 'a', galleryCount: 2, schematicCount: 1 })
    expect(poi).not.toHaveProperty('gallery')
    expect(poi).not.toHaveProperty('schematics')
  })

  it('counts zero when gallery and schematics are absent', async () => {
    fake.state.rows = [{ slug: 'a', title: 'A', gallery: null }]
    const [poi] = await adapter().listCommunityPois('de')
    expect(poi).toMatchObject({ galleryCount: 0, schematicCount: 0 })
  })

  it('does not select lore, goal or the body', async () => {
    await adapter().listCommunityPois('de')
    for (const field of ['body',
'lore',
'goal',
'currentState',
'coordinates',
'forumUrl']) {
      expect(selected(), `unexpected ${field}`).not.toContain(field)
    }
  })

  it('lists every poi without a filter', async () => {
    await adapter().listCommunityPois('de')
    expect(named('where')).toHaveLength(0)
  })

  it('filters featured pois in SQL and projects card fields', async () => {
    await adapter().listFeaturedCommunityPois('en')
    expect(fake.state.collection).toBe('community_poi_en')
    expect(named('where').map((call) => call.args)).toEqual([['featured',
'=',
true]])
    expect(selected()).toEqual(expect.arrayContaining(['slug',
'title',
'featuredCaption',
'status',
'updatedAt']))
    expect(selected()).not.toContain('body')
  })

  it('keeps the detail query unprojected', async () => {
    await adapter().getCommunityPoiBySlug('de', 'x')
    expect(named('select')).toHaveLength(0)
  })
})

describe('author lookup', () => {
  const adapter = () => createNuxtContentAdapter()

  it('reads all authors with one IN query', async () => {
    fake.state.rows = [{ slug: 'b' }, { slug: 'a' }]
    const authors = await adapter().listAuthorsBySlugs(['b', 'a'])
    expect(named('where').map((call) => call.args)).toEqual([['slug',
'IN',
['b', 'a']]])
    expect(named('all')).toHaveLength(1)
    expect(authors).toEqual([{ slug: 'b' }, { slug: 'a' }])
  })

  it('does not query for an empty slug list', async () => {
    expect(await adapter().listAuthorsBySlugs([])).toEqual([])
    expect(calls()).toHaveLength(0)
  })

  it('does not select the author body', async () => {
    await adapter().listAuthorsBySlugs(['a'])
    expect(selected()).not.toContain('body')
    expect(selected()).toEqual(expect.arrayContaining(['slug',
'name',
'avatar']))
  })
})
