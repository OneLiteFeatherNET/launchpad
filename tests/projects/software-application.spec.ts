import { describe, expect, it } from 'vitest'
import { softwareApplicationNode } from '../../layers/projects/utils/softwareApplication'

const base = {
  title: 'Anti-RedstoneClock Remastered',
  summary: 'A Paper plugin that detects redstone clocks.',
  url: 'https://onelitefeather.net/en/projects/arcr',
  publisherId: 'https://onelitefeather.net/#identity',
}

const full = {
  ...base,
  license: 'AGPL-3.0',
  releasedAt: '2024-01-30',
  platforms: ['Paper', 'Folia'],
  links: {
    docs: 'https://docs.onelitefeather.net/arcr',
    source: 'https://github.com/OneLiteFeatherNET/AntiRedstoneClock-Remastered',
    downloads: [{ url: 'https://hangar.papermc.io/OneLiteFeather/arcr' }],
  },
}

describe('softwareApplicationNode', () => {
  it('describes the project as a developer application with a stable @id', () => {
    const node = softwareApplicationNode(full)
    expect(node['@type']).toBe('SoftwareApplication')
    expect(node['@id']).toBe('https://onelitefeather.net/en/projects/arcr#software')
    expect(node.applicationCategory).toBe('DeveloperApplication')
  })

  it('links the source repository as codeRepository', () => {
    expect(softwareApplicationNode(full).codeRepository)
      .toBe('https://github.com/OneLiteFeatherNET/AntiRedstoneClock-Remastered')
  })

  it('omits codeRepository when the project has no source link', () => {
    const node = softwareApplicationNode({ ...full, links: { docs: full.links.docs } })
    expect(node.codeRepository).toBeUndefined()
  })

  it('states the platforms as runtimePlatform, not as an operating system', () => {
    const node = softwareApplicationNode(full)
    expect(node.runtimePlatform).toEqual(['Paper', 'Folia'])
    expect(node).not.toHaveProperty('operatingSystem')
  })

  it('omits runtimePlatform when no platforms are listed', () => {
    expect(softwareApplicationNode({ ...full, platforms: [] }).runtimePlatform).toBeUndefined()
  })

  it('turns a known SPDX license id into its URL', () => {
    expect(softwareApplicationNode(full).license).toBe('https://spdx.org/licenses/AGPL-3.0.html')
  })

  it('omits license rather than emitting a free-text value', () => {
    expect(softwareApplicationNode({ ...full, license: 'Proprietary' }).license).toBeUndefined()
  })

  it('formats releasedAt as an ISO datePublished', () => {
    expect(softwareApplicationNode(full).datePublished).toBe('2024-01-30T00:00:00.000Z')
  })

  it('omits datePublished when releasedAt is unparsable', () => {
    expect(softwareApplicationNode({ ...full, releasedAt: 'not a date' }).datePublished).toBeUndefined()
  })

  it('keeps the documentation as softwareHelp and the first download as downloadUrl', () => {
    const node = softwareApplicationNode(full)
    expect(node.softwareHelp).toBe('https://docs.onelitefeather.net/arcr')
    expect(node.downloadUrl).toBe('https://hangar.papermc.io/OneLiteFeather/arcr')
  })

  it('does not invent a programmingLanguage', () => {
    expect(softwareApplicationNode(full)).not.toHaveProperty('programmingLanguage')
  })
})
