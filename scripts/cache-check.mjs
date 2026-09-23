#!/usr/bin/env node
/**
 * Edge cache gate.
 *
 * The edge cache is steered by response headers alone (nuxt.config.ts
 * routeRules and server/plugins/*), so this checks those headers route by
 * route. Two modes, because Cloudflare strips `cloudflare-cdn-cache-control`
 * before a response leaves the edge:
 *
 * - default, against `pnpm preview:prod` (workerd, no edge in front): the
 *   directives themselves — content pages cacheable, `/` and errors never,
 *   no Set-Cookie on anything cacheable, hashed assets immutable.
 * - `--expect-hits`, against a deployment with Workers Cache enabled: what a
 *   visitor can observe — the second request for a page is a cache HIT, `/`
 *   and a 404 never are.
 *
 *   node scripts/cache-check.mjs                                  # http://localhost:8787
 *   node scripts/cache-check.mjs --base https://onelitefeather.net --expect-hits
 */

import process from 'node:process'

const args = process.argv.slice(2)
const baseIdx = args.indexOf('--base')
const BASE = (baseIdx >= 0 ? args[baseIdx + 1] : process.env.CACHE_CHECK_BASE_URL) || 'http://localhost:8787'
const EXPECT_HITS = args.includes('--expect-hits')

const EDGE = 'cloudflare-cdn-cache-control'
const CONTENT_PAGES = [
  '/en',
  '/de/team',
  '/en/blog'
]
const LEGAL_PAGES = ['/en/imprint', '/de/privacy']
const MISSING = '/en/blog/does-not-exist-cache-check'

/** @type {string[]} */
const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

const get = async (path, headers = {}) => {
  const res = await fetch(new URL(path, BASE), { redirect: 'manual', headers: { accept: 'text/html', ...headers } })
  await res.arrayBuffer()
  return res
}

const header = (res, name) => res.headers.get(name) || ''

async function checkDirectives() {
  const HOUR = 'max-age=3600, stale-while-revalidate=86400'
  const DAY = 'max-age=86400, stale-while-revalidate=86400'

  for (const path of CONTENT_PAGES) {
    const res = await get(path)
    const edge = header(res, EDGE)
    const browser = header(res, 'cache-control')
    check(res.status === 200, `${path}: status ${res.status}, expected 200`)
    check(edge === HOUR, `${path}: ${EDGE} is "${edge}", expected "${HOUR}"`)
    const revalidates = /max-age=0/.test(browser) && !/s-maxage/.test(browser)
    check(revalidates, `${path}: browser cache-control is "${browser}", expected max-age=0, no s-maxage`)
    check(!res.headers.has('set-cookie'), `${path}: sets a cookie on a cacheable response`)
  }

  for (const path of LEGAL_PAGES) {
    const edge = header(await get(path), EDGE)
    check(edge === DAY, `${path}: ${EDGE} is "${edge}", expected "${DAY}"`)
  }

  const root = await get('/')
  check(root.status === 302, `/: status ${root.status}, expected a language redirect`)
  check(header(root, EDGE) === 'no-store', `/: ${EDGE} is "${header(root, EDGE)}", expected no-store`)
  const location = header(await get('/', { cookie: 'i18n_redirected=de' }), 'location')
  check(location.endsWith('/de'), `/ with cookie de redirects to "${location}", expected /de`)

  const missing = await get(MISSING)
  const robots = header(missing, 'x-robots-tag')
  check(missing.status === 404, `${MISSING}: status ${missing.status}, expected 404`)
  check(header(missing, EDGE) === 'no-store', `${MISSING}: ${EDGE} is "${header(missing, EDGE)}", expected no-store`)
  check(/noindex/.test(robots), `${MISSING}: x-robots-tag is "${robots}", expected noindex`)

  const html = await (await fetch(new URL('/en', BASE))).text()
  const asset = html.match(/\/_nuxt\/[\w-]+\.js/)?.[0]
  check(Boolean(asset), '/en: no /_nuxt/ script found to check')
  if (asset) {
    const cacheControl = header(await get(asset), 'cache-control')
    const immutable = /immutable/.test(cacheControl) && /max-age=31536000/.test(cacheControl)
    check(immutable, `${asset}: cache-control is "${cacheControl}", expected max-age=31536000, immutable`)
  }
}

async function checkHits() {
  for (const path of CONTENT_PAGES) {
    await get(path)
    const second = await get(path)
    check(header(second, 'cf-cache-status') === 'HIT', `${path}: second request cf-cache-status is "${header(second, 'cf-cache-status')}", expected HIT`)
  }
  for (const path of ['/', MISSING]) {
    await get(path)
    const second = await get(path)
    check(header(second, 'cf-cache-status') !== 'HIT', `${path}: second request was served from cache`)
  }
}

const main = async () => {
  console.log(`cache-check against ${BASE}${EXPECT_HITS ? ' (expecting cache hits)' : ''}`)
  await (EXPECT_HITS ? checkHits() : checkDirectives())
  if (failures.length) {
    for (const f of failures) console.error(`✗ ${f}`)
    process.exit(1)
  }
  console.log('✓ cache headers as specified')
}

main().catch((error) => {
  console.error(`✗ ${error.message}`)
  process.exit(1)
})
