#!/usr/bin/env node
/**
 * SEO quality gate.
 *
 * Crawls a fixed set of routes plus every URL announced in the sitemap,
 * then asserts that each page ships the meta, social card, canonical,
 * hreflang and JSON-LD payload we expect. Also asserts that `/robots.txt`
 * advertises the sitemap and that pages marked `noindex` are absent from
 * the sitemap.
 *
 * The script auto-detects dev environments (localhost / 127.0.0.1) and
 * appends `?mockProductionEnv` to every request so @nuxtjs/seo emits its
 * production robots/sitemap responses instead of the dev no-index lock.
 *
 * Exits with a non-zero status when any expectation is violated so it can
 * be wired into CI as a blocking gate.
 *
 *   node scripts/seo-check.mjs                       # against http://localhost:3000
 *   node scripts/seo-check.mjs --base https://...    # against a remote env
 *   node scripts/seo-check.mjs --no-mock             # disable ?mockProductionEnv
 */

import { load } from 'cheerio'
import process from 'node:process'

const args = process.argv.slice(2)
const baseFlagIdx = args.indexOf('--base')
const BASE = (baseFlagIdx >= 0 ? args[baseFlagIdx + 1] : process.env.SEO_CHECK_BASE_URL)
  || 'http://localhost:3000'
const VERBOSE = args.includes('--verbose')
const FORCE_NO_MOCK = args.includes('--no-mock')
const IS_LOCAL = /localhost|127\.0\.0\.1/.test(BASE)
const USE_MOCK = !FORCE_NO_MOCK && IS_LOCAL

/** Routes that must exist and must be indexable. */
const STATIC_ROUTES = [
  '/en',
  '/de',
  '/en/blog',
  '/de/blog',
  '/en/bluemap',
  '/de/bluemap'
]

/** Routes that must exist but must explicitly opt out of indexing. */
const NOINDEX_ROUTES = [
  '/en/imprint',
  '/de/imprint',
  '/en/privacy',
  '/de/privacy'
]

/** The canonical origin every absolute SEO URL is written against. */
const SITE_ORIGIN = 'https://onelitefeather.net'

/**
 * Routes whose og:image is the site default served from public/, so the image
 * itself can be fetched from any build (see checkSocialImage).
 */
const FETCH_IMAGE_ROUTES = new Set([
  '/en',
  '/de',
  '/en/blog',
  '/de/blog'
])

const TITLE_MIN = 10
const TITLE_MAX = 70
const DESCRIPTION_MIN = 50
const DESCRIPTION_MAX = 200

// Patterns that look like raw i18n keys: lowercase dotted identifier with no
// whitespace (e.g. "seo.default_description"). Surfaces SSR translation gaps.
const I18N_KEY_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i

/** @type {Array<{ url: string, level: 'error' | 'warn', message: string }>} */
const findings = []
const record = (url, level, message) => findings.push({ url, level, message })
const err = (url, message) => record(url, 'error', message)
const warn = (url, message) => record(url, 'warn', message)

const colorise = (level, text) => {
  if (!process.stdout.isTTY) return text
  const codes = { error: '\x1b[31m', warn: '\x1b[33m', ok: '\x1b[32m', dim: '\x1b[2m' }
  return `${codes[level] || ''}${text}\x1b[0m`
}

// @nuxtjs/sitemap >= 7.5 serves an empty 204 (and a meta-refresh instead of a
// 307) whenever the sitemap endpoints are requested with *any* query string,
// so the mock-prod query must not be appended to sitemap URLs. The sitemap is
// environment-independent here anyway; only robots.txt and page meta need the
// production mock.
const isSitemapPath = (pathname) => /^\/(sitemap[^/]*\.xml|sitemap_index\.xml|__sitemap__\/)/i.test(pathname)

/**
 * Builds a URL relative to BASE and adds the dev mock-prod query when
 * targeting localhost so we exercise the production robots/sitemap path.
 */
const buildUrl = (path) => {
  const url = new URL(path, BASE)
  if (USE_MOCK && !isSitemapPath(url.pathname) && !url.searchParams.has('mockProductionEnv')) {
    url.searchParams.set('mockProductionEnv', '')
  }
  return url
}

const fetchRaw = async (path) => {
  const target = buildUrl(path).toString()
  const res = await fetch(target, { redirect: 'manual' })
  return {
    status: res.status,
    body: await res.text(),
    location: res.headers.get('location'),
    contentType: res.headers.get('content-type') || ''
  }
}

const fetchFollow = async (path) => {
  let current = path
  for (let i = 0; i < 5; i++) {
    const res = await fetchRaw(current)
    if (res.status >= 300 && res.status < 400 && res.location) {
      // Resolve relative redirects, strip duplicate mockProductionEnv since
      // buildUrl() will re-apply it.
      const next = new URL(res.location, buildUrl(current))
      next.searchParams.delete('mockProductionEnv')
      current = next.pathname + (next.search || '')
      continue
    }
    return { ...res, finalPath: current }
  }
  return { status: 0, body: '', location: null, contentType: '', finalPath: current }
}

const headContent = ($, selector) => {
  const node = $(selector).first()
  if (!node || node.length === 0) return null
  return (node.attr('content') ?? node.text() ?? '').trim() || null
}

const flagSuspiciousI18n = (route, label, value) => {
  if (!value) return
  if (I18N_KEY_PATTERN.test(value)) {
    err(route, `${label} looks like a raw i18n key, SSR is not translating: "${value}"`)
  }
}

const checkPage = async ({ route, mustIndex }) => {
  const res = await fetchFollow(route)
  if (res.status !== 200) {
    err(route, `HTTP ${res.status} (expected 200)`)
    return
  }
  const $ = load(res.body)

  // <title>
  const title = $('head > title').first().text().trim()
  if (!title) err(route, 'Missing <title>')
  else {
    flagSuspiciousI18n(route, '<title>', title.split('|')[0].trim())
    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      warn(route, `<title> length ${title.length} outside ${TITLE_MIN}-${TITLE_MAX}: "${title}"`)
    }
  }

  // Description
  const description = headContent($, 'meta[name="description"]')
  if (!description) {
    err(route, 'Missing <meta name="description">')
  } else {
    flagSuspiciousI18n(route, 'description', description)
    if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
      warn(route, `description length ${description.length} outside ${DESCRIPTION_MIN}-${DESCRIPTION_MAX}`)
    }
  }

  // Canonical
  const canonical = $('link[rel="canonical"]').first().attr('href')
  if (!canonical) err(route, 'Missing <link rel="canonical">')
  else if (!canonical.startsWith('http')) err(route, `Canonical not absolute: ${canonical}`)

  // hreflang — we expect at minimum en, de and x-default.
  const hreflangs = $('link[rel="alternate"][hreflang]').map((_, el) => $(el).attr('hreflang')).get()
  for (const expected of ['en-US',
'de-DE',
'x-default']) {
    if (!hreflangs.includes(expected)) err(route, `Missing hreflang "${expected}"`)
  }

  // Open Graph
  for (const tag of ['og:title',
'og:description',
'og:url',
'og:type',
'og:site_name',
'og:image']) {
    const value = headContent($, `meta[property="${tag}"]`)
    if (!value) err(route, `Missing meta property="${tag}"`)
    else flagSuspiciousI18n(route, tag, value)
  }

  // Twitter cards
  if (!headContent($, 'meta[name="twitter:card"]')) err(route, 'Missing twitter:card')
  for (const tag of ['twitter:title',
'twitter:description',
'twitter:image']) {
    const value = headContent($, `meta[name="${tag}"]`)
    if (!value) err(route, `Missing meta name="${tag}"`)
    else flagSuspiciousI18n(route, tag, value)
  }

  // Robots / indexability. Dev builds annotate the future-prod value via the
  // `data-production-content` attribute; prefer that so the check is stable
  // across environments.
  const robotsMetaNode = $('meta[name="robots"]').first()
  const robotsContent = (robotsMetaNode.attr('data-production-content') || robotsMetaNode.attr('content') || '')
    .toLowerCase()
  const isNoindex = robotsContent.split(',').map((s) => s.trim()).includes('noindex')
  if (mustIndex && isNoindex) {
    err(route, `robots forbids indexing: "${robotsContent}"`)
  }
  if (!mustIndex && !isNoindex) {
    err(route, `Page must be noindex but robots is "${robotsContent || '<missing>'}"`)
  }

  // JSON-LD presence + parseability
  const jsonLdBlocks = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).contents().text())
    .get()
  if (jsonLdBlocks.length === 0) err(route, 'No JSON-LD <script> block found')

  /** @type {Array<unknown>} */
  const parsed = []
  for (const [i, raw] of jsonLdBlocks.entries()) {
    try {
      const value = JSON.parse(raw)
      if (Array.isArray(value)) parsed.push(...value)
      else parsed.push(value)
    } catch (e) {
      err(route, `JSON-LD block #${i + 1} is not valid JSON: ${e instanceof Error ? e.message : e}`)
    }
  }

  const flatTypes = parsed.flatMap((node) => {
    if (!node || typeof node !== 'object') return []
    /** @type {any} */
    const obj = node
    const graph = Array.isArray(obj['@graph']) ? obj['@graph'] : [obj]
    return graph.map((g) => g?.['@type']).filter(Boolean).flat()
  })
  if (!flatTypes.length) err(route, 'No usable @type entries inside JSON-LD')

  // One WebSite, every node typed, every @id once. nuxt-schema-org and page
  // code both add nodes; a raw object next to a define*() helper used to
  // yield a second WebSite and an untyped WebPage on every page.
  const nodes = parsed.flatMap((node) => {
    /** @type {any} */
    const obj = node
    return Array.isArray(obj?.['@graph']) ? obj['@graph'] : [obj]
  }).filter((n) => n && typeof n === 'object')
  const webSites = nodes.filter((n) => [n['@type']].flat().includes('WebSite')).length
  if (webSites > 1) err(route, `JSON-LD has ${webSites} WebSite nodes, expected one`)
  for (const n of nodes.filter((n) => !n['@type'])) err(route, `JSON-LD node without @type: ${n['@id'] || JSON.stringify(n).slice(0, 80)}`)
  const ids = nodes.map((n) => n['@id']).filter(Boolean)
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) err(route, `JSON-LD @id appears twice: ${id}`)

  await checkSocialImage(route, $, { fetchImage: FETCH_IMAGE_ROUTES.has(route) })
}

/** Width and height of a PNG, read from its IHDR chunk. */
const pngSize = (bytes) => {
  const signature = [0x89,
0x50,
0x4E,
0x47]
  if (!signature.every((b, i) => bytes[i] === b)) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

/**
 * og:image must be absolute, and a large card needs a large image. The image
 * itself is fetched only for routes that use the site default from public/:
 * article and build images live behind the production image proxy and are
 * absent from a local build, so fetching them here would test the proxy, not
 * this repository.
 */
const checkSocialImage = async (route, $, { fetchImage }) => {
  const image = headContent($, 'meta[property="og:image"]')
  if (!image) return // missing tag is already reported above
  if (!/^https?:\/\//.test(image)) {
    err(route, `og:image is not absolute: ${image}`)
    return
  }
  const card = headContent($, 'meta[name="twitter:card"]')
  const declaredWidth = Number(headContent($, 'meta[property="og:image:width"]'))
  if (card === 'summary_large_image' && declaredWidth && declaredWidth < 1200) {
    err(route, `twitter:card summary_large_image with a ${declaredWidth}px wide og:image`)
  }
  if (!fetchImage) return

  const imageUrl = new URL(image)
  const servedLocally = IS_LOCAL && imageUrl.origin === SITE_ORIGIN
  const target = servedLocally ? new URL(imageUrl.pathname, BASE) : imageUrl
  const res = await fetch(target)
  if (res.status !== 200) {
    err(route, `og:image ${image} answered ${res.status}`)
    return
  }
  if (!(res.headers.get('content-type') || '').startsWith('image/')) {
    err(route, `og:image ${image} is served as ${res.headers.get('content-type')}`)
    return
  }
  const size = pngSize(new Uint8Array(await res.arrayBuffer()))
  if (size && card === 'summary_large_image' && (size.width < 1200 || size.height < 630)) {
    err(route, `og:image is ${size.width}×${size.height}, too small for summary_large_image`)
  }
}

/** A blog article must describe itself as one to social cards. */
const checkArticle = async () => {
  const overview = await fetchFollow('/en/blog')
  const path = load(overview.body)('a[href^="/en/blog/"]').first().attr('href')
  if (!path) {
    err('/en/blog', 'No article link found to check')
    return
  }
  await checkPage({ route: path, mustIndex: true })
  const $ = load((await fetchFollow(path)).body)
  const type = headContent($, 'meta[property="og:type"]')
  if (type !== 'article') err(path, `og:type is "${type}", expected "article"`)
  for (const tag of ['article:published_time', 'article:modified_time']) {
    if (!headContent($, `meta[property="${tag}"]`)) err(path, `Missing meta property="${tag}"`)
  }
}

/** An error page is not a version of any URL and must not be indexed. */
const checkErrorPage = async () => {
  const route = '/en/blog/does-not-exist-seo-check'
  const target = buildUrl(route).toString()
  const res = await fetch(target, { redirect: 'manual', headers: { accept: 'text/html' } })
  const $ = load(await res.text())
  if (res.status !== 404) err(route, `HTTP ${res.status} (expected 404)`)
  if (!/noindex/i.test(res.headers.get('x-robots-tag') || '')) err(route, 'Error response without X-Robots-Tag: noindex')
  if (!/noindex/i.test($('meta[name="robots"]').attr('content') || '')) err(route, 'Error page without <meta name="robots" content="noindex">')
  if ($('link[rel="canonical"]').length) err(route, 'Error page carries a canonical link')
  if ($('link[rel="alternate"][hreflang]').length) err(route, 'Error page carries hreflang links')
}

/** Tracking parameters must not leak into canonical, hreflang or og:url. */
const checkQueryVariant = async () => {
  const route = '/de/team?utm_source=seo-check&fbclid=abc'
  const res = await fetchFollow(route)
  const $ = load(res.body)
  const canonical = $('link[rel="canonical"]').attr('href') || ''
  if (canonical !== `${SITE_ORIGIN}/de/team`) err(route, `Canonical is "${canonical}", expected ${SITE_ORIGIN}/de/team`)
  const leaks = [
    ...$('link[rel="alternate"][hreflang]').map((_, el) => $(el).attr('href')).get(), headContent($, 'meta[property="og:url"]') || ''
  ].filter((href) => /utm_|fbclid/.test(href))
  for (const href of leaks) err(route, `Query string leaked into ${href}`)
}

/**
 * Every sitemap URL answers 200, and its alternates name the same URL per
 * language as the page's own hreflang links. Compared by primary language
 * (`de`, `en`, `x-default`): the page announces both `de` and `de-DE`, the
 * sitemap uses the region tags only, and both point at the same URL.
 */
const checkSitemapEntries = async () => {
  const index = load((await fetchRaw('/sitemap_index.xml')).body, { xmlMode: true })
  const children = index('sitemap > loc').map((_, el) => new URL(index(el).text().trim()).pathname).get()
  const primary = (tag) => tag.toLowerCase() === 'x-default' ? 'x-default' : tag.split('-')[0].toLowerCase()
  const byLanguage = (pairs) => Object.fromEntries(pairs.map(([tag, href]) => [primary(tag), href]))

  for (const child of children) {
    const xml = load((await fetchRaw(child)).body, { xmlMode: true })
    const entries = xml('url').map((_, el) => {
      const node = xml(el)
      return {
        loc: node.find('loc').first().text().trim(),
        alternates: node.find('xhtml\\:link').map((__, link) => [[xml(link).attr('hreflang'), xml(link).attr('href')]]).get()
      }
    }).get()

    await Promise.all(entries.map(async ({ loc, alternates }) => {
      const path = new URL(loc).pathname
      const res = await fetchRaw(path)
      if (res.status !== 200) {
        err(child, `${path} is in the sitemap but answered ${res.status}`)
        return
      }
      if (!alternates.length) return
      const $ = load(res.body)
      const page = byLanguage($('link[rel="alternate"][hreflang]').map((_, el) => [[$(el).attr('hreflang'), $(el).attr('href')]]).get())
      const listed = byLanguage(alternates)
      const languages = new Set([...Object.keys(page), ...Object.keys(listed)])
      for (const language of languages) {
        if (page[language] !== listed[language]) {
          err(child, `${path}: hreflang "${language}" is ${listed[language] || 'missing'} in the sitemap but ${page[language] || 'missing'} on the page`)
        }
      }
    }))
  }
}

const checkRobots = async () => {
  const route = '/robots.txt'
  const res = await fetchFollow(route)
  if (res.status !== 200) {
    err(route, `HTTP ${res.status} (expected 200)`)
    return
  }
  if (!/sitemap:/i.test(res.body)) err(route, 'Missing "Sitemap:" directive')
  // A blanket `Disallow: /` is only acceptable when we explicitly want to
  // exclude an entire environment. In prod-equivalent mode it should not appear.
  for (const line of res.body.split('\n')) {
    const trimmed = line.split('#')[0].trim()
    if (/^disallow:\s*\/\s*$/i.test(trimmed)) {
      err(route, 'Robots file disallows the entire site')
      break
    }
  }
}

const expandSitemapUrls = async (path) => {
  const res = await fetchFollow(path)
  if (res.status !== 200) {
    err(path, `HTTP ${res.status} (expected 200)`)
    return new Set()
  }
  const $ = load(res.body, { xmlMode: true })
  /** @type {Set<string>} */
  const urls = new Set()

  // sitemap index → recurse into each child sitemap
  const sitemapChildren = $('sitemap > loc').map((_, el) => $(el).text().trim()).get()
  if (sitemapChildren.length > 0) {
    for (const childUrl of sitemapChildren) {
      try {
        const childPath = new URL(childUrl).pathname
        const childUrls = await expandSitemapUrls(childPath)
        for (const u of childUrls) urls.add(u)
      } catch {
        err(path, `Sitemap child not a valid URL: ${childUrl}`)
      }
    }
    return urls
  }

  $('url > loc').map((_, el) => $(el).text().trim()).get().forEach((u) => {
    try {
      const p = new URL(u).pathname.replace(/\/$/, '') || '/'
      urls.add(p)
    } catch {
      err(path, `Sitemap entry not a valid URL: ${u}`)
    }
  })
  return urls
}

/**
 * The one sitemap request the rest of this gate deliberately never makes.
 *
 * `buildUrl()` suppresses `?mockProductionEnv` on sitemap paths, so nothing
 * here exercised a sitemap carrying a query string — the exact condition that
 * once turned child sitemaps into `204 No Content` on @nuxtjs/sitemap 7.6.0
 * and prompted a hand-written route shim. The shim is gone; this assertion is
 * what stands in its place, so a regression upstream is reported rather than
 * absorbed.
 */
/**
 * Every sitemap robots.txt announces must be the real thing.
 *
 * A directive pointing at a redirect is not a second sitemap, it is a hop —
 * and the two sources that write these lines (nuxt.config's `robots.sitemap`
 * and @nuxtjs/sitemap's own hook) cannot see each other, so a duplicate is
 * easy to reintroduce and invisible without asking the server.
 */
const checkRobotsSitemaps = async () => {
  const robots = await fetchRaw('/robots.txt')
  const declared = robots.body
    .split('\n')
    .map((line) => /^Sitemap:\s*(\S+)/i.exec(line)?.[1])
    .filter(Boolean)

  if (declared.length === 0) {
    err('/robots.txt', 'robots.txt declares no sitemap')
    return
  }

  for (const target of declared) {
    const res = await fetchRaw(new URL(target).pathname)
    if (res.status !== 200) {
      err('/robots.txt', `Declared sitemap ${target} answered ${res.status}, expected 200`)
    }
  }
}

const checkSitemapAcceptsQueryString = async () => {
  const index = await fetchRaw('/sitemap_index.xml')
  const child = load(index.body, { xmlMode: true })('sitemap > loc').first().text().trim()
  if (!child) return

  const path = `${new URL(child).pathname}?mockProductionEnv`
  const res = await fetchRaw(path)

  if (res.status !== 200) {
    err(path, `Sitemap with a query string returned ${res.status}, expected 200`)
    return
  }
  if (!res.body.includes('<loc>')) {
    err(path, 'Sitemap with a query string came back without a single <loc>')
  }
}

const checkSitemap = async (allowed, forbidden) => {
  const route = '/sitemap.xml'
  const paths = await expandSitemapUrls(route)
  if (paths.size === 0 && !findings.some((f) => f.url === route)) {
    err(route, 'Sitemap is empty')
  }

  for (const required of allowed) {
    const normalised = required.replace(/\/$/, '') || '/'
    if (!paths.has(normalised)) {
      err(route, `Indexable route "${required}" is missing from sitemap`)
    }
  }
  for (const forbiddenPath of forbidden) {
    const normalised = forbiddenPath.replace(/\/$/, '') || '/'
    if (paths.has(normalised)) {
      err(route, `Noindex route "${forbiddenPath}" leaked into sitemap`)
    }
  }
}

const main = async () => {
  console.log(colorise('ok', `→ Running SEO checks against ${BASE}`))
  if (USE_MOCK) console.log(colorise('dim', '  (dev mode: appending ?mockProductionEnv to every request)'))
  console.log('')

  /** @type {Array<{ route: string, mustIndex: boolean }>} */
  const targets = [
    ...STATIC_ROUTES.map((r) => ({ route: r, mustIndex: true })), ...NOINDEX_ROUTES.map((r) => ({ route: r, mustIndex: false }))
  ]

  await Promise.all([
    checkRobots(),
    checkSitemap(STATIC_ROUTES, NOINDEX_ROUTES),
    checkSitemapAcceptsQueryString(),
    checkRobotsSitemaps(),
    checkSitemapEntries(),
    checkArticle(),
    checkErrorPage(),
    checkQueryVariant(),
    ...targets.map((t) => checkPage(t))
  ])

  const errors = findings.filter((f) => f.level === 'error')
  const warnings = findings.filter((f) => f.level === 'warn')

  const grouped = new Map()
  for (const finding of findings) {
    if (!grouped.has(finding.url)) grouped.set(finding.url, [])
    grouped.get(finding.url).push(finding)
  }
  for (const [url, entries] of grouped) {
    const head = entries.some((e) => e.level === 'error') ? 'error' : 'warn'
    console.log(colorise(head, `\n${url}`))
    for (const entry of entries) {
      const tag = entry.level === 'error' ? '✗' : '⚠'
      console.log(`  ${colorise(entry.level, tag)} ${entry.message}`)
    }
  }
  if (VERBOSE && findings.length === 0) {
    for (const target of targets) console.log(colorise('ok', `✓ ${target.route}`))
  }

  console.log(`\nSummary: ${colorise(errors.length ? 'error' : 'ok', `${errors.length} error(s)`)}`
    + `, ${colorise(warnings.length ? 'warn' : 'dim', `${warnings.length} warning(s)`)}`
    + `, ${targets.length} route(s) checked.`)

  if (errors.length > 0) process.exit(1)
}

main().catch((e) => {
  console.error(colorise('error', `Unexpected failure: ${e instanceof Error ? e.stack : e}`))
  process.exit(2)
})
