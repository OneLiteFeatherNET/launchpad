import { describe, expect, it } from 'vitest'
import { organizationDescriptionNode, rootWebSiteNode } from '../../layers/content-core/utils/siteIdentity'
import { organizationId, websiteId } from '../../layers/content-core/utils/schema-ids'

const site = {
  siteUrl: 'https://onelitefeather.net',
  name: 'OneLiteFeather',
  description: 'OneLiteFeather ist ein deutschsprachiges Minecraft-Netzwerk.',
  languages: ['en-US', 'de-DE']
}

describe('websiteId', () => {
  it('puts the website fragment on the domain root', () => {
    expect(websiteId('https://onelitefeather.net')).toBe('https://onelitefeather.net/#website')
  })

  it('does not double the slash of a site url that ends in one', () => {
    expect(websiteId('https://onelitefeather.net/')).toBe('https://onelitefeather.net/#website')
  })
})

describe('rootWebSiteNode', () => {
  it('is identified by the domain-level @id', () => {
    expect(rootWebSiteNode(site)['@id']).toBe('https://onelitefeather.net/#website')
  })

  it('points url at the domain root, not at a locale', () => {
    expect(rootWebSiteNode(site).url).toBe('https://onelitefeather.net/')
  })

  it('follows the site url outside production', () => {
    expect(rootWebSiteNode({ ...site, siteUrl: 'http://localhost:3000' }).url).toBe('http://localhost:3000/')
  })

  it('names the brand and lists its alternate names', () => {
    const node = rootWebSiteNode(site)
    expect(node.name).toBe('OneLiteFeather')
    expect(node.alternateName).toEqual(['OneLiteFeather Network',
'onelitefeather.net',
'OLF'])
  })

  it('declares both site languages', () => {
    expect(rootWebSiteNode(site).inLanguage).toEqual(['en-US', 'de-DE'])
  })

  it('carries the description it is given', () => {
    expect(rootWebSiteNode(site).description).toBe(site.description)
  })

  it('has no translation links to a per-locale website', () => {
    const node = rootWebSiteNode(site)
    expect(node).not.toHaveProperty('translationOfWork')
    expect(node).not.toHaveProperty('workTranslation')
  })
})

describe('organizationDescriptionNode', () => {
  it('merges into the identity node through its @id', () => {
    expect(organizationDescriptionNode('https://onelitefeather.net', 'Beschreibung')['@id'])
      .toBe(organizationId('https://onelitefeather.net'))
  })

  it('carries only the localised description', () => {
    const { '@id': _id, ...rest } = organizationDescriptionNode('https://onelitefeather.net', 'Beschreibung')
    expect(rest).toEqual({ description: 'Beschreibung' })
  })
})
