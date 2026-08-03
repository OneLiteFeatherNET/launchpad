import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `repository.ts` states the architecture in prose: provider details live in
 * the adapter, while "domain logic (i18n resolution, release-date filtering,
 * sorting, SEO/hreflang assembly) intentionally stays in the composables … and
 * must not leak into adapters."
 *
 * Each list method then says which way it goes — "ordered by the `order` field
 * ascending" or "unfiltered, unsorted — caller decides". That doc comment is
 * the contract a second adapter would have to satisfy, so it is worth holding
 * the current one to it.
 *
 * Two of the three `.order()` calls are legitimate: the FAQ methods promise
 * ordering. `listBlogArticles` promises the opposite and sorts anyway — and by
 * `pubDate`, while `useBlogContent` re-sorts the same list by
 * `releaseDate ?? pubDate`. The database ordering is therefore not just
 * contract-breaking but answers a different question than the one that decides
 * what a reader sees.
 */

const CONTRACT = 'utils/content/repository.ts'
const ADAPTER = 'utils/content/nuxtContentAdapter.ts'

/** A doc comment immediately followed by a `listX(...)` signature. */
const DOCUMENTED_METHOD = /\/\*\*([\s\S]*?)\*\/\s*(list\w+)\s*\(/g
/** An adapter method body, up to the closing `},` of its object entry. */
const ADAPTER_METHOD = /^ {4}(\w+)\(locale[^)]*\)\s*\{([\s\S]*?)^ {4}\},/gm

const PROMISES_ORDER = /\border(?:ed|ing)\b/i
const PROMISES_NONE = /\bunsorted\b/i

function read(file: string): string {
  return readFileSync(`${repoRoot}/${file}`, 'utf8')
}

/** What each documented list method promises about ordering. */
function contract(): Map<string, 'ordered' | 'unsorted'> {
  const promises = new Map<string, 'ordered' | 'unsorted'>()
  for (const [, doc,
method] of read(CONTRACT).matchAll(DOCUMENTED_METHOD)) {
    if (PROMISES_NONE.test(doc!)) promises.set(method!, 'unsorted')
    else if (PROMISES_ORDER.test(doc!)) promises.set(method!, 'ordered')
  }
  return promises
}

/** Which adapter methods actually issue an ORDER BY. */
function ordersInAdapter(): Map<string, boolean> {
  const orders = new Map<string, boolean>()
  for (const [, method,
body] of read(ADAPTER).matchAll(ADAPTER_METHOD)) {
    orders.set(method!, /\.order\(/.test(body!))
  }
  return orders
}

describe('repository sort contract', () => {
  it('reads both sides', () => {
    // Without this, two empty maps would agree on everything.
    const promises = contract()
    expect(promises.size).toBeGreaterThan(3)
    expect(promises.get('listFaqEntries')).toBe('ordered')
    expect(promises.get('listBlogArticles')).toBe('unsorted')
    expect(promises.get('listCommunityPois')).toBe('unsorted')

    const orders = ordersInAdapter()
    expect(orders.size).toBeGreaterThan(3)
    expect(orders.get('listFaqEntries')).toBe(true)
    expect(orders.get('listCommunityPois')).toBe(false)
  })

  it('sorts exactly where the contract says it will', () => {
    const orders = ordersInAdapter()
    const broken: string[] = []
    for (const [method, promise] of contract()) {
      const sorts = orders.get(method)
      if (sorts === undefined) continue
      if (promise === 'ordered' && !sorts) broken.push(`${method} promises ordering and does not sort`)
      if (promise === 'unsorted' && sorts) broken.push(`${method} promises no ordering and sorts`)
    }
    expect(broken).toEqual([])
  })
})
