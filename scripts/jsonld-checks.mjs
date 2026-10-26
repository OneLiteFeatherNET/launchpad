/**
 * Content checks for a page's JSON-LD graph, as pure functions.
 *
 * `scripts/seo-check.mjs` feeds them the nodes it parses from the production
 * build; the unit tests feed them fixed graphs. Every function returns a list
 * of findings (strings), empty when the graph is fine.
 */

const asArray = (value) => (value === undefined || value === null ? [] : Array.isArray(value) ? value : [value])
const typesOf = (node) => asArray(node?.['@type'])
const hasType = (node, type) => typesOf(node).includes(type)
const isReference = (value) => value && typeof value === 'object' && Object.keys(value).length === 1 && '@id' in value
const isSvg = (url) => typeof url === 'string' && /\.svg(\?|#|$)/i.test(url)

/** The URL of an image given as a string, an ImageObject, or a reference to one. */
const imageUrl = (value, index) => {
  const resolved = isReference(value) ? index.get(value['@id']) : value
  return typeof resolved === 'string' ? resolved : resolved?.url ?? resolved?.contentUrl
}

const checkWebSite = (nodes, origin) => {
  const sites = nodes.filter((node) => hasType(node, 'WebSite'))
  if (sites.length !== 1) return [`graph has ${sites.length} WebSite nodes, expected 1`]
  const [site] = sites
  const findings = []
  if (site['@id'] !== `${origin}/#website`) findings.push(`WebSite @id is "${site['@id']}", expected "${origin}/#website"`)
  if (site.url !== `${origin}/`) findings.push(`WebSite url is "${site.url}", expected "${origin}/"`)
  if (site.name !== 'OneLiteFeather') findings.push(`WebSite name is "${site.name}", expected "OneLiteFeather"`)
  const alternates = asArray(site.alternateName)
  for (const expected of ['OneLiteFeather Network', 'onelitefeather.net', 'OLF']) {
    if (!alternates.includes(expected)) findings.push(`WebSite alternateName lacks "${expected}"`)
  }
  for (const key of ['translationOfWork', 'workTranslation']) {
    if (key in site) findings.push(`WebSite carries ${key}`)
  }
  return findings
}

const checkOrganization = (origin, index) => {
  const org = index.get(`${origin}/#identity`)
  if (!org) return [`graph has no Organization ${origin}/#identity`]
  const findings = []
  for (const key of ['name', 'url']) {
    if (!org[key]) findings.push(`Organization is missing ${key}`)
  }
  const logo = imageUrl(org.logo, index)
  if (!logo) findings.push('Organization logo does not resolve to an image')
  else if (isSvg(logo)) findings.push(`Organization logo is an SVG: ${logo}`)
  return findings
}

const checkArticle = (nodes, index) => {
  const articles = nodes.filter((node) => hasType(node, 'Article'))
  if (!articles.length) return ['page has no Article node']
  const findings = []
  for (const article of articles) {
    for (const key of ['headline', 'datePublished', 'dateModified', 'publisher']) {
      if (!article[key]) findings.push(`Article is missing ${key}`)
    }
    if (!asArray(article.image).length) findings.push('Article is missing image')
    const authors = asArray(article.author)
    if (!authors.length) findings.push('Article is missing author')
    for (const author of authors) {
      const person = isReference(author) ? index.get(author['@id']) : author
      if (!person?.name || !person?.url) findings.push(`Article author needs name and url: ${JSON.stringify(author)}`)
    }
  }
  return findings
}

const checkProfilePage = (nodes, index) => {
  const profiles = nodes.filter((node) => hasType(node, 'ProfilePage'))
  if (!profiles.length) return ['page has no ProfilePage node']
  const findings = []
  for (const profile of profiles) {
    const entity = asArray(profile.mainEntity)[0]
    if (!entity) {
      findings.push('ProfilePage is missing mainEntity')
      continue
    }
    const target = isReference(entity) ? index.get(entity['@id']) : entity
    if (!target || !hasType(target, 'Person')) {
      findings.push(`ProfilePage mainEntity does not resolve to a Person: ${entity['@id'] ?? JSON.stringify(entity)}`)
    }
  }
  return findings
}

const REFERENCE_KEYS = ['isPartOf', 'publisher', 'about', 'primaryImageOfPage', 'mainEntity']

const checkReferences = (nodes, index) => {
  const findings = []
  for (const node of nodes) {
    for (const key of REFERENCE_KEYS) {
      for (const value of asArray(node[key])) {
        if (isReference(value) && !index.has(value['@id'])) {
          findings.push(`${key} of ${node['@id'] ?? typesOf(node).join('/')} points at missing node ${value['@id']}`)
        }
      }
    }
    if (node.primaryImageOfPage && isSvg(imageUrl(node.primaryImageOfPage, index))) {
      findings.push(`primaryImageOfPage of ${node['@id']} is an SVG: ${imageUrl(node.primaryImageOfPage, index)}`)
    }
  }
  return findings
}

/**
 * @param {Array<Record<string, any>>} nodes every node of the page's JSON-LD
 * @param {{ origin: string, kind?: 'page' | 'article' | 'profile' }} context
 * @returns {string[]}
 */
export function checkGraph(nodes, { origin, kind = 'page' }) {
  const index = new Map(nodes.filter((node) => node['@id']).map((node) => [node['@id'], node]))
  return [
    ...checkWebSite(nodes, origin),
    ...checkOrganization(origin, index),
    ...(kind === 'article' ? checkArticle(nodes, index) : []),
    ...(kind === 'profile' ? checkProfilePage(nodes, index) : []),
    ...checkReferences(nodes, index)
  ]
}

const blocksIndexing = (value) => /\b(noindex|none)\b/i.test(value ?? '')

/**
 * The robots meta tag and the X-Robots-Tag header must agree on indexing.
 *
 * @param {string | null | undefined} meta content of `<meta name="robots">`
 * @param {string | null | undefined} header value of `X-Robots-Tag`
 * @returns {string | null} a finding, or null when both agree
 */
export function checkRobotsAgreement(meta, header) {
  if (blocksIndexing(meta) === blocksIndexing(header)) return null
  return `meta robots "${meta ?? ''}" and X-Robots-Tag "${header ?? ''}" disagree on noindex`
}
