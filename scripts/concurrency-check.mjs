#!/usr/bin/env node
/**
 * Concurrency gate.
 *
 * A Cloudflare Worker isolate serves many requests at once. Anything that
 * leaks per-request state into module scope (Vue's current instance, a
 * singleton Nuxt context) shows up only under parallel load: sequential
 * requests all pass. On 2026-09-23 production answered 40–60 % of requests
 * with `Cannot redefine property: $i18n` for exactly that reason, while every
 * existing check — all sequential — stayed green.
 *
 * Three checks, all against the same base URL:
 *
 *   1. Load: N requests spread over mixed routes with concurrency C. No
 *      response may have status >= 500.
 *   2. Locale isolation: /en/team and /de/team interleaved. Every response
 *      must carry the <html lang> and <title> of its own route.
 *   3. Content isolation: two different articles interleaved. Every response
 *      must match its own article's title, canonical and JSON-LD.
 *
 * Expected values for 2 and 3 are taken from one sequential request per route
 * before the parallel phase starts.
 *
 *   node scripts/concurrency-check.mjs                          # http://localhost:8787
 *   node scripts/concurrency-check.mjs --base https://... --concurrency 5 --requests 100
 */

import { createHash } from 'node:crypto'
import process from 'node:process'
import { load } from 'cheerio'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const idx = args.indexOf(`--${name}`)
  return idx >= 0 ? args[idx + 1] : fallback
}

const BASE = option('base', process.env.CONCURRENCY_CHECK_BASE_URL || 'http://localhost:8787')
const CONCURRENCY = Number(option('concurrency', 20))
const REQUESTS = Number(option('requests', 500))

/** @type {string[]} */
const failures = []
const fail = (message) => failures.push(message)

/**
 * Runs `tasks` with at most `limit` in flight at any time.
 * @template T
 * @param {Array<() => Promise<T>>} tasks
 * @param {number} limit
 * @returns {Promise<T[]>}
 */
const pool = async (tasks, limit) => {
  const results = new Array(tasks.length)
  let next = 0
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

const get = async (path) => {
  const res = await fetch(new URL(path, BASE), { redirect: 'manual' })
  return { path, status: res.status, body: await res.text() }
}

/** What must stay identical between a sequential and a parallel render. */
const signature = (html) => {
  const $ = load(html)
  const jsonLd = $('script[type="application/ld+json"]').map((_, el) => $(el).text()).get().join('\n')
  return {
    lang: $('html').attr('lang') || '',
    title: $('title').first().text().trim(),
    canonical: $('link[rel="canonical"]').attr('href') || '',
    jsonLd: createHash('sha256').update(jsonLd).digest('hex').slice(0, 12)
  }
}

const SIGNATURE_KEYS = ['lang',
'title',
'canonical',
'jsonLd']
const sameSignature = (a, b) => SIGNATURE_KEYS.every(key => a[key] === b[key])

/** First `count` distinct links under `prefix` found on `listPath`. */
const discover = async (listPath, prefix, count) => {
  const { status, body } = await get(listPath)
  if (status !== 200) throw new Error(`${listPath} answered ${status} during discovery: ${describeError(body)}`)
  const $ = load(body)
  const found = new Set()
  $('a[href]').each((_, el) => {
    const href = new URL($(el).attr('href'), BASE).pathname
    if (href.startsWith(prefix) && href.length > prefix.length) found.add(href)
  })
  if (found.size < count) throw new Error(`found ${found.size} links under ${prefix} on ${listPath}, need ${count}`)
  return [...found].slice(0, count)
}

/**
 * Sequential baseline, retried a few times: the thing under test may itself
 * fail the first request, and a failed baseline must not look like a failed
 * isolation check.
 */
const baseline = async (path) => {
  let last
  for (let attempt = 0; attempt < 10; attempt++) {
    last = await get(path)
    if (last.status === 200) return signature(last.body)
  }
  throw new Error(`${path} never answered 200 sequentially, last: ${last.status} ${describeError(last.body)}`)
}

const describeError = (body) => {
  try {
    return JSON.parse(body).message || body.slice(0, 120)
  } catch {
    const match = body.match(/Cannot [^<"]+/)
    return match ? match[0] : body.slice(0, 120).replace(/\s+/g, ' ')
  }
}

const main = async () => {
  console.log(`concurrency-check against ${BASE} (concurrency ${CONCURRENCY}, ${REQUESTS} requests)`)

  const [articleA, articleB] = await discover('/en/blog', '/en/blog/', 2)
  const [profile] = await discover('/en/team', '/en/team/', 1)
  const routes = [
    '/en',
    '/de',
    '/en/blog',
    '/de/team',
    articleA,
    profile
  ]

  // 1. Load.
  const loadTasks = Array.from({ length: REQUESTS }, (_, i) => () => get(routes[i % routes.length]))
  const load1 = await pool(loadTasks, CONCURRENCY)
  const errors = load1.filter(r => r.status >= 500)
  if (errors.length) {
    const reasons = {}
    for (const r of errors) {
      const reason = `${r.status} ${describeError(r.body)}`
      reasons[reason] = (reasons[reason] || 0) + 1
    }
    fail(`load: ${errors.length}/${load1.length} responses >= 500 — ${Object.entries(reasons).map(([k, v]) => `${v}× ${k}`).join('; ')}`)
  }

  // 2 + 3. Isolation.
  const isolationCase = async (label, paths) => {
    const baselines = await Promise.all(paths.map(async p => [p, await baseline(p)]))
    const expected = Object.fromEntries(baselines)
    const perPath = Math.max(1, Math.floor(REQUESTS / 2.5 / paths.length))
    const count = perPath * paths.length
    const tasks = Array.from({ length: count }, (_, i) => () => get(paths[i % paths.length]))
    const results = await pool(tasks, CONCURRENCY)
    let mismatches = 0
    let skipped = 0
    let example = ''
    for (const r of results) {
      // Status failures are already counted by the load check; isolation is
      // only meaningful on responses that rendered.
      if (r.status !== 200) {
        skipped++
        continue
      }
      const got = signature(r.body)
      if (!sameSignature(got, expected[r.path])) {
        mismatches++
        example ||= `${r.path} got ${JSON.stringify(got)}, expected ${JSON.stringify(expected[r.path])}`
      }
    }
    if (mismatches) fail(`${label}: ${mismatches}/${results.length - skipped} rendered responses carried another request's state — e.g. ${example}`)
    if (skipped) fail(`${label}: ${skipped}/${results.length} responses were not 200`)
  }

  await isolationCase('locale isolation', ['/en/team', '/de/team'])
  await isolationCase('content isolation', [articleA, articleB])

  if (failures.length) {
    for (const f of failures) console.error(`✗ ${f}`)
    process.exit(1)
  }
  console.log('✓ no errors and no cross-request state under concurrency')
}

main().catch((error) => {
  // Report what the earlier phases already found: an aborted run is usually
  // the consequence of a load failure, and that failure is the diagnosis.
  for (const f of failures) console.error(`✗ ${f}`)
  console.error(`✗ ${error.message}`)
  process.exit(1)
})
