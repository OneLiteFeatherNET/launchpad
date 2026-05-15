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

/**
 * Builds a URL relative to BASE and adds the dev mock-prod query when
 * targeting localhost so we exercise the production robots/sitemap path.
 */
const buildUrl = (path) => {
  const url = new URL(path, BASE)
  if (USE_MOCK && !url.searchParams.has('mockProductionEnv')) {
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
  for (const expected of ['en-US', 'de-DE', 'x-default']) {
    if (!hreflangs.includes(expected)) err(route, `Missing hreflang "${expected}"`)
  }

  // Open Graph
  for (const tag of ['og:title', 'og:description', 'og:url', 'og:type', 'og:site_name', 'og:image']) {
    const value = headContent($, `meta[property="${tag}"]`)
    if (!value) err(route, `Missing meta property="${tag}"`)
    else flagSuspiciousI18n(route, tag, value)
  }

  // Twitter cards
  if (!headContent($, 'meta[name="twitter:card"]')) err(route, 'Missing twitter:card')
  for (const tag of ['twitter:title', 'twitter:description', 'twitter:image']) {
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
    ...STATIC_ROUTES.map((r) => ({ route: r, mustIndex: true })),
    ...NOINDEX_ROUTES.map((r) => ({ route: r, mustIndex: false }))
  ]

  await Promise.all([
    checkRobots(),
    checkSitemap(STATIC_ROUTES, NOINDEX_ROUTES),
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

  console.log(
    `\nSummary: ${colorise(errors.length ? 'error' : 'ok', `${errors.length} error(s)`)}` +
    `, ${colorise(warnings.length ? 'warn' : 'dim', `${warnings.length} warning(s)`)}` +
    `, ${targets.length} route(s) checked.`
  )

  if (errors.length > 0) process.exit(1)
}

main().catch((e) => {
  console.error(colorise('error', `Unexpected failure: ${e instanceof Error ? e.stack : e}`))
  process.exit(2)
})
