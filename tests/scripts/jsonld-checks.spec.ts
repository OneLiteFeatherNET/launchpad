import { describe, expect, it } from 'vitest'
import { checkGraph, checkRobotsAgreement } from '../../scripts/jsonld-checks.mjs'

const origin = 'https://onelitefeather.net'
const websiteId = `${origin}/#website`
const identityId = `${origin}/#identity`
const personId = `${origin}/#/person/themeinerlp`

type Node = Record<string, unknown>

const identity = (): Node[] => [
  {
    '@type': 'Organization',
    '@id': identityId,
    'name': 'OneLiteFeather',
    'url': `${origin}/`,
    'logo': { '@id': `${origin}/#logo` }
  },
  { '@type': 'ImageObject', '@id': `${origin}/#logo`, 'url': `${origin}/images/logo.png` }
]

const homeGraph = (): Node[] => [
  ...identity(),
  {
    '@type': 'WebSite',
    '@id': websiteId,
    'url': `${origin}/`,
    'name': 'OneLiteFeather',
    'alternateName': ['OneLiteFeather Network',
'onelitefeather.net',
'OLF']
  },
  {
    '@type': 'WebPage',
    '@id': `${origin}/en#webpage`,
    'isPartOf': { '@id': websiteId },
    'primaryImageOfPage': { '@id': `${origin}/en#primaryimage` }
  },
  { '@type': 'ImageObject', '@id': `${origin}/en#primaryimage`, 'url': `${origin}/images/og-default.png` }
]

const articleNode = (): Node => ({
  '@type': 'Article',
  'headline': 'DevBlog #1',
  'image': [`${origin}/images/blog/dev-blog-1.webp`],
  'datePublished': '2023-10-21T00:00:00.000Z',
  'dateModified': '2023-10-21T00:00:00.000Z',
  'author': [{ '@type': 'Person', '@id': personId, 'name': 'TheMeinerLP', 'url': `${origin}/en/team/themeinerlp` }],
  'publisher': { '@id': identityId }
})

const without = (node: Node, key: string): Node => {
  const { [key]: _removed, ...rest } = node
  return rest
}
const replace = (graph: Node[], type: string, patch: (node: Node) => Node): Node[] => graph.map(node => node['@type'] === type ? patch(node) : node)

function check(graph: Node[], kind: 'page' | 'article' | 'profile' = 'page'): string[] {
  return checkGraph(graph, { origin, kind })
}

describe('checkGraph', () => {
  it('reports nothing for a correct home page graph', () => {
    expect(check(homeGraph())).toEqual([])
  })

  it('reports a WebSite without alternateName', () => {
    const graph = replace(homeGraph(), 'WebSite', node => without(node, 'alternateName'))
    expect(check(graph).join('\n')).toContain('alternateName')
  })

  it('reports a WebSite whose url is a locale sub-path', () => {
    const graph = replace(homeGraph(), 'WebSite', node => ({ ...node, url: `${origin}/en` }))
    expect(check(graph).join('\n')).toContain(`${origin}/en`)
  })

  it('reports a WebSite that still carries translationOfWork', () => {
    const graph = replace(homeGraph(), 'WebSite', node => ({ ...node, translationOfWork: { '@id': `${origin}/en#website` } }))
    expect(check(graph).join('\n')).toContain('translationOfWork')
  })

  it('reports a second WebSite node', () => {
    const graph = [...homeGraph(), { '@type': 'WebSite', '@id': `${origin}/de#website`, 'url': `${origin}/de` }]
    expect(check(graph).join('\n')).toContain('2 WebSite')
  })

  it('reports an Organization logo that is an SVG', () => {
    const graph = replace(homeGraph(), 'ImageObject', node => node['@id'] === `${origin}/#logo` ? { ...node, url: `${origin}/images/logo.svg` } : node)
    expect(check(graph).join('\n')).toContain('logo')
  })

  it('reports an Article without dateModified', () => {
    const graph = [...homeGraph(), without(articleNode(), 'dateModified')]
    expect(check(graph, 'article').join('\n')).toContain('dateModified')
  })

  it('reports an Article author without url', () => {
    const graph = [...homeGraph(), { ...articleNode(), author: [{ '@type': 'Person', 'name': 'TheMeinerLP' }] }]
    expect(check(graph, 'article').join('\n')).toContain('author')
  })

  it('accepts a complete Article', () => {
    expect(check([...homeGraph(), articleNode()], 'article')).toEqual([])
  })

  it('reports a ProfilePage whose mainEntity points at a missing node', () => {
    const graph = [...homeGraph(), { '@type': ['WebPage', 'ProfilePage'], '@id': `${origin}/en/team/x#webpage`, 'mainEntity': { '@id': personId } }]
    expect(check(graph, 'profile').join('\n')).toContain(personId)
  })

  it('reports a ProfilePage without mainEntity', () => {
    const graph = [...homeGraph(), { '@type': ['WebPage', 'ProfilePage'], '@id': `${origin}/en/team/x#webpage` }]
    expect(check(graph, 'profile').join('\n')).toContain('mainEntity')
  })

  it('accepts a ProfilePage whose mainEntity resolves to a Person', () => {
    const graph = [
      ...homeGraph(),
      { '@type': 'Person', '@id': personId, 'name': 'TheMeinerLP' },
      { '@type': ['WebPage', 'ProfilePage'], '@id': `${origin}/en/team/x#webpage`, 'mainEntity': { '@id': personId } }
    ]
    expect(check(graph, 'profile')).toEqual([])
  })

  it('reports an isPartOf that points at a missing node', () => {
    const graph = replace(homeGraph(), 'WebPage', node => ({ ...node, isPartOf: { '@id': `${origin}/en#website` } }))
    expect(check(graph).join('\n')).toContain(`${origin}/en#website`)
  })

  it('reports a primaryImageOfPage that is an SVG', () => {
    const graph = replace(homeGraph(), 'ImageObject', node => node['@id'] === `${origin}/en#primaryimage` ? { ...node, url: `${origin}/images/logo.svg` } : node)
    expect(check(graph).join('\n')).toContain('primaryImageOfPage')
  })
})

describe('checkRobotsAgreement', () => {
  it('accepts matching noindex signals', () => {
    expect(checkRobotsAgreement('noindex, follow', 'noindex, follow')).toBeNull()
  })

  it('accepts matching index signals', () => {
    expect(checkRobotsAgreement('index, follow', 'index, follow, max-snippet:-1')).toBeNull()
  })

  it('reports a meta noindex against an indexable header', () => {
    expect(checkRobotsAgreement('noindex, follow', 'index, follow')).toContain('noindex')
  })

  it('reports an indexable meta against a noindex header', () => {
    expect(checkRobotsAgreement('index, follow', 'noindex')).toContain('noindex')
  })

  it('treats a missing signal as indexable', () => {
    expect(checkRobotsAgreement('', null)).toBeNull()
  })
})
