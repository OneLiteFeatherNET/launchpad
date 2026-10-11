import { describe, expect, it } from 'vitest'
import { buildPoiMentions } from '../../layers/blog/utils/poiMentions'
import { communityPoiCreativeWorkId, communityPoiDetailUrl, communityPoiPlaceId } from '#shared/utils/communityPoiSchema'

const SITE = 'https://onelitefeather.net'
const YGGDRASIL = { slug: 'yggdrasil', title: 'Wunderbaum Yggdrasil' }

describe('blog JSON-LD mentions of community POIs', () => {
  it('mentions an embedded POI as the CreativeWork the POI page emits', () => {
    expect(buildPoiMentions(SITE, 'de', ['yggdrasil'], [YGGDRASIL])).toEqual([{
      '@type': 'CreativeWork',
      '@id': 'https://onelitefeather.net/de/community-poi/yggdrasil#creativework',
      name: 'Wunderbaum Yggdrasil',
      url: 'https://onelitefeather.net/de/community-poi/yggdrasil'
    }])
  })

  it('uses the same @id format as the POI page for its Place and CreativeWork', () => {
    const detailUrl = communityPoiDetailUrl(SITE, 'en', 'yggdrasil')
    expect(communityPoiCreativeWorkId(detailUrl)).toBe(`${detailUrl}#creativework`)
    expect(communityPoiPlaceId(detailUrl)).toBe(`${detailUrl}#place`)
    expect(buildPoiMentions(SITE, 'en', ['yggdrasil'], [YGGDRASIL])[0]?.['@id']).toBe(communityPoiCreativeWorkId(detailUrl))
  })

  it('skips an embedded slug that has no published POI', () => {
    expect(buildPoiMentions(SITE, 'de', ['gone'], [YGGDRASIL])).toEqual([])
  })

  it('keeps the order in which the article embeds the POIs', () => {
    const endPortal = { slug: 'end-portal', title: 'End-Portal in der Oberwelt' }
    const names = buildPoiMentions(SITE, 'de', ['end-portal', 'yggdrasil'], [YGGDRASIL, endPortal])
      .map((mention) => mention.name)
    expect(names).toEqual(['End-Portal in der Oberwelt', 'Wunderbaum Yggdrasil'])
  })
})
