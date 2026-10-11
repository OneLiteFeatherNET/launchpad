import { describe, expect, it } from 'vitest'
import { mdcBlockProps, poiEmbedSlugs } from '../../layers/content-core/utils/content'

/** A stored article body as @nuxt/content writes it: minimark, `[tag, attrs, ...children]`. */
const body = () => ({
  type: 'minimark',
  value: [
    ['p',
{},
'Bei ',
['coords', { x: '1161', y: '75', z: '339' }],
' zu finden.'],
    ['poi-embed', { slug: 'yggdrasil' }],
    ['ul',
{},
['li',
{},
['poi-embed', { slug: 'end-portal' }]]],
    ['poi-embed', { slug: 'yggdrasil' }],
    ['poi-embed', { slug: '' }],
    ['poi-embed', { slug: 42 }],
    ['gallery', { ':images': '[]' }]
  ]
})

describe('poiEmbedSlugs', () => {
  it('lists the embedded slugs in first-use order without duplicates', () => {
    expect(poiEmbedSlugs(body())).toEqual(['yggdrasil', 'end-portal'])
  })

  it('finds embeds nested inside a list', () => {
    expect(poiEmbedSlugs(body())).toContain('end-portal')
  })

  it('ignores embeds whose slug is blank or not a string', () => {
    expect(poiEmbedSlugs({ type: 'minimark', value: [['poi-embed', { slug: '  ' }], ['poi-embed', { slug: 7 }]] }))
      .toEqual([])
  })

  it('returns nothing for a body without embeds, or no body at all', () => {
    expect(poiEmbedSlugs({
 type: 'minimark', value: [['p',
{},
'Text']]
})).toEqual([])
    expect(poiEmbedSlugs(undefined)).toEqual([])
  })
})

describe('mdcBlockProps', () => {
  it('returns the attributes of an inline block as stored', () => {
    expect(mdcBlockProps(body(), 'coords')).toEqual([{ x: '1161', y: '75', z: '339' }])
  })

  it('reads a bare minimark child list as well as a stored body', () => {
    expect(mdcBlockProps(body().value, 'gallery')).toEqual([{ ':images': '[]' }])
  })

  it('returns no attributes for a block the body does not use', () => {
    expect(mdcBlockProps(body(), 'download')).toEqual([])
  })
})
